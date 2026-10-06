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

## Merge and M4 acceptance follow-up — 2026-10-05 (KST)

- Actual commands executed in the published cloud checkout `/workspace/lemonade-tycoon`.
  Started clean at `3e8fe1d4b2463710ec0781bc0ce282e4830f316e`.
- Reviewed #121 pitcher cost/capacity/ice/migration and its regression evidence; #122
  instructions/setup/LF/manual gates; #123 backup error handling/queue tests/native close/Windows CI.
  No blocking finding. Current-head CI passed for each before sequential merge, using
  exact head-match guards. GitHub confirmed:
  #121 `bc2272bd9b44cfa447b34836a210ba885189e4ec`
  #122 `14d88181458c9a4391ffae8b4663b22a0385d602`
  #123 `b851f1d3a1c30ce3580980114add56b172fbd716`
  #122 retargeted to main; GitHub automatically retargeted #123 to main after #122 merged.
  Explicit ancestry checks verified f5ce10f/e4dd6b8/3e8fe1d are all included in fetched main.
- Follow-up branch: `fix/m4-desktop-acceptance-followup`, based on main
  `b851f1d3a1c30ce3580980114add56b172fbd716`. Main Reboot, Windows and deploy runs passed.
- Added native package import/export, invalid-import/both-corrupt protection, restore after
  valid import, and same-build installation-directory relocation checks. Prepared downloadable
  Windows prototype artifacts with commit metadata and three-day retention, and a manual checklist.
- Read M5 legacy #34/#58/#59/#60/#75 through restored API. Added thumbnails and explicit
  per-location satisfaction→popularity→traffic feedback to the design. No M5 gameplay implemented.
- Local Node 22.22.0: npm test 25/25, typecheck, lint:reboot, production build and browser
  12/12 passed. Desktop JS syntax and diff whitespace passed. New native tests require Windows CI;
  do not claim them passed until its result. No art, dependencies or game rules changed.
- Self-review: native download captured via Electron session, malformed imports leave files unchanged;
  valid import must restore exact results and survive relaunch. Relocation uses a disposable directory
  and user-data root, not user files. Artifact source vs PR merge SHA distinguished in metadata.
  Relocation is not newer-version installer/clean-PC evidence. Manual/Steam/M2 gates remain open.

### Execution persistence limitation

The environment reports cloud/running/connected, and actual repository commands ran. That proves
remote execution, not continuation of this chat turn after browser closure. No separate development
task ID/link/state is exposed by available tools. `codex cloud exec --help` documents submission and
`codex cloud status` can inspect a submitted task, but `codex cloud list --json` failed connecting to
`https://chatgpt.com/backend-api/wham/tasks/list`. Its required host is not in the selected policy;
the official cloud-environment documentation fetch also returned 403. Do not pass the managed
instance ID to the task CLI as though it were a verified compatible task environment ID.
No independent background development task was submitted. Earlier chat assurances that closing
this window definitely preserves development execution are withdrawn. GitHub Actions runs are
independently submitted services and keep their own run IDs; they perform checks, not ongoing AI
work. For guaranteed independent development use a platform task submission with returned ID/link
and queued/running status; that prerequisite is not confirmed here. No auto-rerun or billing configured.

Follow-up PR/current-head Windows result will be recorded after remote validation. M4/#105 remains
open for human clean-PC/offline, web↔PC and actual newer-version update/reinstall evidence. M5 remains
design-only until M4 acceptance; M2 visual approval and Steam/device/account gates remain external.

## Desktop failure diagnostics continuation — 2026-10-06 KST

User reported that the window-close probe produced its new PR after closing the window.
That is evidence for that bounded run only, not automatic restarting or indefinite execution.
Resumed actual published cloud checkout with clean `docs/window-close-probe-20261005`.
PR #124 remains OPEN at `12f8e6cc2d31a503fc4943d2e9ac2513cab89b33`; one Windows job failed,
one passed, and Reboot/CodeQL passed. The failed job is still unresolved. Run logs and
individual job logs redirect to blocked Actions/Azure log destinations; API annotations
provide only exit 1, not the error. No policy bypass or guessed root-cause fix performed.

Branch `fix/desktop-ci-failure-diagnostics` starts from #124's exact head. The only code
change adds stage labels and a GitHub error annotation containing the existing failure stack,
while preserving exit 1. This lets future failures be diagnosed through check annotations
without log-host access. It does not change gameplay, saves or test assertions and does not
claim the original defect fixed. Desktop JavaScript syntax and diff whitespace passed.
New Windows CI is required to validate execution; #124 must not merge with an unresolved
failure. M4 manual/clean-PC/update/transfer and M2 visual/Steam gates remain open.

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

