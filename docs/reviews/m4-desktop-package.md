# M4 Windows package and save verification — 2026-10-01

The first Windows x64 Electron package runs the reboot offline from bundled files. The renderer has no Node access. A narrow preload bridge sends only primary/backup save reads and writes to the main process, which uses the M4 file adapter under `%LOCALAPPDATA%\Lemonade Tycoon`. The same versioned JSON document is used by web export/import and the PC game. The game waits for the initial disk read before showing controls and flushes queued writes on normal window close.

Build with `npm run desktop:package:win`. The unpacked prototype appears in `release/Lemonade Tycoon-win32-x64/`. Run `Lemonade Tycoon.exe` without Node or a dev server. If the source drive lacks space, set `LEMONADE_DESKTOP_BUILD_ROOT` and `TEMP`/`TMP` to a drive with enough capacity before packaging. For the package test, set `LEMONADE_DESKTOP_EXE` to the absolute executable path and run `npm run test:desktop` on Windows. This test uses a temporary user-data root and tests preparation save, normal close/reopen, force termination during selling, completed results and damaged-primary recovery from backup.

Steam Cloud is not configured yet. If enabled for Windows, the [Steam Auto-Cloud root path](https://partner.steamgames.com/doc/features/cloud) can use `WinAppDataLocal`, subdirectory `Lemonade Tycoon`, and pattern `save*.json` to include primary and backup but exclude temporary files. Test a second PC, offline edits, cloud conflicts and a fresh Steam install before claiming cloud saves. The local save works without Steam.

This is a functional package prototype, not a release candidate. Code signing, app identity, package update/reinstall checks, a clean-PC check, and Steam Cloud configuration remain open. Keep M4/#105 open until those storage acceptance checks are met; repeat package checks at M7–M10.

## Repeatable package evidence — 2026-10-05

PR #123 is merged. The Windows Actions job runs the native package tests, including
normal-close flush and forced termination. The follow-up job publishes a three-day
`windows-prototype-<source SHA>` artifact after tests pass; `build-info.json` identifies
both the source commit and tested checkout (PR merge SHA where applicable).
See [manual acceptance checklist](m4-windows-manual-checklist.md) for download, safe
user-data testing, web/PC transfer and clean-PC/update evidence. Same-build relocation
and JSON import/export regressions aid acceptance but do not close the manual gates.
