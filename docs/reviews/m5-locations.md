# M5 locations, rent and progression — 2026-10-08

The user explicitly deferred physical internet-disconnection, DPI and clean Windows/
no-Node verification to before release and authorized M5 development. Those M4 gates
remain open; this change does not infer M2 visual acceptance or Steam readiness.

## Implemented behavior

- Five working tabs now include Rent. The free Neighborhood, Riverside Park and
  Downtown have original scenes and thumbnails generated from the actual textures.
  Browsing preserves the active scene. Locked locations show costs and requirements;
  confirming/cancelling a reservation changes no cash or inventory. Pending supply
  orders require BUY/CANCEL first. Returning to the Neighborhood is free.
- Park: 3 completed days, $45 cumulative revenue, 55% local satisfaction; $2/day,
  $1 move-in, 1.25 traffic, .95 budget, 2/2/1 customer weights, 24-tick patience.
  Downtown: 7 days, $120 revenue, 65% satisfaction; $5/day, $3 move-in, 1.5 traffic,
  1.25 budget, 1/3/1 weights, 12-tick patience and 3-tick arrivals. Unlocks persist.
- Start day checks production and funds atomically, charges rent/moving once and
  freezes traffic/budget/customer mix/timings/local ratings in an opening snapshot.
  The saved preparation checkpoint includes paid costs. Reload/replay does not pay
  again. Location changes become available after finishing that day. No automatic
  reset or save deletion: unaffordable rent suggests free return, bankruptcy keeps
  export and the existing confirmed New business flow.
- Each location tracks satisfaction separately; completed sales update it and feed
  popularity, which affects future traffic. No-sales days preserve both ratings.
  Costs are distinct from ingredient consumption and supply purchases in daily and
  cumulative reports. Pitcher production and overnight ice melt remain intact.
- Save v3 migrates v0/v1/v2 historical cash/stock/seed/recipe/revenue/cost without
  replaying old business. Unknown locations, duplicate or unearned unlocks, invalid
  ratings/rules, inconsistent paid fees, progression or contracts reject import.
  Portable web/native JSON and backup protection are retained.

## Review and corrections

The first browser pass found a selector collision: the app's current-location
attribute matched Rent's button selector. Scoped selection to buttons, fixing current
selection styling and test strictness. Added Rent to the established breakpoint
regression; its initial content moved Start day by 19px. Shortened labels and reduced
thumbnail height, then rechecked stationary actions rather than weakening the test.
Native UI covers all five tabs at 1100×850, 800×600 and 1280×720.

Reviewed paid snapshot replay, one-time moving fees, preservation of completed history,
per-location feedback, old cup-model costs, anonymous test storage and release asset
exclusion. Added validators/regressions for unearned unlocks and contract lineage.
No parent worktree, actual user save or prior manual test business is modified.

## Initial strategy comparison

Run `npm test` then `node scripts/m5-balance.cjs` to reproduce the comparison. Four
seeds (0, 42, 2026, 4294967295), 30 days per seed per strategy, five prices and two
recipes: 3,600 simulated business days. Each starts from an earned eight-day business;
the opening move-in fee is included. Forecast recipes adapt ice to temperature.

| Location | Forecast recipe, $1.75: profit across 120 days | Forecast recipe, $2.75 | Best tested price |
| --- | ---: | ---: | ---: |
| Neighborhood | $5,538.89 | $2,945.25 | $1.75 |
| Park | $6,591.32 | $2,875.52 | $1.75 |
| Downtown | $4,669.78 | $7,113.33 | $2.75 |

At $1.75 the park outperforms Downtown; at $2.75 Downtown benefits from its higher
budgets. Neighborhood has no fixed costs and stays available when paid rent cannot
be covered. This finite price/recipe/seed sample supports distinct initial strategies;
it is not a claim of global optimum or completed human balance testing. M8 playtests
still need to assess unlock speed and longer-term difficulty.

## Validation and next action

Commands: `npm test`, `npm run test:release`, `npm run typecheck`, `npm run lint:reboot`,
`npm run build-nolog`, `npm run test:browser`, `npm run desktop:package:win`, then with
`LEMONADE_DESKTOP_EXE` set run `test:desktop`, `test:desktop:locations` and
`test:desktop:ui`. The new native regression imports an earned web business, reserves
Downtown, closes/reopens, kills the isolated EXE after an actual sale, verifies the
paid checkpoint and exact replay result, exports, returns free and migrates v2.
All tests use disposable user-data directories.

Final results and exact source revision are recorded in `docs/cloud-work.md` and the
PR metadata after the final build/checks. M5 implementation can proceed to M6 after
self-review and current-head CI; physical offline/DPI/clean-PC checks remain release
requirements. User visual acceptance of M2 and Steam external checks stay open.

Final local results: **32/32** unit/save/location tests, **3/3** release tests,
strict typecheck and zero-warning reboot lint, web build and **15/15** browser tests
passed. The final desktop build passed its six-file asset audit, then all three
packaged native suites passed, including **15 tab/size combinations** and paid
Downtown replay after an actual partial sale. Automated sessions are closed.