## Validated diagnostic checkpoint — 2026-10-06 KST

- PR #125 record reviewed, current-head Reboot/Windows/CodeQL green; merged at
  `1da492f3196d4d8cac8068513423f2da9a9c65a6`.
- PR #126: https://github.com/Gamez0/lemonade-tycoon/pull/126
  Exact diagnostic implementation `a7622957f6d0060631f7b0eb0a75beb91b4aade3` passed:
  Windows push run 37329126623 and PR run 37329229013, both 1m35s;
  Reboot push run 37329126696 (2m06s) and PR run 37329229203 (1m53s).
  Reboot includes unit/save/file tests, strict typecheck/lint, build and browser suite.
  Native export/import/recovery/relocation and artifact upload also passed on Windows.
- Self-review: diagnostic stage/stack annotations escape percent/newline/control characters;
  original stderr and failure exit 1 retained, assertions unchanged. No speculative bug fix.
  Merged #126 into #124's feature branch only at
  `482feccdd2776c8d8ad58e433d6b738a8ee0bdb3`, after current-head green checks.
- Merged latest main into `fix/m4-desktop-acceptance-followup` without rebasing/force pushing.
  Resolved the append-only cloud-work conflict by preserving both #124/diagnostic history
  and #125's window-close record. No user work discarded. This checkpoint is documentation-only
  relative to the validated test code; final merged-head CI must be checked separately.
- PR #124 remains OPEN: https://github.com/Gamez0/lemonade-tycoon/pull/124
  Original failed Windows run 37327073561 remains unexplained; blocked log destinations
  are `results-receiver.actions.githubusercontent.com` and
  `productionresultssa2.blob.core.windows.net`. Successful reruns do not establish its root cause.
  Next: retrieve that failed log using authorized access, or investigate any new failure via
  newly accessible check annotations. Do not close the failure by assumption or merge #124 prematurely.
- Remaining acceptance: clean user PC/offline, real web↔PC transfer, true newer-version package
  replacement/reinstall, M2 user visual approval and Steam/account/device checks. M4 remains open;
  M5 implementation stays deferred. Independent M5 design was completed, not gameplay implementation.
  Runnable diagnostic work is done; no endless reruns, parallel agents or paid automation configured.

## Reproduced Windows failure and focused correction — 2026-10-06 KST

At merged head `5d60216eb2f8d76012fff86769a0531fc576433a`, Windows run 37329620688
failed again. The new check annotation exposed the exact failure: `ENOENT` on the exported
JSON path during `setInputFiles`, in stage `both-corrupt protection and portable import`.
The test had already verified that export's contents, then closed/reopened Electron several
times before reusing the download path. Playwright's installed context code deletes tracked
downloads on context close (`_deleteAllDownloads` / `deleteOnContextClose`).

Correction: capture the actual successfully exported file bytes immediately after validating
them, and import those bytes after relaunch instead of a context-owned download path. Native
export and exact import/results/relaunch assertions remain intact; no canned fixture replaces
the exported business. No gameplay/save policy changed. Desktop JS syntax and whitespace checks
passed. The demonstrated failing Windows run is the pre-fix regression evidence; Windows
current-head rerun is required to establish the fix. Historical run 37327073561 logs remain
unavailable, so do not claim its exact error independently observed.

## Post-fix validation and authentication blocker — 2026-10-06 KST

Exact pushed correction: `a80fb65cbd5db82811bf2b264c050d47022d61d4`, branch
`fix/m4-desktop-acceptance-followup`, PR https://github.com/Gamez0/lemonade-tycoon/pull/124.
Public Actions pages (containing that source SHA) confirmed:
- Windows push run 37329984149: Success, 1m41s.
- Windows PR run 37329997608: Success, 1m44s.
- Reboot push run 37329984263: Success, 1m52s.
- Reboot PR run 37329997291: still in progress at this checkpoint; verify its final outcome.
Desktop syntax and diff whitespace checks passed. The previously reproduced missing-download
fixture failure is corrected without removing native export/import assertions. M4 gameplay is
not accepted solely from these automated results.

After the correction was pushed and runs submitted, authenticated GitHub REST/GraphQL calls
began returning HTTP 401 Bad credentials; Git ls-remote also failed requesting a username.
Even a public API request through the inherited proxy returned 401, while public GitHub run
pages remained readable. Runtime still reports connected/running but provides no credential
readiness bindings. The exact expiry/revocation cause is unknown; do not extract/replace
platform credentials or start an interactive login by assumption. This differs from the earlier
CONNECT domain denial. No merge attempted under missing authentication.

