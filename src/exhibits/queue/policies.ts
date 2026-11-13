import { estimatedWait, stateKey, type Policy } from './sim';

export type QTable = Map<string, number[]>;

export const shortestQueue: Policy = (counters) => {
  let best = 0;
  for (let i = 1; i < counters.length; i++) {
    if (counters[i].finishes.length < counters[best].finishes.length) best = i;
  }
  return best;
};

export const shortestWait: Policy = (counters, customer) => {
  let best = 0;
  for (let i = 1; i < counters.length; i++) {
    if (estimatedWait(counters[i], customer.arrival) < estimatedWait(counters[best], customer.arrival)) best = i;
  }
  return best;
};

export function greedyAction(values: number[] | undefined, numActions: number, random: () => number): number {
  if (!values) return Math.floor(random() * numActions);
  const max = Math.max(...values);
  const ties = values.flatMap((v, i) => (v === max ? [i] : []));
  return ties[Math.floor(random() * ties.length)];
}

export function qPolicy(table: QTable): Policy {
  return (counters, customer, rng) => greedyAction(table.get(stateKey(counters, customer)), counters.length, rng);
}
