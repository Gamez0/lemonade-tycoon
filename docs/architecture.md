# Reboot architecture

`src/game/simulation` is pure TypeScript: readonly serializable state, explicit commands, deterministic seeded randomness, integer cents. It imports only data from `src/game/content`. It has no Phaser, DOM, clock, storage or network dependency.

`src/game/content` owns ingredient prices, weather and customer profiles. `src/game/presentation` owns Phaser scenes, procedural artwork and DOM controls. Presentation requests transitions and renders snapshots/events; animations never charge money or decide purchases.

State flow: preparation → selling → results → next preparation. Only preparation accepts purchases and recipe/price edits. Opening freezes the plan. One customer step produces a bought/rejected/sold-out event and an updated snapshot. A fixed simulation cadence is independent of frame rate; speed controls only cadence. Reaching the final customer settles exactly once. Next day increments once and retains cash, stock and reputation. Invalid commands fail without partial mutations.

Costs: constant integer-cent ingredient unit costs; stock purchases decrease cash, sales consume stock and accrue cost of goods sold. Daily profit = revenue − consumed stock cost − rent − moving; cash change = revenue − purchases − rent − moving. Lemon, sugar and cups carry over; ice melts overnight. The initial neighborhood has no rent. The UI distinguishes these accounting views.

Tests compile the simulation in isolation and execute with Node's built-in test runner. Browser tests exercise real controls, transitions and console errors. PR CI runs simulation tests, strict reboot typechecking, reboot lint, both-entry build and browser smoke checks. Legacy remains available at `legacy.html`; its pre-existing typecheck findings are recorded in the repository audit. There are no runtime imports from legacy into reboot. npm and `package-lock.json` are authoritative; the stale Yarn lock was removed from this branch to prevent divergent dependency resolution.

`src/reboot.ts` owns DOM controls and state snapshots. The street scene previews the deterministic next customer's profile without committing a transaction, then advances simulation once at arrival. The last customer's exit gates the next-day control. Restart clears animation state and speed immediately. Canvas rendering is sufficient for the small original pixel textures and avoids a WebGL requirement.

The current simulation produces pitchers when a buyer needs one, counts prepared cups, discards remaining prepared cups at closing, and melts leftover ice before the next preparation. Service delay and queues are separate fixed-tick street rules. M6 equipment and staff modify paid service rules.

M5 adds a location catalog, pending reservation, permanent unlocks, cumulative revenue
and per-location satisfaction/popularity. Opening atomically pays rent/moving and
creates `business`, a snapshot of traffic, buying power, customer weights and timings.
`dayTraffic` and the street loop use that snapshot. The persisted opening state keeps
phase=preparation and paid fees, so replay reuses them. Next day clears the snapshot.
Save v3 migrates earlier documents with neutral historical neighborhood rules and zero
fees, preserving prior cup/pitcher costs. Ledger validation includes fees, unlock
eligibility and contract lineage. Presentation never infers costs from animations.

M6 savev4 adds management selections/levels and capital,wages,advertising accounts.

Save v5 adds zero-cost ice inventory (`freeIce`) and consumed free ice
(`daily.freeIceUsed`). Opening adds free equipment output; batches consume it first
and exclude it from ingredient expense. Refrigeration retains its zero cost basis.
Versions 0–4 migrate with no free ice, preserving existing purchases/costs and paid
opening checkpoints. Both UI and simulation use `openingCosts` for actual opening fees.
Opening combines rent/moving/wages/ads/ice-production purchases atomically. Ads also
shorten arrivals; service/patience and fees are fixed for paid replay. Refrigerator
changes next-day ice carryover. Equipment capital is reconciled against lifetime
purchase ledger. Independent audio preferences never enter business accounting.
Original score notes live in content/audio-scores.ts; WebAudio presentation respects
volume/mute/visibility/focus and does not advance simulation. Desktop diagnostics
expose fixed event names only; Save and quit reuses the native flush handshake.
