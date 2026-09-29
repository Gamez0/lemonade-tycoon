# Resume checkpoint — 2026-09-29

The user resumed the previous night's work. Reboot work lives in `.reboot-work/` on `feat/reboot-playable`; the parent worktree remains on `refactor/static-scene-registration` with user-owned uncommitted changes. Never stage/reset those parent changes.

## Current implementation

- Foundation #84 / PR #87 and simulation #85 / PR #88 are merged. Simulation PR had green CI and a recorded self-review before merge.
- Playable issue #86 / PR #89 now connects the reboot as default and preserves `legacy.html` as a production entry.
- Preparation, purchases, recipe/price, animated visits, accounting results, next day and deliberate restart are implemented. Lifecycle, invalid-input and narrow-layout findings are recorded in `docs/reviews/86-playable.md`.
- npm is the branch's package manager. Strict reboot checks are separate from documented pre-existing legacy findings. Parent Yarn 4 changes are untouched.
- Browser tests run against a production build, not the hot-reloading development server. Run `npm run build-nolog` before `npm run test:browser`.

## Finish/recheck status

Consult PR #89 and its latest checks for the final remote state. Merge only after the current commit's simulation, strict reboot typecheck/lint, production build and browser checks pass. Do not use earlier draft/checkpoint claims as evidence. README, art register and the review describe the implemented MVP and its limits.

After M1, take user playtest feedback before expanding. Save/load, progression, staff, upgrades, sound and balance work are still deferred per `docs/roadmap.md`. No background development schedule has been created.

## Working agreement

User authorizes routine git/GitHub operations without repeated confirmation. Self-review and green CI are required before merging. No subagents were used. At the end of a working session, explicitly report any local preview server left running.
