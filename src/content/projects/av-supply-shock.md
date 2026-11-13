---
title: AV Supply Shock Simulation
question: What happens to your wait when the robotaxis leave?
summary: A 20% cut in vehicle supply raises rider waits by roughly 35% to 55%, and the late-night hours take the worst of it.
kind: Project
year: '2026'
hue: coral
art: taxi
order: 2
lens:
  analytics: 2
  science: 4
tags: [Analysis, Simulation, Regression]
stack: [Python, Pandas, NumPy, statsmodels, SciPy, Matplotlib]
stats:
  - value: 14.4M
    label: NYC Uber trips analysed
  - value: 4.2 → 1.3 GB
    label: memory after optimising the data
  - value: 0.037 → 0.339
    label: R² after adding time of day and borough
links:
  - label: Notebook and write-up on GitHub
    href: https://github.com/Megha9306/uber-av-supply-shock-simulation
method:
  - 6,170 zone-hour rows built from trip records
  - Time-of-day buckets plus borough fixed effects
  - Wait scales with (demand ÷ supply)², weighted by each hour's existing tightness
limits:
  - NYC is a proxy. Phoenix trip-level data is not public.
  - Supply is never observed directly. It is inferred from wait times and a stated elasticity of 2.0.
  - The shock size and the severity weighting are assumptions, not estimates.
  - A first attempt used a regression coefficient and predicted waits falling as demand rose. That coefficient captured correlation with organic supply, not a causal effect, so the simulation was rebuilt to hold supply fixed.
  - The chart on this page applies the notebook formula to hourly averages for the Staten Island proxy, so values can differ slightly from the zone-level results.
exhibit: shock
---

## The question

In late June 2026, Uber and Waymo ended their autonomous vehicle partnership in Phoenix. Part of the city's driverless capacity left Uber's platform overnight. What does a sudden loss like that do to rider wait times, and does it hit every hour of the day equally?

Phoenix ride data isn't public, so I used New York City's public rideshare data as a proxy to build and test the method.

## What it means

A uniform percentage loss of supply does not produce a uniform rider experience. The hours that are already short of drivers carry a larger share of the damage. So the response should be targeted by time of day: driver incentives or repositioning for the overnight hours first, where there is the least slack.
