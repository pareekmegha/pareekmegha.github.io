---
title: UPI Payments Analysis
question: Why is India's average UPI payment shrinking?
summary: The average payment fell from ₹1,817 to ₹1,238. People aren't paying less. Small merchant payments just became most of the mix.
kind: Project
year: '2026'
hue: teal
art: coins
order: 1
lens:
  analytics: 1
  science: 2
  engineering: 3
tags: [Analysis, Forecasting, Statistics]
stack: [Python, Pandas, NumPy, statsmodels, SciPy, Matplotlib, D3]
stats:
  - value: '91'
    label: months of NPCI data
  - value: 4.0%
    label: forecast error at 12 months, against 8.5% for the best baseline
  - value: '145'
    label: apps after merging 343 raw names
links:
  - label: Open the full dashboard
    href: https://pareekmegha.github.io/upi-payments-analysis/
  - label: Code and findings on GitHub
    href: https://github.com/pareekmegha/upi-payments-analysis
method:
  - 343 raw app names merged into 145 canonical apps with a reviewable alias map
  - Fixed a parser that blanked values with thousands separators
  - Shares validated against published figures to within 0.1 to 0.6 pp
  - 8 models compared with a rolling-origin backtest
limits:
  - Only about 65 post-COVID months exist, so anything beyond roughly six months is trend extrapolation.
  - The forecast assumes the status quo. It does not model the 30% app share cap (deadline 31 Dec 2026) or the 0.4% merchant fee from 15 Oct 2026.
  - WhatsApp's onboarding-cap removal is not detectable in the data. That is absence of evidence, not evidence of no effect.
  - Per-bank app volumes could not be checked against an external source.
exhibit: upi
---

## What this is

An end-to-end analysis of India's UPI payments data from NPCI, April 2019 to October 2026: cleaning, statistics, time-series diagnostics, a 12-month forecast and an interactive dashboard.

## What else I found

- Growth is slowing steadily. Volume is up 23% on a year earlier, against 45% two years ago.
- The top of the market is stable. PhonePe and Google Pay hold about 80% of volume, and that share has not moved significantly.
- More banks going live does not mean more volume. The two rise together over time, but month to month they are almost unrelated (correlation of changes 0.19).
- Outside the top three apps, the challengers are splitting up, not consolidating into a new leader.
