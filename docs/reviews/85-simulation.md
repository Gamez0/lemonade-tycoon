# Deterministic day simulation

Adds a headless preparation → selling → results → next-day loop. Stock purchases and sales use integer cents, complete per-cup ingredient consumption and explicit phase guards. Weather, recipe, price, customer budget and reputation shape demand. Immutable snapshots keep presentation callbacks out of accounting.

Validation: `npm test` compiles simulation/content under strict TypeScript and runs Node tests for atomic purchases, invalid plans, phase guards, demand direction, sale-by-sale accounting, missing stock, no buyers, seeded replay, ten-day rollover and 200 seeded day invariants. Legacy browser code is unchanged. Updated the stale npm lockfile so clean CI installation includes the already-declared lint dependencies.

Self-review checklist: phase ownership, stock bounds, zero ice, no-sale satisfaction, one-time settlement, cash-flow versus accrual profit, snapshot aliasing, repeat-day reset, deterministic randomness and no Phaser dependency. Remaining scope: UI/art/browser validation in #86; tuning beyond initial values follows playtesting. Legacy TypeScript findings remain isolated until the entrypoint split.

Closes #85. Depends on #87 / #84.
