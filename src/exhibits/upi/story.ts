import brandShare from '../../data/upi/brand_share.json';
import forecast from '../../data/upi/forecast.json';
import master from '../../data/upi/master.json';
import { drawChart, onResize, reducedMotion, type ChartSpec, type Point } from '../chart';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthX(iso: string): number {
  const [year, month] = iso.split('-').map(Number);
  return year + (month - 1) / 12;
}

function monthLabel(x: number): string {
  const year = Math.floor(x + 1e-6);
  const month = Math.round((x - year) * 12);
  return `${MONTHS[month]} ${year}`;
}

const yearTick = (v: number) => String(v);
const rupees = (v: number) => `₹${Math.round(v).toLocaleString('en-IN')}`;

function volumeSpec(height: number): ChartSpec {
  return {
    label: 'Monthly UPI volume in billions of transactions, April 2019 to October 2026',
    series: [
      {
        label: 'Volume',
        color: 'var(--s1)',
        points: master.map((r) => ({ x: monthX(r.month), y: r.vol_bn })),
        endLabel: '25.5 bn',
      },
    ],
    xDomain: [2019.25, 2026.75],
    yDomain: [0, 28],
    xTicks: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
    yTicks: [0, 5, 10, 15, 20, 25],
    xFormat: yearTick,
    yFormat: (v) => `${v} bn`,
    tipX: monthLabel,
    height,
  };
}

function ticketSpecs(height: number): ChartSpec[] {
  const rows = master.filter((r) => r.p2m_vol_pct !== null);
  const shared = {
    xDomain: [2020.25, 2026.75] as [number, number],
    xTicks: [2021, 2022, 2023, 2024, 2025, 2026],
    xFormat: yearTick,
    tipX: monthLabel,
    height: Math.round(height / 2),
  };
  return [
    {
      ...shared,
      label: 'Average UPI payment in rupees, falling from 2020 to 2026',
      series: [
        {
          label: 'Average payment',
          color: 'var(--s1)',
          points: rows.map((r) => ({ x: monthX(r.month), y: r.avg_ticket })),
          endLabel: '₹1,238',
        },
      ],
      yDomain: [1100, 2100],
      yTicks: [1200, 1500, 1800, 2100],
      yFormat: rupees,
    },
    {
      ...shared,
      label: 'Merchant payments as a share of UPI volume, rising from 2020 to 2026',
      series: [
        {
          label: 'Merchant share of volume',
          color: 'var(--s2)',
          points: rows.map((r) => ({ x: monthX(r.month), y: r.p2m_vol_pct })),
          endLabel: '63.2%',
        },
      ],
      yDomain: [35, 68],
      yTicks: [40, 50, 60],
      yFormat: (v) => `${v}%`,
    },
  ];
}

function shareSpec(height: number): ChartSpec {
  const brand = (name: string): Point[] =>
    brandShare.filter((r) => r.brand === name).map((r) => ({ x: monthX(r.month), y: r.share_pct }));
  return {
    label: 'UPI app market share by brand, June 2020 to September 2026',
    series: [
      { label: 'PhonePe', color: 'var(--muted-line)', points: brand('PhonePe'), thin: true, endLabel: 'PhonePe' },
      { label: 'Google Pay', color: 'var(--muted-line)', points: brand('Google Pay'), thin: true, endLabel: 'Google Pay' },
      { label: 'Navi', color: 'var(--s2)', points: brand('Navi'), thin: true, endLabel: 'Navi' },
      { label: 'Paytm', color: 'var(--s1)', points: brand('Paytm'), endLabel: 'Paytm' },
    ],
    markers: [{ x: 2024 + 1 / 24, label: 'RBI restricts Paytm Payments Bank' }],
    xDomain: [2020.4, 2026.7],
    yDomain: [0, 52],
    xTicks: [2021, 2022, 2023, 2024, 2025, 2026],
    yTicks: [0, 10, 20, 30, 40, 50],
    xFormat: yearTick,
    yFormat: (v) => `${v}%`,
    tipX: monthLabel,
    height,
  };
}

function forecastSpec(height: number): ChartSpec {
  const actual = master.filter((r) => r.month >= '2023-01-01').map((r) => ({ x: monthX(r.month), y: r.vol_bn }));
  const join = actual[actual.length - 1];
  const joinY = join.y;
  return {
    label: 'UPI monthly volume, actual from 2023 and a 12-month forecast with 80% and 95% intervals',
    series: [
      { label: 'Actual', color: 'var(--ink-line)', points: actual },
      {
        label: 'Forecast',
        color: 'var(--s1)',
        dashed: true,
        points: [join, ...forecast.map((r) => ({ x: monthX(r.month), y: r.vol_bn }))],
        endLabel: '28.9 bn',
      },
    ],
    bands: [
      {
        color: 'var(--s1)',
        opacity: 0.14,
        points: [
          { x: join.x, lo: joinY, hi: joinY },
          ...forecast.map((r) => ({ x: monthX(r.month), lo: r.vol_bn_lo95, hi: r.vol_bn_hi95 })),
        ],
      },
      {
        color: 'var(--s1)',
        opacity: 0.22,
        points: [
          { x: join.x, lo: joinY, hi: joinY },
          ...forecast.map((r) => ({ x: monthX(r.month), lo: r.vol_bn_lo80, hi: r.vol_bn_hi80 })),
        ],
      },
    ],
    markers: [{ x: join.x, label: 'Forecast starts' }],
    xDomain: [2023, 2027.8],
    yDomain: [6, 32],
    xTicks: [2023, 2024, 2025, 2026, 2027],
    yTicks: [10, 15, 20, 25, 30],
    xFormat: yearTick,
    yFormat: (v) => `${v} bn`,
    tipX: monthLabel,
    height,
  };
}

const CAPTIONS = [
  'Monthly UPI transactions (billions)',
  'Top: average payment (₹). Bottom: merchant payments as a share of volume',
  'Share of UPI app volume (%)',
  'Monthly UPI transactions (billions), actual and forecast',
];

export default function init(root: HTMLElement): void {
  const host = root.querySelector<HTMLElement>('[data-chart]');
  const caption = root.querySelector<HTMLElement>('[data-caption]');
  const steps = [...root.querySelectorAll<HTMLElement>('[data-step]')];
  if (!host || !caption || steps.length === 0) return;

  let current = -1;

  const draw = (index: number, animate: boolean) => {
    const height = window.innerWidth < 760 ? 250 : 380;
    host.replaceChildren();
    const specs =
      index === 0
        ? [volumeSpec(height)]
        : index === 1
          ? ticketSpecs(height)
          : index === 2
            ? [shareSpec(height)]
            : [forecastSpec(height)];
    for (const spec of specs) {
      const panel = document.createElement('div');
      host.appendChild(panel);
      drawChart(panel, spec, animate && !reducedMotion());
    }
    caption.textContent = CAPTIONS[index];
    steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const index = Number((entry.target as HTMLElement).dataset.step);
        if (index !== current) {
          current = index;
          draw(index, true);
        }
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  steps.forEach((step) => observer.observe(step));

  current = 0;
  draw(0, true);
  onResize(host, () => draw(current, false));
}
