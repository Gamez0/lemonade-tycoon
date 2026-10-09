# GitHub working guide and audit

Reviewed on 2026-10-08 against main and open development PRs. Milestones describe
acceptance stages; leaf issues describe concrete tasks. A closed implementation
task does not imply main integration, human acceptance or Steam verification.

## Working views

- [Milestones](https://github.com/Gamez0/lemonade-tycoon/milestones): completion by issue count, not estimated time. Parent trackers #105-#111 are excluded.
- [Awaiting merge](https://github.com/Gamez0/lemonade-tycoon/issues?q=is%3Aissue+is%3Aopen+label%3A%22status%3Aneeds-merge%22)
- [Manual acceptance](https://github.com/Gamez0/lemonade-tycoon/issues?q=is%3Aissue+is%3Aopen+label%3A%22status%3Amanual%22)
- [Deferred gates](https://github.com/Gamez0/lemonade-tycoon/issues?q=is%3Aissue+is%3Aopen+label%3A%22status%3Adeferred%22): physical offline, DPI and clean Windows/no-Node remain release requirements.
- [Blocked work](https://github.com/Gamez0/lemonade-tycoon/issues?q=is%3Aissue+is%3Aopen+label%3A%22status%3Ablocked%22)
- [Backlog](https://github.com/Gamez0/lemonade-tycoon/issues?q=is%3Aissue+is%3Aopen+label%3A%22status%3Abacklog%22)
- [Actions](https://github.com/Gamez0/lemonade-tycoon/actions): exact-commit checks, browser traces and Windows prototype downloads.
- [Discussions](https://github.com/Gamez0/lemonade-tycoon/discussions): questions and general feedback; convert actionable defects into issues.

Use one status label per leaf task and change it as prerequisites change. Keep area
and priority separate. Use native sub-issues and linked prerequisites. `Refs #N` is
for partial work; `Closes #N` is for fully satisfied acceptance conditions. Do not
close manual gates from CI or automatically mark old issues stale.

## Historical issue decisions

| Issues | Decision and evidence |
| --- | --- |
| #11 | Consolidated into #105 and its save/Windows tasks; remaining gates stay open. |
| #34, #58, #59, #60, #75 | Consolidated into #106; reboot locations, thumbnails, budgets/patience and ratings exist in PR #131, pending main integration. |
| #35, #72, #73, #74, #32 | Consolidated into #107; advertising, staffing, equipment and fees exist in PR #132, pending main integration. |
| #25, #26 | Completed on main: simulation demand varies willingness by profile and weather. |
| #29 | Completed on main: selling settings are displayed; legacy also has merged PR #31. |
| #37 | Completed on main: average cup cost is displayed and consumption-based profit is accounted separately from revenue. |
| #38 | Completed on main: README explains the game, setup, checks and contribution links. |
| #16 | Keep open for visual acceptance; stand-facing code exists but visual confirmation is still required. Related #97. |
| #3 | Legacy forecast exists; winter snow has 30% weight. Original rare-snow wording needs clarification; retain as legacy backlog. |
| #41, #57, #61 | Optional legacy refactoring remains valid. The reboot architecture does not rewrite preserved legacy classes. |
| #47 | Formatting request remains valid: eslint-config-prettier disables conflicts but does not format source. |
| #43 | Korean contributor README is still missing; English-only initial game support does not cancel this request. |

Eleven consolidated requests are closed as superseded, not completed. Original
bodies are preserved beneath dated review notes. Five fulfilled requests are closed
with main evidence. PR #83 and the parent's uncommitted work remain separate.
PR #129 is a historical checkpoint whose docs need reconciliation with #130-#132
before merging; it is not closed automatically.

## Automation and repository protection

`checks.yml` runs simulation, release-policy, strict type/lint and production-browser
checks plus reusable Windows package/save checks on PRs, main pushes or manual dispatch.
Feature-branch pushes do not duplicate the PR run. Obsolete branch runs are cancelled,
Node 22/npm is cached, and browser evidence is retained seven days. Windows artifacts
retain their existing three-day policy and checksum manifest. Windows manual dispatch
remains available.

The existing gh-pages deployment is called only after both Linux/browser and Windows
checks pass on a main push. PR builds cannot deploy. This is a development web preview,
not a Windows release or Steam upload. Existing CodeQL scans JavaScript/TypeScript and
Actions; no duplicate scan is introduced.

Dependabot proposes weekly npm and Actions updates, grouping npm minor/patch updates
and Actions updates. Major npm updates remain separate; open-PR limits control noise.
Updates require review and passing checks; automatic dependency merges are not enabled.

Main protection uses the actual current CI job names, disallows force push/deletion
and requires resolved review conversations. A compulsory second-person approval is
not suitable for this solo workflow; self-review remains required. Stacked game PRs
must update their base after the operations change; do not merge them just for cleanup.

## Projects and releases

Recommended Projects board: Backlog / Ready / In progress / Review / Blocked / Done,
with milestone grouping and Priority/Area fields. Closed/merged-to-Done and repository
auto-add workflows avoid manually copying tasks. Milestones show stage acceptance;
the board shows next runnable tasks across stages.

Current authentication lacks Projects scope. The account owner must complete
`gh auth refresh -h github.com -s project`; no board is claimed created before access
is confirmed. The issue filters above work without Projects access.

Use draft Releases with a versioned ZIP, checksum, changelog and known gates when an
intended candidate is agreed. The current Windows alpha is not an accepted RC.
Published Releases, Steam uploads/submission and public sales are separate actions;
this organization change does not publish candidate artifacts.
