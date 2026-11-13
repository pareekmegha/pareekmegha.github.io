// Browser port of the rules in "Grocery RL.ipynb". Times are in minutes.

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const NUM_COUNTERS = 2;
export const PRICE_PER_ITEM = 4.58;
export const GROSS_MARGIN = 0.246;

export interface Customer {
  id: number;
  arrival: number;
  cart: number;
  cash: boolean;
  patience: number;
  counter: number;
  estWait: number;
  start: number;
  finish: number;
  balked: boolean;
}

export interface Counter {
  busyUntil: number;
  // Finish times of everyone still at this counter, including the one being served.
  finishes: number[];
}

export type Policy = (counters: Counter[], customer: Customer, rng: Rng) => number;

export function newCounters(): Counter[] {
  return Array.from({ length: NUM_COUNTERS }, () => ({ busyUntil: 0, finishes: [] }));
}

export function interarrival(rate: number, rng: Rng): number {
  return -Math.log(1 - rng()) / rate;
}

export function newCustomer(id: number, arrival: number, rng: Rng): Customer {
  return {
    id,
    arrival,
    cart: 1 + Math.floor(rng() * 40),
    cash: rng() < 0.5,
    patience: 5 + rng() * 10,
    counter: -1,
    estWait: 0,
    start: 0,
    finish: 0,
    balked: false,
  };
}

export function generateStream(count: number, rate: number, rng: Rng): Customer[] {
  const customers: Customer[] = [];
  let time = 0;
  for (let i = 0; i < count; i++) {
    time += interarrival(rate, rng);
    customers.push(newCustomer(i, time, rng));
  }
  return customers;
}

function serviceTime(customer: Customer, rng: Rng): number {
  let time = 40 / 60 + customer.cart * (3 / 60);
  if (customer.cash) time += 0.3;
  return time * (0.85 + rng() * 0.3);
}

export function clearFinished(counters: Counter[], now: number): void {
  for (const counter of counters) counter.finishes = counter.finishes.filter((f) => f > now);
}

export function estimatedWait(counter: Counter, now: number): number {
  return Math.max(0, counter.busyUntil - now);
}

export function route(counters: Counter[], customer: Customer, action: number, serviceRng: Rng): void {
  const chosen = counters[action];
  customer.counter = action;
  customer.estWait = estimatedWait(chosen, customer.arrival);
  if (customer.estWait > customer.patience) {
    customer.balked = true;
    return;
  }
  customer.start = Math.max(customer.arrival, chosen.busyUntil);
  customer.finish = customer.start + serviceTime(customer, serviceRng);
  chosen.busyUntil = customer.finish;
  chosen.finishes.push(customer.finish);
}

export function lostProfit(customer: Customer): number {
  return customer.cart * PRICE_PER_ITEM * GROSS_MARGIN;
}

// Reward the agent trains on: lost profit for a walk-out, otherwise the wait.
export function reward(customer: Customer): number {
  return customer.balked ? -lostProfit(customer) : -customer.estWait;
}

export function stateKey(counters: Counter[], customer: Customer): string {
  let key = '';
  for (const counter of counters) {
    const waitBucket = Math.min(Math.floor(estimatedWait(counter, customer.arrival) / 2), 5);
    key += `${counter.finishes.length}:${waitBucket}|`;
  }
  return key + (customer.cart <= 15 ? 0 : 1);
}

export function copyStream(stream: Customer[]): Customer[] {
  return stream.map((c) => ({ ...c }));
}

export function runEpisode(stream: Customer[], policy: Policy, serviceSeed: number): number {
  const counters = newCounters();
  const serviceRng = mulberry32(serviceSeed);
  const tieRng = mulberry32(serviceSeed + 7919);
  let total = 0;
  for (const customer of stream) {
    clearFinished(counters, customer.arrival);
    route(counters, customer, policy(counters, customer, tieRng), serviceRng);
    total += customer.balked ? -lostProfit(customer) : -(customer.start - customer.arrival);
  }
  return total;
}
