type ExhibitModule = { default: (root: HTMLElement) => void };

const loaders: Record<string, () => Promise<ExhibitModule>> = {
  'upi-mini': () => import('./upi/mini'),
  upi: () => import('./upi/story'),
  shock: () => import('./shock/slider'),
  queue: () => import('./queue/exhibit'),
};

// Each exhibit's code is fetched only when its section is about to scroll into view.
export function initLazyExhibits(): void {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const root = entry.target as HTMLElement;
        observer.unobserve(root);
        const load = loaders[root.dataset.exhibit ?? ''];
        load?.().then((module) => module.default(root));
      }
    },
    { rootMargin: '300px 0px' },
  );
  document.querySelectorAll<HTMLElement>('[data-exhibit]').forEach((root) => observer.observe(root));
}
