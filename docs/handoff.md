# Paused checkpoint — 2026-09-29

User explicitly requested stopping for the night. Do not continue development until resumed. Cloud/unattended execution was mentioned as a future discussion; nothing has been scheduled.

## Completed

- Repository audit, architecture, MVP definition, roadmap, art reference analysis and asset register: #84 / PR #87, merged.
- Milestone 1 and implementation issues #85 (simulation), #86 (playable UI) created.
- Headless simulation implemented on `feat/reboot-simulation`, PR #88 (base main), self-review recorded. Eight tests pass locally and in GitHub CI, including ten consecutive days and 200 seeded-day invariants. PR is still open at pause; no merge attempted after the stop request.
- Original Windows selling screenshot was inspected, not bundled. Existing code/art and local Draft #83 work are preserved.
- User changed repository rules to permit zero required approvals. Still self-review and wait for green checks before merge. User authorizes routine git/GitHub operations without repeated conversational permission requests; tool sandbox restrictions still apply.

## Work in progress — NOT a playable or validated MVP

Branch `feat/reboot-playable` contains unconnected `src/reboot.ts`, `src/game/presentation/art.ts`, `street-scene.ts`, `style.css`. Original procedural neighborhood/stand/customer assets and DOM controls are drafted. The default index.html still starts legacy code. No browser tests or presentation typecheck/build have run. Do not call #86 complete or merge the draft as a finished feature.

Playwright dependency installed; Chromium downloaded locally. npm lockfile is updated. npm install also rewrote the worktree's Yarn lock; review package-manager consistency on resume (parent worktree's user-owned Yarn 4 changes remain untouched).

## Resume efficiently

1. Read this file, `git status`, PR #88 state/checks and relevant review comments. Do not repeat the full audit.
2. Review/merge #88 if all gates pass, then align the playable branch with main without discarding checkpoint work.
3. Finish the entrypoint split: default reboot, separately accessible legacy.html, both build inputs. Keep legacy sources and assets.
4. Self-review current UI drafts before wiring: remove empty CSS @import, avoid sprite profile changing on arrival, validate invalid-form behavior, confirm stop/buy/exit timing and state reset. Ensure last customer/new-day controls do not leak presentation state.
5. Finish scripts/typechecks, browser tests, README/art register and CI. Existing legacy unused-symbol TypeScript failures are documented in repository-audit.md; handle transparently without weakening reboot strictness.
6. Exercise real UI for at least three days, stock/funds failures, price/recipe changes, no-sale results, restart, desktop/narrow layouts, console errors and production build. Inspect screenshot. Record actual findings and fixes, then review PR #86 implementation and merge only if verified.

Prefer bounded changes and targeted checks; rerun broader checks only after new changes/failures. Keep progress updates short. No subagents were used. No dev server or ongoing agent job is intentionally left running.

## Workspace

Reboot worktree: `.reboot-work/` under the original repository. Original working directory remains on `refactor/static-scene-registration` with the user's uncommitted changes. Do not stage or reset those changes. Remote branches preserve this checkpoint so another environment can resume.
