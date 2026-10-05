# Reboot architecture

`src/game/simulation` is pure TypeScript: readonly serializable state, explicit commands, deterministic seeded randomness, integer cents. It imports only data from `src/game/content`. It has no Phaser, DOM, clock, storage or network dependency.

`src/game/content` owns ingredient prices, weather and customer profiles. `src/game/presentation` owns Phaser scenes, procedural artwork and DOM controls. Presentation requests transitions and renders snapshots/events; animations never charge money or decide purchases.

State flow: preparation → selling → results → next preparation. Only preparation accepts purchases and recipe/price edits. Opening freezes the plan. One customer step produces a bought/rejected/sold-out event and an updated snapshot. A fixed simulation cadence is independent of frame rate; speed controls only cadence. Reaching the final customer settles exactly once. Next day increments once and retains cash, stock and reputation. Invalid commands fail without partial mutations.

Costs: constant integer-cent ingredient unit costs; stock purchases decrease cash, sales consume stock and accrue cost of goods sold. Daily profit = revenue − consumed stock cost; cash change = revenue − purchases. Unused inventory carries over at cost, including ice for this first slice. No rent at the initial location. The UI distinguishes these two accounting views.

Tests compile the simulation in isolation and execute with Node's built-in test runner. Browser tests exercise real controls, transitions and console errors. PR CI runs simulation tests, strict reboot typechecking, reboot lint, both-entry build and browser smoke checks. Legacy remains available at `legacy.html`; its pre-existing typecheck findings are recorded in the repository audit. There are no runtime imports from legacy into reboot. npm and `package-lock.json` are authoritative; the stale Yarn lock was removed from this branch to prevent divergent dependency resolution.

`src/reboot.ts` owns DOM controls and state snapshots. The street scene previews the deterministic next customer's profile without committing a transaction, then advances simulation once at arrival. The last customer's exit gates the next-day control. Restart clears animation state and speed immediately. Canvas rendering is sufficient for the small original pixel textures and avoids a WebGL requirement.

The current simulation produces pitchers when a buyer needs one, counts prepared cups, discards remaining prepared cups at closing, and melts leftover ice before the next preparation. Service delay and queues are separate fixed-tick street rules. Storage and save migration use the versioned save document. Staff, upgrades and multiple locations remain later milestones.
