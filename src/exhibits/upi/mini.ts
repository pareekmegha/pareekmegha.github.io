import master from '../../data/upi/master.json';
import { drawChart, onResize, reducedMotion, type ChartSpec } from '../chart';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthX(iso: string): number {
  const [year, month] = iso.split('-').map(Number);
  return year + (month - 1) / 12;
}

// The home page teaser: only the average-payment line from the full UPI story.
export default function init(root: HTMLElement): void {
  const host = root.querySelector<HTMLElement>('[data-chart]');
  if (!host) return;
  const rows = master.filter((r) => r.p2m_vol_pct !== null);

  const draw = (animate: boolean) => {
    const spec: ChartSpec = {
      label: 'Average UPI payment in rupees, falling from 2020 to 2026',
      series: [
        {
          label: 'Average payment',
          color: 'var(--s1)',
          points: rows.map((r) => ({ x: monthX(r.month), y: r.avg_ticket })),
          endLabel: '₹1,238',
        },
      ],
      xDomain: [2020.25, 2026.75],
      yDomain: [1100, 2100],
      xTicks: [2021, 2022, 2023, 2024, 2025, 2026],
      yTicks: [1200, 1500, 1800, 2100],
      xFormat: (v) => String(v),
      yFormat: (v) => `₹${Math.round(v).toLocaleString('en-IN')}`,
      tipX: (x) => {
        const year = Math.floor(x + 1e-6);
        return `${MONTHS[Math.round((x - year) * 12)]} ${year}`;
      },
      height: window.innerWidth < 760 ? 230 : 300,
    };
    drawChart(host, spec, animate && !reducedMotion());
  };

  draw(true);
  onResize(host, () => draw(false));
}
