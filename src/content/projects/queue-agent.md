---
title: Checkout Queue Routing Agent
question: Can a self-taught agent run the checkout better than a simple rule?
summary: I built a grocery checkout simulation from scratch and trained a Q-learning agent to route customers. Sometimes it wins. I report when it doesn't.
kind: Project
hue: plum
art: trolley
order: 3
lens:
  science: 1
  ai: 3
  analytics: 4
tags: [Simulation, Reinforcement learning, Statistics]
stack: [Python, NumPy, SciPy, Matplotlib]
stats:
  - value: '3'
    label: bugs caught that would have changed the conclusion
  - value: p = 0.0002
    label: agent beats shortest-queue under steady arrivals
  - value: 30,000
    label: training episodes in the longest run
links:
  - label: Notebook on GitHub
    href: https://github.com/Megha9306/Grocery-Checkout-Queue-Simulation-RL-Routing-Agent
limits:
  - Simulation only. Service times, patience and arrivals are modelled, not fit to real point-of-sale data.
  - Tabular Q-learning needs manual state buckets, which caps how rich the state can get.
  - Two counters and two arrival scenarios, not a full sweep.
  - The live demo on this page is a browser re-implementation of the notebook's rules. The table reports the notebook's results. Training is stochastic, so a run in your browser can land on a win, a tie or occasionally a loss against shortest-queue.
exhibit: queue
---

## How it works

Customers arrive at a store, get sent to one of the checkout counters, and may walk out without buying if the wait looks longer than their patience. The agent is rewarded for short waits and penalised by the profit lost when someone leaves, so it learns to protect the larger carts and not only to shorten the line.

## What I took from it

Under steady arrivals the agent learns something neither rule can: it trades wait time against cart value. Under rush-hour arrivals, more training closes the gap to one rule but not the other, which suggests that live wait estimates are a strong baseline and not something a small table can easily beat.
