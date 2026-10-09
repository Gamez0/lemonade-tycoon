# Windows candidate operations

Candidate version: 0.2.0-alpha.2, sourced from package.json. This is a test
distribution; manual acceptance is deferred for the current engineering run.
Build with Node22 and committed npm lockfile: npm ci, npm test, typecheck,
lint:reboot, test:release, build-nolog, test:browser, desktop:package:win. Set
LEMONADE_DESKTOP_EXE and run test:desktop, test:desktop:ui, test:desktop:dpi,
test:desktop:locations, test:desktop:management, test:desktop:audio and
test:desktop:campaign. Each suite failure must fail the run immediately.
Record source and checkout hashes in build-info.json; release-manifest.cjs writes
and verifies all SHA256 file checksums. Retain the entire distribution directory,
Electron/Chromium notices and app.asar. Never ship the working tree/public research.

After checks and manifest verification, run scripts/release-zip.ps1 -PackageRoot
VERIFIED_PACKAGE. It rejects dirty/unversioned metadata and altered manifests,
checks every compressed file's size/hash including the manifest, and writes a
source/version-named ZIP, checksum and manifest copy. Existing outputs are preserved.
Windows CI retains these three files in windows-prototype artifacts; download the
artifact and extract its product ZIP before running the complete package. The
already-compressed bundle uses artifact compression-level0 to avoid redundant work.
CI source/run annotations preserve version, Electron/Node and platform metadata.

For an internal draft, dispatch release-draft.yml on main with its successful
Reboot checks run_id, or run node scripts/draft-release.cjs RUN_ID from a clean
matching main checkout. It requires the exact source and both required jobs,
downloads only that run's version/source-named bundle, verifies its checksum and
manifest identity, and confirms GitHub's uploaded digests. It creates only a draft
prerelease and refuses published or different-source releases. Each workflow run
has read-only checkout permissions except the draft job's contents-write/actions-read.
No Steam upload, public publication or fee is performed by this workflow.

Business data remains %LOCALAPPDATA%/Lemonade Tycoon/save.json and save.backup.json,
independent of install location. Export a backup before updates. Version5 migrates
v0-v4 without rewriting historical purchases or profit. It tracks zero-cost ice
from owned ice makers; old charged checkpoints remain paid. Future versions reject
safely. A forced exit replays the paid opening without new fees or ice production.
Audio preferences use the application's local storage and do not alter the ledger.
For isolated QA, set --user-data-dir to a disposable Chromium profile as well as
isolating APPDATA/LOCALAPPDATA for business files. On Windows these environment
overrides alone do not isolate Electron's persisted browser/audio settings. Native
tests verify actual userData and session storage paths before acting.

Rollback: retain previous complete package plus exported pre-update JSON. Close
the current game, back up current save and backup files, run the previous package
from a separate folder and import the pre-update export. An older application
cannot read a newer save version: do not overwrite current data with rejected JSON.
Use isolated APPDATA/LOCALAPPDATA for rehearsals, never real player business data.

Help / Sound > Export diagnostics includes runtime/version and bounded event log.
diagnostics.jsonl records timestamp and predefined event names only (startup,
save-failed, renderer-gone, load-failed, close-timeout), never full saves, usernames,
paths, raw exceptions or credentials. It is capped at approximately64KiB and may
be manually deleted while the game is closed. Report source hash, OS/display and
reproduction with this export. Music failures must not prevent gameplay.

Unsigned/uninstalled portable Electron package; no installer/signing claim.
Clean-PC and update/reinstall acceptance remain separate from development tests.

Audit the actual shipped archive and notices with node scripts/audit-package.cjs
VERIFIED_PACKAGE; Windows CI performs this immediately after packaging. Source and
notice inventory: [rights register](rights-register.md). Final name/contributor
acceptance remains open even when every notice matches.

For an actual two-package upgrade rehearsal, compile helpers with npm test, set
LEMONADE_OLD_EXE, LEMONADE_DESKTOP_EXE and LEMONADE_EVIDENCE_ROOT, then run
npm run test:desktop:upgrade. The tool refuses identical source/bundle pairs and
isolates all saves. It verifies schema migration while preserving historical
accounting, replacement/re-extraction, paid partial-sale replay, corrupt-save
protection, published-preview portability and renderer-network-disabled play.
Reports retain both build identities and bundle/tool SHA256 hashes. These checks
establish a development-machine rehearsal, not physical-disconnect, clean-PC,
Steam-install or human acceptance.

CI additionally runs test:desktop:dpi at forced renderer scales125%,150%,200%,
alongside the baseline100% UI suite. Every scale checks all21 tab/window-size
combinations, selling/results fit and price typing/save/relaunch, and confirms
the requested devicePixelRatio actually applies. Screenshots/geometry are retained
as windows-ui artifacts. This catches rendering regressions but does not replace
physical monitor DPI, minimum hardware or human readability checks.

test:desktop:campaign drives a new business through thirty actual native UI days,
earned locations, all equipment levels and staff/advertising choices. Every day
independently reconciles cash and cumulative income/expense fields; six relaunches
must preserve exact results and free-ice use must occur. Save growth remains under
the native IPC limit. CI retains the report and final ledger screenshot. This is
automated business-day coverage, not a human or thirty-real-day playtest.
