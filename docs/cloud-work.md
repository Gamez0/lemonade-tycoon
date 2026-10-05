# Cloud development handoff — 2026-10-05

## Goal and source

Continue the approved roadmap toward a Windows PC game ready for Steam submission
while the user's PC is off. Use the ChatGPT subscription allowance. Do not set up
separately billed API automation or buy credits. A numeric token/spend cap has not
been specified, and this document does not enforce the account's remaining allowance.

Repository: https://github.com/Gamez0/lemonade-tycoon

Bootstrap branch: `chore/codex-cloud-handoff`, based on
`fix/recipe-pitcher-and-ice-melt` at `f5ce10f`. This includes the reboot, M3 queues,
M4 saves and Electron prototype, and the latest pitcher/ice correction. Do not
start from the parent's `refactor/static-scene-registration` branch.

PR #121 contains the pitcher/ice changes and was open with passing checks at the
handoff inspection. This bootstrap PR is based on its branch to avoid duplicating
that gameplay diff. Recheck the live PRs and branch heads before any merge or rebase.

## Ordered batch for the first cloud run

1. Establish the baseline. Read AGENTS.md, this document, the roadmap and relevant
   M4 reviews. Run simulation/save/file-storage tests, reboot typecheck/lint,
   production build and browser tests. Investigate and fix actual failures first.
   Record commands and results; do not infer passing tests from old review files.
2. Audit M4/#105 against current code, tests and review evidence. Add focused
   regressions and fix demonstrated save/recovery or close/flush defects. Check
   import/export, corrupt primary/backup, version migration, interrupted selling,
   result/history consistency and serialized file writes. Avoid speculative rewrites.
3. Prepare repeatable Windows evidence. Review whether the existing Windows
   packaged test can run in a Windows GitHub Actions job and add that job if
   technically feasible. Verify the workflow on GitHub when access permits.
   Otherwise document the precise outstanding command/environment requirement.
   Do not claim a clean-PC, update/reinstall or Steam test from Linux execution.
4. Prepare the M5/#106 design as independent documentation work: three locations,
   unlock/rent rules, customer differences, the Rent tab and save migration risks.
   Tie each decision to existing code and acceptance conditions. Keep gameplay
   implementation pending until M4's prerequisite acceptance is resolved.
5. Self-review the final changes, correct findings, run relevant final checks and
   open a focused PR if GitHub write access is available. Record its URL and exact
   tested commit. Follow the existing current-commit CI rule for any merge.

The user may still review M2 fonts/composition while this batch proceeds. Do not
mark M2 complete or redesign it based on an assumed visual approval.

## Stop and resume

Continue the ordered batch without asking the user to restart between its items.
When the batch is done, a required external gate blocks all runnable work, or the
service ends the run, save a checkpoint here with completed/pending work, exact
branch/commit, checks and next runnable action. Ask only for the missing information
or external verification that is actually required. Do not loop, poll indefinitely
or promise automatic re-execution after the cloud task ends.

## Activation status

- Handoff published on `chore/codex-cloud-handoff`; setup PR:
  https://github.com/Gamez0/lemonade-tycoon/pull/122
- No cloud task or recurring schedule has been activated by this document.
- The CLI can submit a task once the cloud environment ID is available.
- Windows/manual acceptance gates remain open.

## Environment setup

Create/select a Codex Cloud environment for `Gamez0/lemonade-tycoon`, choose Node 22,
and select the bootstrap branch for the first task. In environments offering a
setup-script field, use `bash scripts/codex-cloud-setup.sh`. In automatically
prepared environments, supply that command as the setup requirement and verify
the resulting installation/checks. Package downloads and Playwright installation
need network access during setup. No game secrets are required for baseline tests.

Official setup: https://learn.chatgpt.com/docs/cloud

First task prompt: copy the contents of `docs/cloud-task-prompt.txt` into the task.
An eligible cloud task continues while the PC is asleep/offline. This is a bounded
development batch; perpetual automatic task chaining is not configured.

## First cloud run checkpoint — 2026-10-05 (KST)

### Environment and exact implementation revision

- Managed cloud provider reported `running`, `connected`, current observations and no failure.
  Commands actually executed in `/workspace/lemonade-tycoon`; no local PC dependency or parallel agents.
- Started clean on `chore/codex-cloud-handoff` at
  `e4dd6b8819afaf8d3e98dd2e4a70b4501af4b3b4`.
