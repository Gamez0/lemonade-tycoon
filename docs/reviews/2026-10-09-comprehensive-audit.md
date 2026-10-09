# Comprehensive player-driven audit — 2026-10-09

Scope: review the shipped alpha7 Windows game, current simulation/presentation/
storage code and original Windows reference material. Preserve the classic green
layout and player-approved first-pitcher/immediate-refill/free-ice rules. Fix
demonstrated defects; do not silently expand the frozen three-location scope.

## Original evidence revisited

Directly downloaded and viewed the same Windows reference set:

- [Recipe screenshot](https://games-cdn.softpedia.com/screenshots/Lemonade-Tycoon_6.jpg): separate pitcher ingredients and cup ice; 4 lemons/3 sugar/2 ice displays12 cups per pitcher. Date, forecast, notice, compact controls and scene remain visible.
- [Selling screenshot](https://games-cdn.softpedia.com/screenshots/Lemonade-Tycoon_8.jpg): at zero cups sold,12 prepared cups are already present. Preparation tabs are dimmed; performance/settings and speed/SKIP share a fixed frame. This directly supports the player's eager-opening rule implemented in alpha7.
- [Result screenshot](https://games-cdn.softpedia.com/screenshots/Lemonade-Tycoon_9.jpg): finances, missed sales, recipe response and melted ice share a compact report. Feedback is tied to actual causes rather than universally blaming price.

The [PC FAQ by jubeik9](https://gamefaqs.gamespot.com/pc/930814-lemonade-tycoon/faqs/57197)
was recovered through indexed search after direct fetching was restricted. It
describes the seven tabs, an open-ended career, quantity-discounted supplies,
location differences, notices, equipment and daily staff/advertising. It also
describes perishable lemons and ice. Its strategy recommendations and exploits
are not verified engine formulas. No original executable or continuous video
timing was run; exact production/queue/weather constants remain unverified.

Differences remain explicit: our three locations, three equipment families with
two levels, fixed daily weather, flat unit supply prices, no lemon spoilage and
ice-preserving refrigerator are existing approved simplifications. Original
bundles/ten locations/thirteen equipment choices/events and concentration tuning
are not retroactively claimed implemented. Adding those would change progression,
inventory valuation and old saves; this audit preserves the current roadmap and
accounts rather than copying unverified constants or introducing overhead fees.

## Findings and changes

| Finding | Reproduction / impact | Correction |
| --- | --- | --- |
| Newer primary overwritten through older backup | A primary with version999 and a valid current backup is loaded as recovered; startup then replaces the newer file | Distinguish a genuinely newer schema from damage. Sync/async readers reject it before fallback. Primary/backup remain unchanged through edits/normal close. Ordinary malformed metadata still recovers a good backup. |
| Import omitted from normal-close flush and write serialization | File.text is pending when close returns the old save queue; direct import writes also bypass that queue | Track the whole import, serialize its write, pause editing/business ticks and wait for import plus writes on normal close. Errors unlock the UI without replacing the active business. |
| Prepared-day report pushes START DAY outside panel | Actual downloaded alpha7 fails the new containment test at1100x850 after one completed day | Apply result flex sizing to both phases; omit redundant preparation cost/capacity rows while viewing reports. Keep opening/warnings accessible and report rows visible without scroll. |
| Impossible sales remain in a service queue | Buyers join/service despite zero cups, and the remaining line persists after the last available sale | Resolve new/existing stock-out buyers immediately; preserve distinct price/passed/wait events, unique settlements and SKIP equivalence. |
| Zero-sale feedback always blames price | Actual seed67800, rainy day, price25 cents, recipe6/1/7:32 passers, zero price refusals; old report says lower the minimum legal price | Choose advice from shortages/waits/price refusals/poor recipe/low traffic and always retain actual missed-sale counts. |
| Hardcoded year and stale cross-tab errors | UI always says Year1 even in the1600-day supported save; old input error occupies unrelated report space | Show the true cumulative business day without inventing a calendar. Dismiss transient feedback on tab change; preserve invalid value/ARIA state and revalidate opening. |

## Review coverage

- Model: opening readiness/fees, all-or-nothing checkout, pitcher/cup boundaries,
  immediate refill, depleted stock, no buyers, free ice provenance, closing,
  overnight ice, bankruptcy/recovery, rent/unlocks and management effects.
- Queue: arrival/service/patience order, every ID settled once, existing line on
  depletion, normal and partial SKIP equivalence and bounded finishing.
- Persistence: schema/history/capital/cash validation, v0-v6 migration, paid replay,
  primary/backup writes and errors, future files, import/export/close ordering.
- Presentation: first-day and established-business tabs, daily/ledger during
  preparation and results, selling, opening/next buttons, full-map contain fit,
  inputs/errors, typography, native client sizes and supported renderer scales.
- Integration: renderer isolation/save bridge/atomic file replacement, audio
  resume and reduced motion, real30-day native campaign,1600-day save, CI/package
  checksum/source identity. Existing suites are rerun against the final package.

## Evidence and self-review

Before fixes, new sync/async future-primary and impossible-queue tests failed.
Downloaded alpha7 fails strict opening-panel containment with completed history.
The delayed-import browser regression fails the old production build. Local
simulation52/52 now passes, including3072 recipe/weather/management combinations
with inventory/cash/free-ice conservation and opening/results/next-day save
roundtrips. New native preparation/history checks pass at100/125/150/175/200%.
Additional browser feedback and actual-native delayed-close regressions are
included in final validation; do not infer their final CI from earlier runs.

Self-review: schema stays v6; no repricing old accounts, new spoilage/storage
restrictions or electricity fees. A malformed/missing schema is still recoverable;
a recognizable newer primary is protected. Import failures cannot poison the
save queue. The view marker uses data-view, preserving data-page exclusively for
navigation buttons; an initial selector collision was caught and corrected by
native tests. Forced renderer scale is not physical-DPI/clean-PC acceptance.

Next: final browser/all-native current-head CI, merge, exact-main alpha8 draft,
downloaded-package verification and old->new/current-web upgrade rehearsal.
Existing user-owned PR83/parent worktree and deferred external gates stay intact.

### Small-client CI follow-up

The first Windows CI run exposed a 683x465 client at 150% where browser narrow-screen stacking overlapped native scaling. Desktop layout now explicitly retains two columns, a single footer row, and compact settings spacing. Native checks also cover 683x465 and 512x350, completed-history daily/ledger views, maximized/fullscreen results, and actionable opening errors. All five local renderer scales pass after the correction. A valid low-cash reserved-contract fixture verifies opening-fee rejection preserves the save and routes to Rent; missing stock routes to Supplies. Final exact-head CI remains the merge gate.
