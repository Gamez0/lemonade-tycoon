# Goal / player value

Make every purchase and sale trustworthy and every day repeatable. The legacy scene mixes animation and rules and mislabels revenue as profit.

## Scope

Pure TypeScript preparation/selling/results state, deterministic customers/weather, per-cup recipe, stock purchasing/consumption, integer-cent accounting, satisfaction/reputation, next-day transitions. Node tests and PR checks. Existing code stays intact.

## Acceptance criteria

- Simulation imports no Phaser/browser code.
- Price, weather, recipe and reputation affect customer decisions with injected/seeded randomness.
- Purchases reject insufficient funds; invalid inputs and wrong-phase commands never partially mutate state.
- Sales consume the complete recipe plus a cup; insufficient ingredients cannot produce a sale or negative stock.
- Revenue, consumed costs, profit, purchase spend and cash change reconcile; no-sale satisfaction is absent, not NaN.
- Natural completion settles once; next day resets daily counters and keeps stock/cash/reputation.
- Tests cover accounting, zero stock, invalid inputs, deterministic replay, decision direction and multiple days.

Context: #25, #26, #37, #75. This issue does not close those legacy implementations automatically. Depends on #84.
