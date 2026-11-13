import { reducedMotion } from '../chart';
import {
  clearFinished,
  estimatedWait,
  interarrival,
  lostProfit,
  mulberry32,
  newCounters,
  newCustomer,
  NUM_COUNTERS,
  route,
  type Counter,
  type Customer,
  type Policy,
} from './sim';

export interface QueueStats {
  served: number;
  balked: number;
  avgWait: number;
  lostProfit: number;
}

interface Dot {
  customer: Customer;
  x: number;
  y: number;
  alpha: number;
}

interface Options {
  canvas: HTMLCanvasElement;
  getPolicy: () => Policy;
  getRate: () => number;
  onStats?: (stats: QueueStats) => void;
}

const SIM_MINUTES_PER_SECOND = 0.75;

export function createQueueView({ canvas, getPolicy, getRate, onStats }: Options) {
  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) return { reset() {} };
  const ctx: CanvasRenderingContext2D = maybeCtx;

  const rng = mulberry32(Date.now() & 0xffff);
  let counters: Counter[] = newCounters();
  let dots: Dot[] = [];
  let simTime = 0;
  let nextArrival = 0;
  let nextId = 0;
  let stats: QueueStats = { served: 0, balked: 0, avgWait: 0, lostProfit: 0 };
  let waitSum = 0;

  let width = 0;
  let height = 0;
  let colors = readColors();
  let visible = false;
  let frame = 0;
  let lastTick = 0;
  let lastStats = 0;

  function readColors() {
    const style = getComputedStyle(canvas);
    const get = (name: string) => style.getPropertyValue(name).trim();
    return {
      dot: get('--s1'),
      bad: get('--bad'),
      line: get('--line'),
      surface: get('--surface-2'),
      muted: get('--muted'),
      text: get('--text'),
    };
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  const laneY = (index: number) => (height * (index + 1)) / (NUM_COUNTERS + 1);
  const tillX = () => width - 54;
  const radius = (customer: Customer) => 3.5 + (customer.cart / 40) * 5;

  function admit() {
    const customer = newCustomer(nextId++, nextArrival, rng);
    clearFinished(counters, customer.arrival);
    route(counters, customer, getPolicy()(counters, customer, rng), rng);
    if (customer.balked) {
      stats.balked++;
      stats.lostProfit += lostProfit(customer);
    } else {
      stats.served++;
      waitSum += customer.start - customer.arrival;
      stats.avgWait = waitSum / stats.served;
    }
    dots.push({ customer, x: -10, y: height / 2, alpha: 1 });
    nextArrival += interarrival(getRate(), rng);
  }

  function advance(seconds: number) {
    simTime += seconds * SIM_MINUTES_PER_SECOND;
    while (nextArrival <= simTime) admit();

    const ease = Math.min(1, seconds * 7);
    for (let lane = 0; lane < NUM_COUNTERS; lane++) {
      const line = dots
        .filter((d) => d.customer.counter === lane && !d.customer.balked && d.customer.finish > simTime)
        .sort((a, b) => a.customer.start - b.customer.start);
      const room = tillX() - 60;
      const gap = Math.min(20, room / Math.max(line.length, 1));
      line.forEach((dot, position) => {
        dot.x += (tillX() - 22 - position * gap - dot.x) * ease;
        dot.y += (laneY(lane) - dot.y) * ease;
      });
    }
    for (const dot of dots) {
      const { customer } = dot;
      if (customer.balked) {
        dot.x += (width * 0.18 - dot.x) * ease * 0.5;
        dot.y += (height + 20 - dot.y) * ease * 0.25;
        dot.alpha -= seconds * 0.9;
      } else if (customer.finish <= simTime) {
        dot.x += (width + 30 - dot.x) * ease * 0.6;
        dot.alpha -= seconds * 1.6;
      }
    }
    dots = dots.filter((d) => d.alpha > 0);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.font = '600 11px "Bricolage Grotesque Variable", sans-serif';
    ctx.textBaseline = 'middle';

    for (let lane = 0; lane < NUM_COUNTERS; lane++) {
      const y = laneY(lane);
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 6]);
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(tillX() - 8, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = colors.surface;
      ctx.strokeStyle = colors.line;
      ctx.beginPath();
      ctx.roundRect(tillX() - 6, y - 20, 46, 40, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.muted;
      ctx.textAlign = 'center';
      ctx.fillText(`#${lane + 1}`, tillX() + 17, y - 5);
      ctx.fillText(`${estimatedWait(counters[lane], simTime).toFixed(1)}m`, tillX() + 17, y + 9);
    }

    for (const dot of dots) {
      const { customer } = dot;
      ctx.globalAlpha = Math.max(0, dot.alpha);
      ctx.fillStyle = customer.balked ? colors.bad : colors.dot;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, radius(customer), 0, Math.PI * 2);
      ctx.fill();
      const inService = !customer.balked && customer.start <= simTime && customer.finish > simTime;
      if (inService) {
        const done = (simTime - customer.start) / (customer.finish - customer.start);
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius(customer) + 3.5, -Math.PI / 2, -Math.PI / 2 + done * Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function tick(now: number) {
    frame = 0;
    if (!visible || document.hidden) return;
    const seconds = Math.min(0.05, (now - lastTick) / 1000);
    lastTick = now;
    advance(seconds);
    draw();
    if (onStats && now - lastStats > 250) {
      lastStats = now;
      onStats({ ...stats });
    }
    frame = requestAnimationFrame(tick);
  }

  function play() {
    if (frame || reducedMotion()) return;
    lastTick = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function reset() {
    counters = newCounters();
    dots = [];
    simTime = 0;
    nextArrival = 0;
    waitSum = 0;
    stats = { served: 0, balked: 0, avgWait: 0, lostProfit: 0 };
    onStats?.({ ...stats });
    if (reducedMotion()) drawStill();
  }

  // With motion reduced, show one representative frame instead of animating.
  function drawStill() {
    for (let i = 0; i < 400; i++) advance(0.05);
    draw();
    onStats?.({ ...stats });
  }

  resize();
  new ResizeObserver(() => {
    resize();
    draw();
  }).observe(canvas);
  new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    if (visible) play();
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && visible) play();
  });
  document.addEventListener('themechange', () => {
    colors = readColors();
    draw();
  });
  if (reducedMotion()) drawStill();

  return { reset };
}
