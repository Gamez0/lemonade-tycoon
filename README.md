# Lemonade Tycoon

A neighborhood lemonade business built with Phaser and TypeScript. Buy supplies, adjust a recipe and price, watch customers visit, and improve tomorrow.

The presentation follows classic PC tycoon games: compact green management panels, beveled buttons, illustrated inventory, and an original diagonal neighborhood with a little parasol cart. Four illustrated tabs switch Results, Price, Recipe and Supplies in a fixed two-column frame. The 5:4 neighborhood stays beside the work panel.

## Run locally

Use Node.js 22 and npm. The committed `package-lock.json` is authoritative.

```sh
npm ci
npm run dev-nolog
```

Open http://localhost:8080 for the reboot. The preserved earlier game is at http://localhost:8080/legacy.html. Both entries are included in `npm run build-nolog` under `dist/`.

## Playing

Start with $40 and empty stock. In Supplies, select ingredients and add bundles to your order. BUY commits the whole order; CANCEL discards it. Cash and stock stay unchanged until checkout. Choose lemon/sugar/ice units per cup and set a price from $0.25 to $5.00. The forecast-fit hint helps tune the recipe. Open the stand to lock preparation and watch customers buy or pass. The speed button runs the day at 4x. SKIP resolves the remaining visits immediately using the same rules and opens the results.

Results offers Last day and a cumulative Profit & loss ledger for completed days; it remains available during the next preparation. Reports distinguish profit (sales minus ingredients consumed) from cash change (sales minus supplies purchased). Leftover supplies, cash and reputation carry into the next day. Aim for $75 cash; play can continue afterward. Choose **New business** twice to reset; Escape or moving focus cancels confirmation.

Progress lasts for the current page session. The MVP has one free location, silent original pixel artwork, and no save/load, staff or upgrades yet. The legacy entry retains its previous behavior and external font dependency.

## Checks

```sh
npm test
npm run typecheck
npm run lint:reboot
npm run build-nolog
npx playwright install chromium
npm run test:browser
```

Browser tests run three days at desktop and 375px widths, reconcile daily/cumulative accounting, check staged orders, cancellations, insufficient funds, invalid inputs, no-sale results, restart and screen geometry. Screenshots go to `test-results/`, with traces on failure. CI also installs Chromium's system dependencies.

The strict typecheck and zero-warning lint cover the reboot. Legacy sources remain intact and have pre-existing unused-symbol/type/lint findings documented in [the repository audit](docs/repository-audit.md); repository-wide `npx tsc --noEmit` and `npm run lint` are not release gates for the reboot.

## Project notes

- [Game design](docs/game-design.md)
- [Architecture](docs/architecture.md)
- [Art direction and asset register](docs/art-assets.md)
- [Roadmap](docs/roadmap.md)

Reboot scene and character textures are original code-authored artwork. Existing assets remain available to the legacy game. Reference screenshots are not bundled.

M2 implementation and same-width reference comparisons are available in the [reference board](docs/research/m2-reference-board.html). The milestone stays open until user visual acceptance.
