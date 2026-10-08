# Lemonade Tycoon

[![Checks](https://github.com/Gamez0/lemonade-tycoon/actions/workflows/checks.yml/badge.svg?branch=main)](https://github.com/Gamez0/lemonade-tycoon/actions/workflows/checks.yml)

[Milestones](https://github.com/Gamez0/lemonade-tycoon/milestones) · [GitHub working guide](docs/github-operations.md) · [Questions and feedback](https://github.com/Gamez0/lemonade-tycoon/discussions)

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

Start with $40 and empty stock. In Supplies, select ingredients and add bundles to your order. BUY commits the whole order; CANCEL discards it. Cash and stock stay unchanged until checkout. Choose lemon/sugar/ice units per cup and set a price from $0.25 to $5.00. The forecast-fit hint helps tune the recipe. Open the stand to lock preparation and watch several people walk, queue, buy, pass, or leave after waiting. The speed button runs the day at 4x. SKIP resolves the remaining visits and queue with the same fixed-time rules and opens the results.

Results offers Last day and a cumulative Profit & loss ledger for completed days; it remains available during the next preparation. Reports distinguish profit (sales minus ingredients consumed) from cash change (sales minus supplies purchased). Leftover supplies, cash and reputation carry into the next day. Aim for $75 cash; play can continue afterward. Choose **New business** twice to reset; Escape or moving focus cancels confirmation.

Progress saves automatically on this device. Reload during selling returns to the checkpoint just before opening that day. Use Export save for a portable backup and Import save to restore it; browser data can be cleared and is not synced. See [save and recovery policy](docs/reviews/m4-save-recovery.md). The MVP has one free location, silent original pixel artwork, and no staff or upgrades yet. The legacy entry retains its previous behavior and external font dependency.

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
