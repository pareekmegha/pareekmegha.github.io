import { initLazyExhibits } from '../exhibits/lazy';

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function store(storage: 'local' | 'session', key: string, value: string): void {
  try {
    (storage === 'local' ? localStorage : sessionStorage).setItem(key, value);
  } catch {
    // Private windows can block storage; the choice still holds for this page.
  }
}

// Runs a DOM change inside a view transition when the browser supports it, so cards glide to new places.
function withMotion(change: () => void): void {
  if (reduced || !('startViewTransition' in document)) change();
  else document.startViewTransition(change);
}

function initTheme(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!button) return;
  const sync = () => {
    const dark = root.dataset.theme === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.textContent = dark ? 'Light' : 'Dark';
  };
  button.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    store('local', 'theme', root.dataset.theme);
    sync();
    document.dispatchEvent(new Event('themechange'));
  });
  sync();
}

function arrangeCards(): void {
  const lens = root.dataset.lens ?? 'all';
  for (const grid of document.querySelectorAll<HTMLElement>('[data-lens-grid]')) {
    const cards = [...grid.querySelectorAll<HTMLElement>('[data-card]')];
    const tag = grid.dataset.tag ?? '';
    const kind = grid.dataset.kind ?? '';
    const limit = Number(grid.dataset.limit ?? cards.length);
    const rank = (card: HTMLElement) => {
      const base = Number(card.dataset.order);
      if (lens === 'all') return base;
      const lensRank = card.getAttribute(`data-rank-${lens}`);
      // Projects outside this lens keep their usual order, after the relevant ones.
      return lensRank ? Number(lensRank) : 100 + base;
    };
    let shown = 0;
    cards
      .sort((a, b) => rank(a) - rank(b))
      .forEach((card, position) => {
        const matchesTag = !tag || (card.dataset.tags ?? '').split('|').includes(tag);
        card.style.order = String(position);
        const matchesKind = !kind || card.dataset.kind === kind;
        card.hidden = !matchesTag || !matchesKind || shown >= limit;
        if (!card.hidden) shown++;
      });
    const empty = grid.parentElement?.querySelector<HTMLElement>('[data-empty]');
    if (empty) empty.hidden = shown > 0;
  }
}

function initLens(): void {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-lens-pick]')];
  const sync = () => buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lensPick === root.dataset.lens)));

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const lens = button.dataset.lensPick ?? 'all';
      store('session', 'lens', lens);
      const url = new URL(location.href);
      if (lens === 'all') url.searchParams.delete('lens');
      else url.searchParams.set('lens', lens);
      history.replaceState(history.state, '', url);
      withMotion(() => {
        root.dataset.lens = lens;
        sync();
        arrangeCards();
      });
    });
  }

  // Topic and type filters work the same way: the chosen value is stored on the grid, then cards are re-arranged.
  for (const key of ['tag', 'kind'] as const) {
    const filterButtons = [...document.querySelectorAll<HTMLButtonElement>(`[data-${key}-pick]`)];
    for (const button of filterButtons) {
      button.addEventListener('click', () => {
        withMotion(() => {
          filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
          document.querySelectorAll<HTMLElement>('[data-lens-grid]').forEach((grid) => {
            grid.dataset[key] = button.getAttribute(`data-${key}-pick`) ?? '';
          });
          arrangeCards();
        });
      });
    }
  }

  sync();
  arrangeCards();
}

function initReveal(): void {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (reduced) {
    items.forEach((item) => item.classList.add('is-in'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  items.forEach((item) => observer.observe(item));
}

function initSkills(): void {
  const board = document.querySelector<HTMLElement>('[data-skills]');
  if (!board) return;
  const chips = [...board.querySelectorAll<HTMLElement>('[data-used]')];
  const proofs = [...board.querySelectorAll<HTMLElement>('[data-proof]')];
  const usedBy = (chip: HTMLElement) => (chip.dataset.used ?? '').split(' ').filter(Boolean);

  const clear = () => {
    board.classList.remove('is-filtering');
    [...chips, ...proofs].forEach((node) => node.classList.remove('is-hit'));
  };
  const showSkill = (chip: HTMLElement) => {
    clear();
    const used = usedBy(chip);
    if (used.length === 0) return;
    board.classList.add('is-filtering');
    chip.classList.add('is-hit');
    proofs.forEach((proof) => proof.classList.toggle('is-hit', used.includes(proof.dataset.proof ?? '')));
  };
  const showProof = (proof: HTMLElement) => {
    clear();
    board.classList.add('is-filtering');
    proof.classList.add('is-hit');
    chips.forEach((chip) => chip.classList.toggle('is-hit', usedBy(chip).includes(proof.dataset.proof ?? '')));
  };

  // Hover previews a skill; a click pins it so the highlight stays (and so it works on touch screens).
  let pinned: HTMLElement | null = null;
  const restore = () => (pinned ? showSkill(pinned) : clear());

  chips.forEach((chip) => {
    chip.addEventListener('pointerenter', () => showSkill(chip));
    chip.addEventListener('focus', () => showSkill(chip));
    chip.addEventListener('pointerleave', restore);
    chip.addEventListener('click', () => {
      pinned = pinned === chip ? null : chip;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === pinned)));
      restore();
    });
  });
  proofs.forEach((proof) => {
    proof.addEventListener('pointerenter', () => showProof(proof));
    proof.addEventListener('focus', () => showProof(proof));
    proof.addEventListener('pointerleave', restore);
  });
}

function initCopy(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
    const label = button.textContent;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? '');
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Press Ctrl+C to copy';
      }
      setTimeout(() => (button.textContent = label), 1800);
    });
  }
}

function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  const status = document.querySelector<HTMLElement>('[data-form-status]');
  if (!form || !status) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (submit) submit.disabled = true;
    status.textContent = 'Sending…';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!response.ok) throw new Error(String(response.status));
      form.reset();
      form.classList.add('is-sent');
      status.textContent = 'Thanks, your message is on its way to me.';
    } catch {
      status.textContent = 'That did not send. Please email me directly instead.';
    } finally {
      if (submit) submit.disabled = false;
    }
  });
}

// Fires on first load and again after every page transition, because each transition swaps in new elements.
document.addEventListener('astro:page-load', () => {
  initTheme();
  initLens();
  initReveal();
  initSkills();
  initCopy();
  initContactForm();
  initLazyExhibits();
});