- `git fetch origin` / `git ls-remote origin` succeeded. Main:
  `0ddf7aa3111dc2623167c0834cee4908bc31cb78` (#120). Public GitHub PR page payloads
  confirmed #121/#122 both OPEN; their gameplay/preparation commits remain in this ancestry.
- Work branch: `fix/cloud-m4-recovery-and-windows-ci`.
  Exact tested implementation commit: `24a5ef2a695069cd4dfad91bffd17b2ba7fc07a3`, pushed.
  This checkpoint is a documentation-only successor; obtain its exact hash with
  `git log -1 --format=%H -- docs/cloud-work.md`. No merge performed.
- Default Node was 24.19.0. Used Node **22.23.3**, npm **10.9.9**, committed lockfile and npm ci.
  Writable runtime cache/path workaround (not a repository or paid configuration):
  `PATH=/tmp/lemonade-npm/_npx/4bb4bc87b1b72b6c/node_modules/.bin:$PATH`,
  `npm_config_cache=/tmp/lemonade-npm`, `PLAYWRIGHT_BROWSERS_PATH=/tmp/lemonade-playwright`.
  These temporary paths require reinstalling if the executor is replaced. Default home npm/browser
  cache creation failed with ENOENT; installing to /tmp succeeded without privilege escalation.

### Completed work and actual checks

1. Baseline: npm ci, npm test **22/22**, typecheck, lint:reboot and production build passed.
   `npx playwright install chromium` succeeded with the temporary cache; baseline browser **11/11**.
   Chromium ran successfully with installed system libraries; no system dependency changes needed.
2. M4 audited against roadmap and review evidence. Sync/async backup I/O failures were reproduced
   by two failing regressions before code edits. Backup errors now abort without replacing primary.
   Added async missing/corrupt recovery regression and delayed production-renderer bridge test for
   serialized writes and latest-checkpoint close flush. Existing import/export, legacy accounting,
   result/history and interrupted-selling tests retained.
3. Added `.github/workflows/windows-package.yml`: Windows runner, Node 22/npm, package and EXE
   save tests on push/PR/manual dispatch. Expanded desktop test to use actual BrowserWindow close,
   exact results preservation and immediate next-day close/relaunch.
4. M5 design: `docs/research/m5-locations-design.md`; three locations, unlock/rent/customer rules,
   Rent tab, bankruptcy/free return, opening snapshot and v3 compatibility. **No M5 gameplay implemented**.
5. Self-review: `docs/reviews/cloud-m4-audit.md`. Final code: npm test **25/25**, typecheck,
   lint:reboot, build-nolog and production browser **12/12** passed. Unit/type/lint were rechecked on
   commit 24a5ef2. Browser/build checked the identical committed source before commit.
   `git diff --check`, JS syntax and Windows workflow YAML/trigger/command assertions passed.
   No dependency/lockfile/art changes, user changes discarded, or preview server left running.

### Remote evidence and blocked work

- Git push succeeded. GitHub GraphQL (`gh pr view`, `gh pr create`) and REST (`gh api`) returned
  **Forbidden**. No PR was created; no PR URL is claimed. Review/create a focused stacked PR against
  `chore/codex-cloud-handoff` while #122 is open:
  https://github.com/Gamez0/lemonade-tycoon/compare/chore/codex-cloud-handoff...fix/cloud-m4-recovery-and-windows-ci?expand=1
  Once #121/#122 merge, fetch latest main, verify both changes and retarget without duplicate diffs.
- Public Actions pages confirmed these runs for implementation commit 24a5ef2 **Success**:
  Reboot https://github.com/Gamez0/lemonade-tycoon/actions/runs/37282655187
  Windows https://github.com/Gamez0/lemonade-tycoon/actions/runs/37282655364
  Windows completed in 1m30s and Reboot in 2m09s. The Windows workflow has one non-optional
  package/test job. Public run status verifies its success; API denial prevents normal CLI logs/status.
  Documentation-only successor c4ebac7 also dispatched both workflows; its results were pending
  at the checkpoint. No merge is authorized by older-head CI.
- Windows EXE tests did not execute on this Linux host; the Windows runner successfully ran
  packaged save/normal-close/forced-exit/results/backup recovery checks. Clean-PC/offline,
  update/reinstall and web→Windows manual transfer acceptance remain unconfirmed.
  Steam account/AppID, installation/update/rights checks remain external. M4/#105 stays open;
  M2/#97 still requires user visual acceptance. Do not infer these gates from automated tests.

### Next actions

Implementation Windows/Reboot runs passed. Check the documentation successor runs, then create the focused PR
when API write access is available (or use the compare link). Confirm current-head CI and self-review
before considering any merge. Perform Windows manual gates, then assess M4 acceptance before M5
implementation. This bounded cloud batch sets up no automatic rerun/schedule, API billing, credit purchase,
paid service or Steam public release. Exact subscription allowance is not visible and no remaining-token
or spend-cap guarantee is made.

## API access restored and PR created — 2026-10-05 (KST)

- Confirmed the published environment now uses source configuration version
  `cecfgver_6ac35ea28bdc8196be15d84bacc0e6a6`, running/connected. Its allowed hosts include
  `api.github.com`. Actual authenticated REST and GraphQL requests now succeed.
  The former Forbidden was a proxy CONNECT denial; no token replacement was needed.
- Working tree restored clean on `fix/cloud-m4-recovery-and-windows-ci` at
  `7a3599c46785f3f572a9a8c76f78a4fc73595318`. Explicit fetch of main and handoff succeeded.
  API confirms #121 OPEN against main and #122 OPEN against #121's gameplay branch.
- API verified both completed/success for that exact head:
  Windows https://github.com/Gamez0/lemonade-tycoon/actions/runs/37282981342
  Reboot https://github.com/Gamez0/lemonade-tycoon/actions/runs/37282980881
- Created focused stacked PR #123 against `chore/codex-cloud-handoff`:
  https://github.com/Gamez0/lemonade-tycoon/pull/123
  The PR contains the demonstrated save fix/regressions, Windows workflow/test,
  M4 audit and M5 design. No merge or milestone closure performed.
- This documentation-only checkpoint follows 7a3599c. Its exact hash is available from
  `git log -1 --format=%H -- docs/cloud-work.md`; current-head CI must be checked separately.
- Next: review #123 and its current-head checks. After #121/#122 land, fetch and verify
  their inclusion in main, retarget #123 and confirm fresh checks before any merge.
  Windows clean-PC/update/reinstall/manual transfer, M2 visual approval and Steam gates
  remain open; M5 gameplay stays deferred until M4 acceptance. No automatic rerun configured.

## Window-close persistence probe — 2026-10-05 23:54:31 KST

This bounded run tests whether work continues after the user closes the chat window.
Actual run start: 2026-10-05 14:54:31 UTC / 23:54:31 KST. The assistant sent its
work-start message after executing environment/status/repository commands. The user's
actual window-close time is not visible to the assistant. Compare that time with the
new commit/push/PR timestamps; an earlier CI completing alone is not proof of AI continuation.

- Published managed cloud environment reported running/connected, source version
  `cecfgver_6ac35ea28bdc8196be15d84bacc0e6a6`. No separate development task ID was returned.
- Starting worktree: `/workspace/lemonade-tycoon`, clean branch
  `fix/m4-desktop-acceptance-followup`, commit `12f8e6cc2d31a503fc4943d2e9ac2513cab89b33`.
- Reviewed OPEN PR #124 at that same exact head: native export/import, malformed and
  both-corrupt protection, same-package relocation, package metadata and artifact workflow.
  No demonstrated source correction was identified; no speculative code fix was made.
- Reboot checks for that head succeeded in runs 37327073362 and 37327202583; CodeQL
  actions/javascript checks succeeded. Windows run 37327073561 failed at the packaged
  save test (exit 1), after unit tests and packaging succeeded. Its detailed log download
  was denied at results-receiver.actions.githubusercontent.com, so the root cause is
  unresolved and this failure is not dismissed as an environment issue or harmless flake.
- Windows run 37327202440 for the same head succeeded through native package tests,
  metadata generation and upload. API verified a non-expired artifact named
  `windows-prototype-12f8e6cc2d31a503fc4943d2e9ac2513cab89b33` (162976984 bytes).
  https://github.com/Gamez0/lemonade-tycoon/actions/runs/37327202440
  Mixed success/failure means #124 should not be merged until the failed run is diagnosed.
- Dedicated documentation branch `docs/window-close-probe-20261005` starts from main
  `b851f1d3a1c30ce3580980114add56b172fbd716`. It adds only this checkpoint, not #124's
  implementation, tests, workflow or design changes. User changes and PR #83 are untouched.
- M4/#105 still requires human clean-PC/offline, real web↔PC transfer and actual
  newer-version update/reinstall evidence. Same-build relocation and hosted-runner CI
  do not close these gates. M2 visual and Steam/account/device gates remain open;
  M5 gameplay remains deferred.

Validation for this documentation change: verify PR/run/artifact API evidence, run the
existing Node 22 unit/save/file suite, and check diff whitespace. The exact documentation
commit and resulting PR URL are in the new PR's metadata/body; obtain the local hash with
`git log -1 --format=%H -- docs/cloud-work.md`.

Next: compare user window-close time against this run's new PR creation/push timestamps.
A later PR establishes that this bounded run continued until that point, not perpetual
execution or an automatic restart guarantee. Retrieve/diagnose #124's failed Windows log
through authorized access before deciding whether code changes or another verification run
are needed. This probe ends when its one new PR is created; no merge, recurring execution,
parallel agent, separate API billing or credit purchase is configured.
