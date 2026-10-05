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

- Local handoff files prepared; remote publication and CI tracked in the setup PR.
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
