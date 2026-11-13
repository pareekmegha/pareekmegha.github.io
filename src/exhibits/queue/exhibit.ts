import { drawChart, type Point } from '../chart';
import { qPolicy, shortestQueue, shortestWait, type QTable } from './policies';
import type { Policy } from './sim';
import type { Comparison, TrainRequest } from './train';
import type { TrainMessage } from './train.worker';
import { createQueueView } from './view';

const TRAINING: Omit<TrainRequest, 'seed'> = { episodes: 8000, customers: 60, rate: 1.4, evalRuns: 500 };

function verdict(c: Comparison): string {
  const p = c.p < 0.0001 ? 'p < 0.0001' : `p = ${c.p.toFixed(4)}`;
  const outcome = c.p >= 0.05 ? 'Tie' : c.meanDiff > 0 ? 'RL wins' : 'RL loses';
  return `${outcome} (${c.meanDiff >= 0 ? '+' : ''}${c.meanDiff.toFixed(2)}, ${p})`;
}

export default function init(root: HTMLElement): void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-canvas]');
  const trainButton = root.querySelector<HTMLButtonElement>('[data-train]');
  const status = root.querySelector<HTMLElement>('[data-train-status]');
  const bar = root.querySelector<HTMLElement>('[data-progress]');
  const curveHost = root.querySelector<HTMLElement>('[data-curve]');
  const result = root.querySelector<HTMLElement>('[data-result]');
  if (!canvas || !trainButton || !status || !bar || !curveHost || !result) return;

  const policies: Record<string, Policy> = { queue: shortestQueue, wait: shortestWait };
  let policyName = 'queue';
  let rate = 1.4;

  const stat = (name: string) => root.querySelector<HTMLElement>(`[data-stat="${name}"]`);
  const view = createQueueView({
    canvas,
    getPolicy: () => policies[policyName] ?? shortestQueue,
    getRate: () => rate,
    onStats: (s) => {
      const total = s.served + s.balked;
      stat('served')!.textContent = String(s.served);
      stat('balked')!.textContent = total ? `${((s.balked / total) * 100).toFixed(1)}%` : '0%';
      stat('wait')!.textContent = `${s.avgWait.toFixed(2)} min`;
      stat('lost')!.textContent = `$${s.lostProfit.toFixed(0)}`;
    },
  });

  const group = (attr: string, onPick: (value: string) => void) => {
    const buttons = [...root.querySelectorAll<HTMLButtonElement>(`[${attr}]`)];
    for (const button of buttons) {
      button.addEventListener('click', () => {
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        onPick(button.getAttribute(attr) ?? '');
        view.reset();
      });
    }
  };
  group('data-policy', (value) => (policyName = value));
  group('data-rate', (value) => (rate = Number(value)));

  const drawCurve = (points: Point[]) => {
    const ys = points.map((p) => p.y ?? 0);
    const lo = Math.floor(Math.min(...ys) * 2) / 2;
    const hi = Math.max(lo + 0.5, Math.ceil(Math.max(...ys) * 2) / 2);
    drawChart(
      curveHost,
      {
        label: 'Average customer wait per training block, falling as the agent learns',
        series: [{ label: 'Avg wait', color: 'var(--s1)', points }],
        xDomain: [0, TRAINING.episodes],
        yDomain: [lo, hi],
        xTicks: [0, 2000, 4000, 6000, 8000],
        yTicks: [lo, (lo + hi) / 2, hi],
        xFormat: (v) => (v === 0 ? '0' : `${v / 1000}k`),
        yFormat: (v) => `${v.toFixed(1)}m`,
        tipX: (v) => `Episode ${v}`,
        height: 170,
      },
      false,
    );
  };

  trainButton.addEventListener('click', () => {
    trainButton.disabled = true;
    status.textContent = 'Training in your browser…';
    const points: Point[] = [];
    const worker = new Worker(new URL('./train.worker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = (event: MessageEvent<TrainMessage>) => {
      const message = event.data;
      if (message.type === 'progress') {
        points.push({ x: message.episode, y: message.avgWait });
        bar.style.width = `${(message.episode / TRAINING.episodes) * 100}%`;
        if (points.length > 1) drawCurve(points);
        return;
      }
      worker.terminate();
      const table: QTable = new Map(message.table);
      policies.rl = qPolicy(table);
      const cell = (name: string) => result.querySelector<HTMLElement>(`[data-r="${name}"]`)!;
      cell('rl').textContent = message.meanReward.rl.toFixed(1);
      cell('queue').textContent = message.meanReward.queue.toFixed(1);
      cell('wait').textContent = message.meanReward.wait.toFixed(1);
      cell('vsQueue').textContent = verdict(message.vsQueue);
      cell('vsWait').textContent = verdict(message.vsWait);
      result.hidden = false;
      status.textContent = `Done. ${message.states.toLocaleString()} states visited. The agent is now selectable above.`;
      trainButton.textContent = 'Train again';
      trainButton.disabled = false;
      root.querySelector<HTMLButtonElement>('[data-policy="rl"]')?.removeAttribute('disabled');
    };
    worker.onerror = () => {
      status.textContent = 'Training could not start in this browser.';
      trainButton.disabled = false;
    };
    // A fresh seed each time: training is stochastic and the outcome should be allowed to differ.
    const request: TrainRequest = { ...TRAINING, seed: Math.floor(Math.random() * 1_000_000) };
    worker.postMessage(request);
  });
}
