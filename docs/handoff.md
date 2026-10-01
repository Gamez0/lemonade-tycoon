# Resume checkpoint — 2026-09-29

The user resumed the previous night's work. Reboot work lives in `.reboot-work/`; the parent worktree remains on `refactor/static-scene-registration` with user-owned uncommitted changes. Never stage/reset those parent changes.

## Latest release planning

The user requested a concrete milestone path through release. See [roadmap](roadmap.md): M2 visual acceptance remains open; M3 queues stays next; M4–M10 cover persistence, progression, management, alpha, beta, PC release candidate and Steam submission readiness. GitHub milestones and tracking issues #105–111 are created. Superseded by the latest user instruction: target a Windows PC game ready for Steam submission; web remains a preview. See the updated roadmap for desktop acceptance gates and external Steam verification prerequisites. Actual public release/sales are a separate decision. No due dates or background schedule are promised. PR #104 merged with green CI; M2 still needs user visual acceptance.

## Latest art revision

Latest user steering: finish the ongoing road/weather/selling work first, then separately audit whether M2 truly meets its goals. PR #102 is merged with green CI. Branch `fix/m2-acceptance-audit` follows up with medium-width forecast visibility, stable mobile action placement, working SKIP and additional storage/skip regression checks. Read `docs/research/m2-acceptance-audit.md` and consult the audit PR for its final checks/merge state. M2/#97 remain open for visual acceptance.

The user explicitly placed simultaneous pedestrians/visitors, queues and waiting departures in M3. Milestone 3 and issue #100 track that work; do not implement it inside M2. Save/load and later roadmap milestones now follow M3.

Preview remains http://localhost:8080; comparison board is http://localhost:8080/docs/research/m2-reference-board.html. Keep the server running for playtesting. Consult the current PR for final checks and merge state.

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

## 2026-10-01 desktop continuation

M4 browser saves and a Windows file adapter were merged in #118 and #119. The next branch adds an Electron Windows x64 package and connects the native save adapter to the same JSON format. See `docs/reviews/m4-desktop-package.md` for build/test commands and remaining Steam Cloud, update/reinstall and clean-PC checks. M4/#105 remains open. The M2 visual acceptance is also still open. The parent worktree on `refactor/static-scene-registration` has unrelated user changes; do not stage or reset them.

## Working agreement

User authorizes routine git/GitHub operations without repeated confirmation. Self-review and green CI are required before merging. No subagents were used. At the end of a working session, explicitly report any local preview server left running.

## Latest checkpoint — 2026-10-01

Active worktree: `.reboot-work`, branch `feat/m4-save-recovery`. M3 merged in #117. Resumed WIP commit c9ec9b0 (M4 save/recovery), fixed corrupted-save protection when opening, missing-primary recovery and result/history consistency. Save tests are in `tests/save.cjs` and `tests/browser/save.spec.cjs`; policy and outstanding desktop work in `docs/reviews/m4-save-recovery.md`. M2 still awaits visual acceptance. M4 is in progress, not complete. Parent worktree changes remain user-owned.
