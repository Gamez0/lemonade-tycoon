# Goal / player value

Ship a single complete playable screen where players can prepare, watch a day, learn from results and try again.

## Scope

New Phaser presentation and accessible DOM controls, original reference-driven pixel stand/street/customer animation, forecast, inventory, recipe/price, purchases, results, next day and restart. Reboot becomes default with preserved legacy entry. README and art register, browser smoke tests and CI.

## Acceptance criteria

- Real controls reach every step in docs/game-design.md's MVP loop.
- Opening locks preparation; walking customers visibly buy or decline; money/stock reflect simulation events.
- Results include sales, revenue, costs, profit, cash movement and satisfaction; next day works at least three times.
- Stock/funds errors and a deliberate new-business path are visible.
- Screen uses original stand/street/customer/walk/wait/buy/drink/HUD assets matching docs/art-assets.md.
- Desktop/narrow layout works; browser smoke has no uncaught errors or missing assets.
- Typechecks, simulation tests, lint, production build and browser checks pass; self-review recorded before merge.
- Legacy files/assets and Draft #83 remain preserved.

Depends on #84 and simulation issue. Save/load and content expansion are outside this milestone.