This final checkpoint is a local documentation-only successor to a80fb65. If its push is blocked,
retain the local commit and report it separately from the last verified remote correction.
Next: restore supported platform GitHub authentication, push this checkpoint, verify final current
head CI and review, then decide #124 merge. Human clean-PC/offline, actual version update/reinstall,
web↔PC transfer, M2 visual and Steam/account/device gates remain open; M5 gameplay remains deferred.
No parallel agents, added billing, purchased credits, endless reruns or automatic restart configured.

## Final merged M4 checkpoint — 2026-10-06 KST

GitHub authentication recovered without credential replacement: checkpoint push, REST/GraphQL
and guarded merge succeeded. The earlier 401 remains a transient observed failure; its cause
was not independently established.

- PR #124 is MERGED after self-review and all seven checks passed on exact head
  `f03d1740eefc6d5d845b7fa8564f942811d3192d`. Windows push/PR, Reboot push/PR,
  CodeQL actions/JavaScript and aggregate check all passed. This supersedes the earlier
  in-progress status and authentication blocker, without claiming unknown old logs were read.
- Main merge commit: `9c0b474fc00cbc7689531e048d8661ae79428485`. Fetch and explicit ancestry
  check confirmed the verified head is included. PR #125 and #126 also merged as recorded above.
- Exact tested Windows prototype source: `f03d1740eefc6d5d845b7fa8564f942811d3192d`.
  Successful run: https://github.com/Gamez0/lemonade-tycoon/actions/runs/37330395029
  Download: https://github.com/Gamez0/lemonade-tycoon/actions/runs/37330395029/artifacts/11353324638
  Artifact non-expired at verification; retention three days. Metadata distinguishes source
  commit from the PR merge checkout. This is an unsigned prototype, not a Steam release.
- Final record branch: `docs/m4-manual-gates-checkpoint`, based on that main merge commit.
  Only this journal entry changes; exact checkpoint SHA and PR link are provided in its PR body.
  Documentation whitespace check passed; no redundant game suite rerun for documentation only.

Next required evidence: use docs/reviews/m4-windows-manual-checklist.md on an actual clean
Windows PC, including offline play, real web↔PC JSON transfer and true newer-version
replacement/reinstall with saves preserved. Record the reviewer/OS/DPI/build IDs/outcomes.
M4/#105 remains OPEN; M5 gameplay remains deferred. M2 visual approval and Steam/account/device
validation are also open. No further demonstrated runnable defect remains from this batch.
This bounded run stops at these external acceptance gates; no auto-restart, parallel agent,
API billing, credit purchase, paid service or Steam public sale is configured.

## M10-directed independent preparation — 2026-10-06 UTC

User authorized progress through M10 with a thorough check at each milestone. Existing
manual gates remain open; this instruction does not fabricate actual Windows/user/Steam
acceptance. Runtime reports cloud/running/connected. Actual checkout commands and GitHub
access succeeded, starting clean at e1f78407ea8f935db72a5e314fd39e2ea4db7fdd.
Reviewed #127 documentation diff and all seven exact-head green checks, then guarded merge.
Fetched main and branched `feat/pc-release-preparation`; no user changes/PR #83 touched.

Implemented independent M7/M9 packaging groundwork: dedicated reboot-only Windows build,
bundled font/OFL, rejection of legacy/research assets, SHA-256 distribution inventory with
source vs checkout commits, Windows CI verification before artifact upload, three regressions.
Web legacy preview retained. No M5/M6 gameplay or save version change.
Prepared M6 economic/UI/save design, M7–M10 acceptance plan and non-executable SteamPipe
VDF examples. Read existing roadmap/reviews/art register and M5 design; design numbers
are experiment proposals, not original-game measurements or tested balance.

Local Node 22.22.0: unit/save/file 25/25, strict typecheck and lint passed. Desktop build
and six-file asset audit passed; release regressions 3/3 passed. Web build/browser and
current-head Windows results will be recorded after completion. Self-review is in
`docs/reviews/pc-distribution-audit.md`. No separate background task/scheduler exists.
Exact implementation SHA and PR URL are supplied in the PR metadata; use
`git log -1 --format=%H -- scripts/release-manifest.cjs` for the code commit.

