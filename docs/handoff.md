# Resume checkpoint — 2026-09-29

The user resumed the previous night's work. Reboot work lives in `.reboot-work/`; the parent worktree remains on `refactor/static-scene-registration` with user-owned uncommitted changes. Never stage/reset those parent changes.

## Latest art revision

Latest user steering: implement the researched M2 direction. Branch `feat/m2-classic-experience` integrates #93?96: equal columns, four real screen tabs, staged atomic BUY/CANCEL, completed-day ledger, 5:4 scene and revised icons. #97 and milestone 2 remain open until the user visually accepts the comparison. Read `docs/reviews/93-classic-experience.md` for findings and verification and consult its PR for merge state.

Preview remains http://localhost:8080; reference/implementation comparison is http://localhost:8080/docs/research/m2-reference-board.html. The board has six M2 captures plus M1. The old layout checkpoint was incorporated before completion; do not resume that draft separately. The development server was intentionally left running for the user's playtest.

After completing the MVP, the user requested a substantial redesign and explicitly rejected modern UI styling in favor of the original PC game's atmosphere. Issue #90 / branch `feat/retro-art-direction` implements compact green panels, beveled controls, resource icons and a fine outlined diagonal neighborhood with a small parasol cart. Treat this as the accepted art direction; do not reintroduce cream cards or modern spacious dashboard styling. Reference analysis and review are in `docs/art-assets.md` and `docs/reviews/90-retro-art.md`. Consult the branch PR for final CI/merge state. The local preview is on port 8080.

## Current implementation

- Foundation #84 / PR #87 and simulation #85 / PR #88 are merged. Simulation PR had green CI and a recorded self-review before merge.
- Playable issue #86 / PR #89 now connects the reboot as default and preserves `legacy.html` as a production entry.
- Preparation, purchases, recipe/price, animated visits, accounting results, next day and deliberate restart are implemented. Lifecycle, invalid-input and narrow-layout findings are recorded in `docs/reviews/86-playable.md`.
- npm is the branch's package manager. Strict reboot checks are separate from documented pre-existing legacy findings. Parent Yarn 4 changes are untouched.
- Browser tests run against a production build, not the hot-reloading development server. Run `npm run build-nolog` before `npm run test:browser`.

## Finish/recheck status

Consult PR #89 and its latest checks for the final remote state. Merge only after the current commit's simulation, strict reboot typecheck/lint, production build and browser checks pass. Do not use earlier draft/checkpoint claims as evidence. README, art register and the review describe the implemented MVP and its limits.

After this M2 implementation, collect user visual feedback before marking the milestone complete. Save/load, progression, staff, upgrades, sound and balance work are still deferred per `docs/roadmap.md`. No background development schedule has been created.

## Working agreement

User authorizes routine git/GitHub operations without repeated confirmation. Self-review and green CI are required before merging. No subagents were used. At the end of a working session, explicitly report any local preview server left running.
