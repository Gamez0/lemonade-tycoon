# Willow Lane Lemonade

A neighborhood lemonade business built with Phaser and TypeScript. Buy supplies, adjust a recipe and price, watch customers visit, and improve tomorrow.

The presentation follows classic PC tycoon games: compact green management panels, beveled buttons, illustrated inventory, and original diagonal location scenes with a little parasol cart. Seven illustrated tabs switch Results, Rent, Upgrades, Staff, Marketing, Recipe and Supplies in a fixed two-column frame. The 5:4 street stays beside the work panel.

## Run locally

Use Node.js 22 and npm. The committed `package-lock.json` is authoritative.

```sh
npm ci
npm run dev-nolog
```

Open http://localhost:8080 for the reboot. The preserved earlier game is at http://localhost:8080/legacy.html. Both entries are included in `npm run build-nolog` under `dist/`.

## Playing

Start with $40 and empty stock. In Supplies, select ingredients and add bundles to your order. BUY commits the whole order; CANCEL discards it. Cash and stock stay unchanged until checkout. Choose lemon/sugar units per pitcher and ice per cup and set a price from $0.25 to $5.00. The forecast-fit hint helps tune the recipe. Open the stand to lock preparation and watch several people walk, queue, buy, pass, or leave after waiting. The speed button runs the day at 4x. SKIP resolves the remaining visits and queue with the same fixed-time rules and opens the results.

Results offers Last day and a cumulative Profit & loss ledger for completed days; it remains available during the next preparation. Profit subtracts ingredients consumed, rent, moving, wages and advertising; cash change also subtracts supply purchases and capital equipment. Leftover supplies, cash and local ratings carry into the next day; leftover ice melts unless refrigerated. Aim for $75 cash; play can continue afterward. Choose **New business** twice to reset; Escape or moving focus cancels confirmation.

Rent compares the free Neighborhood, Riverside Park and Downtown. Park unlocks after 3 completed days, $45 total sales and 55% satisfaction; Downtown needs 7 days, $120 sales and 65% satisfaction. Unlocks persist. Browse without changing the current scene, then confirm a reservation. Park costs $2/day plus $1 when moving in; Downtown costs $5/day plus $3 when moving in. Returning to the Neighborhood is free. Fees are charged once when opening, with no repeat charge on interrupted-day replay. Park has more patient visitors; Downtown offers higher budgets with faster arrivals and short queues. Each location keeps its own satisfaction and popularity.

Progress saves automatically on this device. Reload during selling returns to the paid opening checkpoint for that day. Use Export save for a portable backup and Import save to restore it; browser data can be cleared and is not synced. The v5 format accepts earlier saves without changing historical cash, revenue or ingredient costs. See [save and recovery policy](docs/reviews/m4-save-recovery.md) and [M5 review](docs/reviews/m5-locations.md). Ice makers produce free ice with no production or electricity fee; bought ice retains its purchase cost. Three equipment families have two levels; Staff offers an owner/server/host choice, Marketing combines direct price entry with flyers/radio. Music and effects are original code-authored compositions. Help / Sound provides instructions, separate volume settings, mute and fullscreen. Initial supported language: English. Human listening and playtest acceptance remain pending. The legacy entry retains its previous behavior and external font dependency.

For a Windows desktop prototype, run `npm run desktop:package:win` and launch the executable from `release/Lemonade Tycoon-win32-x64/`. Saves are written to `%LOCALAPPDATA%\Lemonade Tycoon`, independently of the installation folder. See the [Windows package review](docs/reviews/m4-desktop-package.md) for testing and remaining release work.

## Checks

```sh
npm test
npm run typecheck
npm run lint:reboot
npm run build-nolog
npx playwright install chromium
npm run test:browser
```

Browser tests run three days at desktop and 375px widths, reconcile daily/cumulative accounting, check staged orders, cancellations, insufficient funds, invalid inputs, no-sale results, restart, speed/SKIP and screen geometry. Pure simulation tests also check concurrent arrivals, queue abandonment and one-time settlement. Screenshots go to `test-results/`, with traces on failure. CI also installs Chromium's system dependencies.

The strict typecheck and zero-warning lint cover the reboot. Legacy sources remain intact and have pre-existing unused-symbol/type/lint findings documented in [the repository audit](docs/repository-audit.md); repository-wide `npx tsc --noEmit` and `npm run lint` are not release gates for the reboot.

## Project notes

- [Game design](docs/game-design.md)
- [Architecture](docs/architecture.md)
- [Art direction and asset register](docs/art-assets.md)
- [Roadmap](docs/roadmap.md)

Reboot scene and character textures are original code-authored artwork. Existing assets remain available to the legacy game. Reference screenshots are not bundled.

M2 implementation and same-width reference comparisons are available in the [reference board](docs/research/m2-reference-board.html). The milestone stays open until user visual acceptance.

M6-M10 implementation/release preparation is recorded in [the review](docs/reviews/m6-m10-development.md). Steam/private upload, five human playtests and deferred Windows checks remain external gates. See [Steam readiness](docs/release/steam-readiness.md), [store draft](docs/release/store-draft.md) and [operations](docs/release/operations.md).
