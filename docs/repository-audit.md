# Reboot repository audit — 2026-09-29

## Baseline and preservation

Remote main: `1614c88` (PR #82). Local branch `refactor/static-scene-registration` has unpublished edits to package.json, yarn.lock, main.ts and two scenes, plus Yarn 4 configuration. Draft PR #83 covers scene registration. Reboot work uses a separate worktree and branches from main; it must not absorb, overwrite, merge or close #83 automatically. Existing code and assets remain reference material, with a legacy entry when the reboot becomes the default.

## Structure and stack

Phaser ^3.87, TypeScript ^5.4, Vite ^5.3, webfontloader. `src/main.ts` configures a 1024×768 FIT canvas. `src/scenes` owns boot/preload/menu/preparation/day/game-over; `src/ui` has 29 Phaser containers; `src/models` contains mutable event-emitting state; `src/data` contains locations and review strings. `public/assets` has a Tiled park, tilesheet, 16×16 characters (20 sets, 12 frames), ingredient/weather/UI icons, logo/background and MP3. No test suite. Both npm and Yarn lockfiles exist; local Yarn 4 migration is uncommitted. CI only builds and deploys main, without typechecking or PR validation.

TypeScript is strict but disables strict property initialization. A baseline local typecheck fails on seven unused parameter/constant diagnostics. Vite build alone cannot establish type safety. CLAUDE.md contains historical notes: its claims that results/weather are stubs and timers lack cleanup are stale after #79–81.

## Existing systems and findings

Preparation purchases supplies with capacity and cash checks, sets recipe/price and selects one of three locations. Models mostly inherit Phaser.EventEmitter, often through a global Phaser reference. State is transferred by reference between scenes. DayScene combines timers, customer generation, queue/patience, pitcher production, stock consumption, transactions, review scoring and sprite pathing. Sales last 72 seconds; a separate timer drives each subsystem. GameOver exists but is unreachable.

Confirmed by source inspection (not all reproduced in browser):

| Finding | Evidence / impact |
| --- | --- |
| Natural end does not advance date | DayScene timer calls switchToPreparationScene; only SKIP advances date |
| Revenue labeled profit | sellLemonade adds full price to Result.profit, without stock costs; results shows only revenue and volume |
| Rent is checked but not charged | preparation checks getFee; no rent debit in sale lifecycle |
| Cup cost undercounted | Recipe.getCostPerCup divides one cup cost across pitcher output |
| Dequeue emits before mutation | CustomerQueue.dequeue emits old queue then shifts |
| Patience loop mutates iterated queue | removeCustomer while forEach can skip adjacent customers |
| Static scene reuse hazard | local #83-related code initializes pitcher/results/reviews only as class fields; init does not reset these daily |
| Entry path validation too late | followEnterPath reads enterPath.properties before checking missing path |
| Listener ownership weak | some UI uses off(event) removing other subscribers; Recipe subscribes to supplies without an invoked cleanup path |
| Destroy override incomplete | TextButton.destroy destroys children but never calls super.destroy |
| Temperature conversion reversed | Fahrenheit branch calls Celsius-to-Fahrenheit when needing Celsius |
| Satisfaction inert | tracked location values never influence demand; recipe reviews ignore price/weather parameters |

## Reuse decisions

Keep the preparation/sale/results rhythm, weather-responsive demand, lemon-to-sugar balance, clear supply counters, price tradeoffs, free suburban start, and later location differentiation. Use the old Tiled path approach as a reference for future routes. Reimplement money in integer cents and state transitions as pure TypeScript. Do not carry over mutable event models, implicit Phaser globals, independent rule timers or the old cost calculation.

Existing artwork remains intact. Its provenance is not documented sufficiently to label it newly authored; reboot visuals will be original procedural pixel art. No original commercial sprites, UI images, maps or logo are imported.

## GitHub triage

Open #75 (satisfaction), #25/#26 (weather-sensitive price), #37 (cost/profit) inform MVP rules. #3 is partly superseded by closed #70 weather variation; #29 has merged #31 but remains open. Reboot does not silently close these legacy issues.

Later product backlog: #11 save/load; #34/#58/#59/#60 locations/maps/customer differentiation; #74 upgrades; #35/#72/#32 advertising; #73 staff; #16 customer facing; #38/#43 documentation. Legacy refactors #41/#57/#61 and tooling #47 remain contextual, not MVP prerequisites. Closed fixes #65–71 are preserved. No GitHub milestone existed at audit time.

## Decision

Keep Phaser/TypeScript/Vite. Add a new game namespace, isolated simulation, data-only content, and a presentation adapter. Complete a single suburban vertical slice before expanding systems. Preserve the legacy entry and document its known limitations. No wholesale deletion or stack migration.
