import { scaleLinear } from 'd3-scale';
import { area, curveMonotoneX, line } from 'd3-shape';

const NS = 'http://www.w3.org/2000/svg';

export interface Point {
  x: number;
  y: number | null;
}

export interface Series {
  label: string;
  color: string;
  points: Point[];
  dashed?: boolean;
  thin?: boolean;
  endLabel?: string;
}

export interface Band {
  color: string;
  opacity: number;
  points: { x: number; lo: number; hi: number }[];
}

export interface ChartSpec {
  label: string;
  series: Series[];
  bands?: Band[];
  markers?: { x: number; label: string }[];
  xDomain: [number, number];
  yDomain: [number, number];
  xTicks: number[];
  yTicks: number[];
  xFormat: (v: number) => string;
  yFormat: (v: number) => string;
  tipX?: (v: number) => string;
  height: number;
}

function svgEl<K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs: Record<string, string | number>,
  parent?: Element,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  parent?.appendChild(node);
  return node;
}

export function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function drawChart(host: HTMLElement, spec: ChartSpec, animate: boolean): void {
  const width = Math.max(280, Math.round(host.clientWidth));
  const hasEndLabels = spec.series.some((s) => s.endLabel);
  const m = { top: 14, right: hasEndLabels ? 78 : 14, bottom: 26, left: 46 };
  const innerW = width - m.left - m.right;
  const innerH = spec.height - m.top - m.bottom;

  const x = scaleLinear().domain(spec.xDomain).range([0, innerW]);
  const y = scaleLinear().domain(spec.yDomain).range([innerH, 0]);

  host.replaceChildren();
  host.style.position = 'relative';

  const svg = svgEl('svg', {
    width,
    height: spec.height,
    viewBox: `0 0 ${width} ${spec.height}`,
    role: 'img',
    'aria-label': spec.label,
    class: 'chart',
  });
  const g = svgEl('g', { transform: `translate(${m.left},${m.top})` }, svg);

  for (const t of spec.yTicks) {
    svgEl('line', { x1: 0, x2: innerW, y1: y(t), y2: y(t), class: 'chart-grid' }, g);
    const label = svgEl('text', { x: -8, y: y(t), dy: '0.32em', 'text-anchor': 'end', class: 'chart-tick' }, g);
    label.textContent = spec.yFormat(t);
  }
  for (const t of spec.xTicks) {
    const label = svgEl('text', { x: x(t), y: innerH + 18, 'text-anchor': 'middle', class: 'chart-tick' }, g);
    label.textContent = spec.xFormat(t);
  }

  for (const band of spec.bands ?? []) {
    const shape = area<{ x: number; lo: number; hi: number }>()
      .x((d) => x(d.x))
      .y0((d) => y(d.lo))
      .y1((d) => y(d.hi))
      .curve(curveMonotoneX);
    svgEl(
      'path',
      { d: shape(band.points) ?? '', fill: band.color, 'fill-opacity': band.opacity, class: animate ? 'chart-fade' : '' },
      g,
    );
  }

  for (const marker of spec.markers ?? []) {
    svgEl('line', { x1: x(marker.x), x2: x(marker.x), y1: 0, y2: innerH, class: 'chart-marker' }, g);
    // Flip the label to the left of the line when it would run off the right edge (about 6.7px per character).
    const nearRight = x(marker.x) + 6 + marker.label.length * 6.7 > innerW + m.right;
    const label = svgEl(
      'text',
      {
        x: x(marker.x) + (nearRight ? -6 : 6),
        y: 10,
        'text-anchor': nearRight ? 'end' : 'start',
        class: 'chart-marker-label',
      },
      g,
    );
    label.textContent = marker.label;
  }

  const path = line<Point>()
    .defined((d) => d.y !== null)
    .x((d) => x(d.x))
    .y((d) => y(d.y ?? 0))
    .curve(curveMonotoneX);

  for (const s of spec.series) {
    const attrs: Record<string, string | number> = {
      d: path(s.points) ?? '',
      fill: 'none',
      stroke: s.color,
      'stroke-width': s.thin ? 1.5 : 2.25,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    };
    if (s.dashed) {
      attrs['stroke-dasharray'] = '5 5';
      attrs.class = animate ? 'chart-fade' : '';
    } else if (animate) {
      attrs.pathLength = 1;
      attrs.class = 'chart-draw';
    }
    svgEl('path', attrs, g);

    const last = [...s.points].reverse().find((p) => p.y !== null);
    if (s.endLabel && last && last.y !== null) {
      svgEl('circle', { cx: x(last.x), cy: y(last.y), r: 3, fill: s.color }, g);
      const label = svgEl(
        'text',
        { x: x(last.x) + 8, y: y(last.y), dy: '0.32em', fill: s.color, class: 'chart-end-label' },
        g,
      );
      label.textContent = s.endLabel;
    }
  }

  const rule = svgEl('line', { y1: 0, y2: innerH, class: 'chart-rule', visibility: 'hidden' }, g);
  host.appendChild(svg);

  const tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.hidden = true;
  host.appendChild(tip);

  const xs = spec.series[0]?.points.map((p) => p.x) ?? [];
  const nearest = (points: Point[], target: number): Point | undefined =>
    points.reduce<Point | undefined>(
      (best, p) => (best === undefined || Math.abs(p.x - target) < Math.abs(best.x - target) ? p : best),
      undefined,
    );

  svg.addEventListener('pointermove', (event) => {
    const box = svg.getBoundingClientRect();
    const target = x.invert(event.clientX - box.left - m.left);
    const snapped = xs.reduce((best, v) => (Math.abs(v - target) < Math.abs(best - target) ? v : best), xs[0] ?? 0);
    rule.setAttribute('x1', String(x(snapped)));
    rule.setAttribute('x2', String(x(snapped)));
    rule.setAttribute('visibility', 'visible');

    tip.replaceChildren();
    const head = document.createElement('strong');
    head.textContent = (spec.tipX ?? spec.xFormat)(snapped);
    tip.appendChild(head);
    for (const s of spec.series) {
      const p = nearest(s.points, snapped);
      if (!p || p.y === null || Math.abs(p.x - snapped) > 0.05) continue;
      const row = document.createElement('span');
      const dot = document.createElement('i');
      dot.style.background = s.color;
      row.append(dot, `${s.label}: ${spec.yFormat(p.y)}`);
      tip.appendChild(row);
    }
    tip.hidden = false;
    const left = m.left + x(snapped);
    tip.style.left = `${Math.min(Math.max(left, 70), width - 70)}px`;
  });
  svg.addEventListener('pointerleave', () => {
    rule.setAttribute('visibility', 'hidden');
    tip.hidden = true;
  });
}

export function onResize(host: HTMLElement, redraw: () => void): void {
  let lastWidth = host.clientWidth;
  new ResizeObserver(() => {
    if (host.clientWidth === lastWidth) return;
    lastWidth = host.clientWidth;
    redraw();
  }).observe(host);
}
