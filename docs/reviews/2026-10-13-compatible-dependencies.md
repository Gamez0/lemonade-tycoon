# Compatible dependency maintenance — 2026-10-13

Consolidate the pending Dependabot minor/patch and Actions proposals on the current
release fixes: Electron 44.5.1 to44.7.0, Playwright1.63 to1.64, setup-node6 to7 and
upload-artifact6 to7. The package lock changes only Electron and the matching three
Playwright packages. Node22, source/version identity, notices, permissions, artifact
names, retention and manual internal-draft behavior remain intact. The packager
already reads the installed Electron version instead of hardcoding its download.

Validation must include the exact combined head's browser/simulation/type/lint,
dependency review and all real Windows suites, shipped notices and complete ZIP
generation. Prior individual Dependabot results are not combined-head evidence.
Reconcile onto main after PR225 integration before merging; no bypass of required
checks. PR220/221 can be closed as superseded only after this source is on main.

Major engine/build upgrades are separate proposals. Vite8's actual checks run
38386072042 fails both builds with `TypeError: manualChunks is not a function`;
current Vite6 remains the release baseline. Phaser4 requires a separate engine
migration review, including retained legacy compatibility and visual acceptance.
Neither major proposal is silently integrated with release fixes or counted as a
release requirement. No new game features, billing or public distribution.

Local combined validation: npm ci installed the committed lock and reported zero
vulnerabilities; simulation/storage59/59, release15/15, typecheck and strict lint
passed. PR225 passed exact-head checks38387387016 and merged as8e8263a; rebased
this candidate onto that main and require fresh checks for its final head.
