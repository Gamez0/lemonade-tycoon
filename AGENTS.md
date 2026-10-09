# Lemonade Tycoon development

## Read first

- `docs/cloud-work.md`: current cloud handoff, ordered work and stopping conditions.
- `docs/roadmap.md`: approved Windows PC / Steam submission scope and acceptance gates.
- `docs/handoff.md`: historical context; newer cloud handoff and live GitHub state take precedence.
- Relevant `docs/reviews/` and `docs/research/` before changing a subsystem.

## Project and commands

The playable reboot starts at `src/reboot.ts`. Pure rules and persistence live in
`src/game/simulation/`, presentation in `src/game/presentation/`, and Electron in
`src/desktop/`. Legacy Phaser code and `legacy.html` are retained. Legacy notes in
`CLAUDE.md` do not describe the reboot or its current test suite.

Use Node 22 and npm with the committed `package-lock.json`; do not introduce Yarn
or regenerate the lockfile merely to prepare an environment.

```sh
npm ci
npm test
npm run typecheck
npm run lint:reboot
npm run build-nolog
npx playwright install --with-deps chromium
npm run test:browser
```

Browser tests use a production build and manage their own preview on port 8081.
`npm run dev-nolog` is an optional interactive preview on port 8080.
Windows packaging: `npm run desktop:package:win`. Packaged Windows tests require
Windows and `LEMONADE_DESKTOP_EXE`; see `docs/reviews/m4-desktop-package.md`.
Linux browser/file-storage results cannot establish Windows package acceptance.

## Working agreement

- Continuation rule (user correction, 2026-10-09): passing tests, merging PRs,
  preparing an alpha artifact or sending a progress report does not complete the
  delegated game delivery. Before ending active work, inspect the remaining
  approved release tasks and continue every independently runnable task. Stop
  only when the user asks, the authorized outcome is achieved, or further progress
  actually requires unavailable access, human evidence or a decision. Report the
  concrete blocker and prepared next action; do not silently turn a checkpoint
  into a waiting state or imply background execution after the turn ends.

- The user delegates delivery of a sellable game: own implementation, meaningful
  tests, self-review, current-head CI, merges, CI/CD, GitHub feature adoption,
  milestone/issue upkeep and reviewable release artifacts. Finish routine work
  through main integration without repeatedly asking for approval. Keep account,
  payment and actual distribution actions within explicit session authorization.
- A human/manual release acceptance gate is not a reason to leave reviewed,
  tested implementation PRs unmerged. Preserve the open gate in issues/docs while
  integrating code. Reconcile stacked PR bases, obsolete checkpoints and branch
  protection checks as part of finishing the work.

- Preserve the classic compact green panels, beveled controls and neighborhood
  art direction. Keep pitcher production, ice melt and historical-save accounting.
- Follow the original game's flow and intentional simplifications. Do not add
  realistic overheads or restrictions without a gameplay reason. The user specified
  that purchased ice makers produce free ice, with no electricity/production fee.
- Routine implementation, fixes, branches, pushes and PRs are authorized within
  the existing roadmap. Use a self-review and passing CI for the current commit
  before any merge. Do not claim remote actions happened without evidence/access.
- PR #83 and uncommitted changes in the parent local worktree are separate work.
  Never stage, reset or overwrite them. Cloud paths are repository-relative;
  `.reboot-work` is a local worktree, not a required cloud subdirectory.
- M2/#97 needs user visual acceptance. Windows clean-PC checks and Steam account
  checks remain manual/external gates. Do not close those gates based on CI alone.
- When a task is finished, continue to the next authorized runnable task in the
  same cloud run. If one task is blocked, record the reason and do independent
  authorized work. Do not invent new scope to keep consuming allowance.
- No agents in parallel, automatic credit purchases, API billing setup, paid
  services, Steam submission or public sales without an explicit user instruction.
- Keep checks proportional to the change. Record changed files, review findings,
  actual test results, remaining gates and the next action in `docs/cloud-work.md`.
- A work document is not a scheduler. Never claim a run, schedule or budget cap
  is active unless the corresponding service confirms it.
