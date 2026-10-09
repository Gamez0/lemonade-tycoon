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

Verified draft delivery now uses `scripts/release-zip.ps1` in Windows CI and
dispatch-only `release-draft.yml`. The draft job takes an already successful,
exact-source main checks run, verifies the downloaded ZIP/checksum/manifest and
GitHub asset digests, and refuses published or different-source releases.
The real alpha4 path passed checks37890734957 and draft37891107418. It remains
an internal prerelease; a documentation-only main commit must not retarget that
frozen candidate or reuse its version for a different source.

## Feature coverage and delivery decisions — 2026-10-09

Routine implementation must finish through self-review, exact-head passing CI and
main integration. Human release acceptance is tracked separately; it does not block
merging implementation. Reconcile stacked bases before merging and preserve current
branch protection rather than bypassing it to clear the PR list.

| GitHub capability | Current decision |
| --- | --- |
| Code, branches, PRs, diffs, review conversations | Use; reviewed agent changes are merged after current CI, user-owned PR83 remains separate. |
| Issues, forms, labels, milestones, sub-issues/dependencies | Use for implementation, acceptance and release gates; close integration tasks only after main includes the source. |
| Projects and automatic board workflows | Recommended; account token lacks project scope. Existing label views remain usable; do not claim a board exists. |
| Actions, reusable workflows, cache, concurrency, job summaries/logs, artifacts | Use; keep Linux/browser and all native Windows suites required and fail on any suite error. |
| Branch protection and rulesets | Use; required exact job names, current-base checks, resolved conversations, no deletion/force push. |
| Pages and deployment environments | Use for the tested development preview; deployment follows successful Linux and Windows jobs. |
| Dependabot alerts/security updates/version proposals | Use with review; consolidate compatible updates and document incompatible compiler proposals. |
| CodeQL and secret scanning/push protection | Enabled and verified; preserve them. |
| Dependency graph and Dependency review | Use; PR-time vulnerability checks and the observed dependency-review check are required. |
| Releases, tags, versioned assets and checksums | Use the verified Windows ZIP/internal draft workflow; preserve source identities and uploaded digests. Public publication remains separate. |
| Discussions | Enabled; general feedback belongs here, actionable work belongs in issues. |
| Insights, dependency and Actions history | Use as evidence for development/security/CI cost and failures; milestone issue counts are not quality or time estimates. |
| Wiki | Disabled; versioned docs in the repository are the maintained source. |
| Packages/container registry | Not needed for the current Windows executable; no separate library/container distribution. |
| Codespaces/dev containers | Optional; cloud browsers cannot establish native Windows acceptance. Current local Windows/Actions workflow is sufficient. |
| Copilot/partner Agents, custom agents and agentic workflows | Reviewed separately using official docs; user lacks the required paid Copilot access. Do not purchase or enable paid agents; existing Codex plus GitHub workflows remains usable. |
| Marketplace apps, webhooks, organization-only governance | Add only for a concrete uncovered need; avoid duplicating existing automation or broadening access without a reason. |

This covers the repository-relevant feature families, not a claim that every
GitHub product is required. No paid service, public release or Steam submission
is enabled by this review. Remaining access-dependent work stays explicit.
