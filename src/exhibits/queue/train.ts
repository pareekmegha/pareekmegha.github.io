import { greedyAction, qPolicy, shortestQueue, shortestWait, type QTable } from './policies';
import {
  clearFinished,
  copyStream,
  generateStream,
  mulberry32,
  newCounters,
  NUM_COUNTERS,
  reward,
  route,
  runEpisode,
  stateKey,
} from './sim';

export interface TrainRequest {
  episodes: number;
  customers: number;
  rate: number;
  evalRuns: number;
  seed: number;
}

export interface Comparison {
  meanDiff: number;
  p: number;
}

export interface TrainResult {
  table: [string, number[]][];
  states: number;
  meanReward: { rl: number; queue: number; wait: number };
  vsQueue: Comparison;
  vsWait: Comparison;
}

const LEARNING_RATE = 0.1;
const DISCOUNT = 0.9;
const EPSILON_END = 0.05;
const EPSILON_DECAY = 0.9995;
export const BLOCK = 250;

function row(table: QTable, key: string): number[] {
  let values = table.get(key);
  if (!values) {
    values = new Array<number>(NUM_COUNTERS).fill(0);
    table.set(key, values);
  }
  return values;
}

// Two-sided p from a paired t statistic. With hundreds of pairs the normal approximation is close.
function pairedTest(a: number[], b: number[]): Comparison {
  const diffs = a.map((v, i) => v - b[i]);
  const n = diffs.length;
  const meanDiff = diffs.reduce((s, v) => s + v, 0) / n;
  const variance = diffs.reduce((s, v) => s + (v - meanDiff) ** 2, 0) / (n - 1);
  const t = meanDiff / Math.sqrt(variance / n);
  const z = Math.abs(t) / Math.SQRT2;
  const k = 1 / (1 + 0.3275911 * z);
  const erfc =
    k * (0.254829592 + k * (-0.284496736 + k * (1.421413741 + k * (-1.453152027 + k * 1.061405429)))) * Math.exp(-z * z);
  return { meanDiff, p: erfc };
}

const mean = (values: number[]) => values.reduce((s, v) => s + v, 0) / values.length;

export function trainAndEvaluate(
  { episodes, customers, rate, evalRuns, seed }: TrainRequest,
  onBlock: (episode: number, avgWait: number) => void,
): TrainResult {
  const table: QTable = new Map();
  const explore = mulberry32(seed);
  let epsilon = 1;
  let blockWait = 0;

  for (let episode = 0; episode < episodes; episode++) {
    const stream = generateStream(customers, rate, mulberry32(seed + episode + 1));
    const serviceRng = mulberry32(seed + episode + 500_000);
    const counters = newCounters();
    let waitSum = 0;
    let served = 0;

    clearFinished(counters, stream[0].arrival);
    for (let i = 0; i < stream.length; i++) {
      const customer = stream[i];
      const values = row(table, stateKey(counters, customer));
      const action =
        explore() < epsilon ? Math.floor(explore() * NUM_COUNTERS) : greedyAction(values, NUM_COUNTERS, explore);

      route(counters, customer, action, serviceRng);
      if (!customer.balked) {
        waitSum += customer.start - customer.arrival;
        served++;
      }

      const next = stream[i + 1];
      if (next) {
        // The next state must be what the agent will actually see when the next customer arrives.
        clearFinished(counters, next.arrival);
        const bestNext = Math.max(...row(table, stateKey(counters, next)));
        values[action] += LEARNING_RATE * (reward(customer) + DISCOUNT * bestNext - values[action]);
      } else {
        // Last customer of the episode: no next state to bootstrap from.
        values[action] += LEARNING_RATE * (reward(customer) - values[action]);
      }
    }

    epsilon = Math.max(EPSILON_END, epsilon * EPSILON_DECAY);
    blockWait += served ? waitSum / served : 0;
    if ((episode + 1) % BLOCK === 0) {
      onBlock(episode + 1, blockWait / BLOCK);
      blockWait = 0;
    }
  }

  // Paired evaluation: every policy faces the same customers and the same service-time draws.
  const agent = qPolicy(table);
  const rl: number[] = [];
  const queue: number[] = [];
  const wait: number[] = [];
  for (let run = 0; run < evalRuns; run++) {
    const stream = generateStream(customers, rate, mulberry32(seed + 9_000_000 + run));
    rl.push(runEpisode(copyStream(stream), agent, run));
    queue.push(runEpisode(copyStream(stream), shortestQueue, run));
    wait.push(runEpisode(copyStream(stream), shortestWait, run));
  }

  return {
    table: [...table.entries()],
    states: table.size,
    meanReward: { rl: mean(rl), queue: mean(queue), wait: mean(wait) },
    vsQueue: pairedTest(rl, queue),
    vsWait: pairedTest(rl, wait),
  };
}