Remaining milestone gates: M2 visual approval; M4 clean-PC/offline/actual web↔PC and true
version update/reinstall; M5 gameplay and strategy/save compatibility; M6 actual management;
M7 music/content/tutorial/language/manual package; M8 real participants/hardware; M9 actual RC
and rights; M10 account/AppID/private-client validation. Continue independently runnable
preparation, but do not mark these milestones reached from documents/CI or run endless tests.

Local validation correction: the first browser invocation was started before the web build
finished and received a root 404 (no canvas). Stopped that invalid invocation and reran only
after the production build exited successfully; this is a sequencing error, not a dismissed
application defect. Final browser result is recorded below when complete.

Additional independent M8 groundwork: 30-day existing street campaigns across four seeds,
full-history daily round-trip, exact opening replay, cumulative accounting and overnight ice
checks. Node 22 unit/save/file suite now 26/26 passed. This is baseline regression evidence,
not three-place progression/management balance or real playtesting. PR #128:
https://github.com/Gamez0/lemonade-tycoon/pull/128
Initial implementation a6b98fb8e8b6cc145eb1312a64f30bde6774d8e8.

Validated checkpoint: implementation branch `feat/pc-release-preparation`, code/test commit
`cdd25cc62b63a3b93b120e244b6af86f0a0cb2ad`, based on main
`ee6c73283c269829f58aa3c4baa0e39ec8170599` (merged #127).
Local web production build and final browser suite passed 12/12; unit/save/file 26/26,
release 3/3, typecheck/lint, dedicated PC build/audit and diff whitespace passed.
The premature preview had retained a root-404 server after interruption; explicitly stopped
only this run's Playwright/preview processes before the successful fresh run. No preview is
intentionally left running.
Windows implementation run https://github.com/Gamez0/lemonade-tycoon/actions/runs/37475188436
passed all packaging/native save/inventory/upload steps at a6b98fb. That is older-head evidence;
cdd25cc Windows/Reboot/CodeQL are pending at this written checkpoint and must be verified
for the final documentation successor before merge. PR #128 body will record the final
exact-head results and merge outcome. This checkpoint is an ordinary commit, not a scheduler.

Next: actual M4 Windows checklist evidence is required before M5 gameplay implementation
under the existing ordered acceptance agreement. M6/M7–M10 independent groundwork above is
prepared, not accepted milestones. Do not claim overnight duration, automatic restart,
M10 completion, Steam upload, human playtests or Windows user acceptance from this run.

## Final verified PC preparation checkpoint — 2026-10-06 UTC

PR #128 https://github.com/Gamez0/lemonade-tycoon/pull/128 MERGED after self-review and all
seven checks passed on exact final head `76e1596c4fddfaf1b696ff4871685e10fb6bdeb7`.
Main merge `aa920a3f49225b3e216be18079afbc533935d2ec`; fetch/ancestry confirmed inclusion.
Windows push run 37475501456 (1m55s) and PR run 37475510261 (1m45s) passed native save,
PC-only packaging, release regressions, manifest verification and artifact upload.
Reboot push 37475501482 (1m58s) and PR 37475510005 (2m10s) passed; CodeQL run 37475503509
and aggregate check passed. This supersedes pending states above.
Local final evidence: Node22.22.0, unit/save/file 26/26, release regressions 3/3, browser12/12,
strict typecheck/lint, web and desktop production builds, six-file PC audit, whitespace.

Verified source-specific Windows prototype artifact (non-expired at check, three-day retention):
https://github.com/Gamez0/lemonade-tycoon/actions/runs/37475510261/artifacts/11419082328
Source SHA 76e1596; unsigned prototype, not RC or Steam release. M4 manual checklist still applies.
Final journal-only branch `docs/pc-preparation-checkpoint` starts from aa920a3; its precise SHA
and focused PR link are recorded in the PR metadata. No redundant gameplay checks for this
journal entry; its own CI must be verified before any future merge.

Completed runnable independent preparations: M6 economic/UI/save design, M7–M10 acceptance
plan, PC distribution isolation, file/commit/checksum audit, thirty-day baseline regression,
SteamPipe placeholder templates. M5 gameplay was not started because the existing M4 acceptance
prerequisite remains unfulfilled. No milestone completion, human playtest, actual newer-version
update, clean-PC or Steam account/client verification is claimed. Next: record actual M4 Windows
manual outcomes and M2 visual approval, then implement M5 against its existing design, M6,
and the documented later sequence. If explicitly authorized to prototype later gameplay before
M4 manual acceptance, update that sequencing decision first and keep all acceptance gates open.
This run stops here; no overnight-duration guarantee, auto-restart, preview server, parallel
agent, paid API/service, purchase, Steam upload or public sale is configured.
