import { drawChart, onResize, reducedMotion, type ChartSpec } from '../chart';

// Hourly mean wait in seconds for the Staten Island proxy, copied from
// uber-supply-shock-portfolio.html in the project repository.
const BASELINE = [423, 423, 432, 430, 438, 427, 375, 376, 332, 308, 291, 305, 305, 315, 344, 320, 311, 324, 327, 326, 361, 353, 388, 435];
const ELASTICITY = 2.0;
const MEAN = BASELINE.reduce((a, b) => a + b, 0) / BASELINE.length;

const isNight = (hour: number) => hour <= 4 || hour >= 21;
const isMidday = (hour: number) => hour >= 10 && hour <= 15;

// Same rule as the notebook: the shock scales with how tight each hour already is, clipped to 5%..35%.
function shockedWait(baseline: number, shock: number): number {
  const effective = Math.min(0.35, Math.max(0.05, shock * (baseline / MEAN)));
  return baseline * (1 + effective) ** ELASTICITY;
}

const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

export default function init(root: HTMLElement): void {
  const host = root.querySelector<HTMLElement>('[data-chart]');
  const input = root.querySelector<HTMLInputElement>('[data-slider]');
  const bars = root.querySelector<HTMLElement>('[data-bars]');
  const outShock = root.querySelector<HTMLElement>('[data-out="shock"]');
  const outNight = root.querySelector<HTMLElement>('[data-out="night"]');
  const outMidday = root.querySelector<HTMLElement>('[data-out="midday"]');
  if (!host || !input || !bars || !outShock || !outNight || !outMidday) return;

  const barEls = BASELINE.map((_, hour) => {
    const bar = document.createElement('div');
    bar.className = isNight(hour) ? 'bar is-night' : 'bar';
    bars.appendChild(bar);
    return bar;
  });

  const render = (animate: boolean) => {
    const shock = Number(input.value) / 100;
    const shocked = BASELINE.map((w) => shockedWait(w, shock));
    const pct = BASELINE.map((w, h) => ((shocked[h] - w) / w) * 100);

    const spec: ChartSpec = {
      label: `Average rider wait by hour of day, baseline and after a ${input.value}% supply cut`,
      series: [
        { label: 'Baseline', color: 'var(--ink-line)', points: BASELINE.map((y, x) => ({ x, y })), thin: true, endLabel: 'Now' },
        { label: 'After cut', color: 'var(--s1)', points: shocked.map((y, x) => ({ x, y })), endLabel: 'After' },
      ],
      bands: [{ color: 'var(--s1)', opacity: 0.14, points: BASELINE.map((lo, x) => ({ x, lo, hi: shocked[x] })) }],
      xDomain: [0, 23],
      yDomain: [200, 850],
      xTicks: [0, 4, 8, 12, 16, 20, 23],
      yTicks: [300, 450, 600, 750],
      xFormat: (v) => `${String(v).padStart(2, '0')}:00`,
      yFormat: (v) => `${Math.round(v)}s`,
      height: window.innerWidth < 760 ? 240 : 320,
    };
    drawChart(host, spec, animate && !reducedMotion());

    const maxPct = 85;
    barEls.forEach((bar, hour) => {
      bar.style.height = `${Math.min(100, (pct[hour] / maxPct) * 100)}%`;
      bar.title = `${String(hour).padStart(2, '0')}:00  +${pct[hour].toFixed(0)}%`;
    });

    outShock.textContent = `${input.value}%`;
    outNight.textContent = `+${mean(pct.filter((_, h) => isNight(h))).toFixed(0)}%`;
    outMidday.textContent = `+${mean(pct.filter((_, h) => isMidday(h))).toFixed(0)}%`;
  };

  input.addEventListener('input', () => render(false));
  onResize(host, () => render(false));
  render(true);
}
