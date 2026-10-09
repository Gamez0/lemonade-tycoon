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
