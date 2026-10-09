# Windows candidate operations

Candidate version: 0.2.0-alpha.1. This is a test distribution, not an accepted RC.
Build with Node22 and committed npm lockfile: npm ci, npm test, typecheck,
lint:reboot, test:release, build-nolog, test:browser, desktop:package:win. Set
LEMONADE_DESKTOP_EXE and run desktop, desktop:ui and desktop:locations checks.
Record source and checkout hashes in build-info.json; release-manifest.cjs writes
and verifies all SHA256 file checksums. Retain the entire distribution directory,
Electron/Chromium notices and app.asar. Never ship the working tree/public research.

Business data remains %LOCALAPPDATA%/Lemonade Tycoon/save.json and save.backup.json,
independent of install location. Export a backup before updates. Version4 migrates
v0-v3; future versions reject safely. A forced exit replays the paid opening.
Audio preferences use the application's local storage and do not alter the ledger.

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
