# M4 save checkpoint review — 2026-10-01

Current format: M5 v3 adds location progression and a paid opening checkpoint.
Reload during selling replays that checkpoint without charging rent/moving again.
v0/v1/v2 imports preserve historical accounting; native save/close/forced-termination
coverage has since been added. See [M5 review](m5-locations.md) and the Windows device
review. The dated sections below describe earlier implementation checkpoints.

Browser save foundation is implemented; M4 remains in progress until desktop storage and packaged termination recovery are verified.

- Preparation purchases and plan changes, the checkpoint immediately before opening, completed results, and next-day transitions save automatically. Reload during selling replays that day from its opening checkpoint, including the same random seed. Unconfirmed supply orders are not saved.
- Export save downloads portable JSON; during selling it exports the opening checkpoint. Import validates the entire document before replacing the current business. Export before importing if both businesses must be retained.
- Format v1 stores current state and completed-day history. Prototype v0 has the same fields and is normalized to v1. Other versions are rejected, never guessed. Cash, inventory, counters, chronology and current-result/history agreement are validated.
- Storage uses a getItem/setItem boundary. Browser localStorage is device/profile/origin specific, can be cleared and can fail from quota or privacy settings. Export backups regularly. No cloud sync is provided.
- The previous valid save is retained as a backup. A damaged or missing primary can recover from it. If neither is valid, automatic writes remain blocked until an explicit import or confirmed new business; playing does not erase the damaged original.
- New business requires a second click; Escape or focus loss cancels confirmation.
- Windows user-data directory storage, crash-safe filesystem replacement and packaged app termination tests remain pending for the desktop adapter/M7 package. This change does not claim native save support.

Self-review found and fixed an opening-day write bypassing damage protection, missing-primary backup recovery, and inconsistent results/history acceptance. Added simulation-level save tests and browser reload/import/export/recovery checks.

Validation: 17 simulation/save tests and 11 production-browser tests passed; strict reboot typecheck, lint, production build and git diff whitespace check passed. Preview server left running at http://localhost:8080.

## Windows file storage adapter — 2026-10-01

`src/desktop/file-storage.cjs` implements the same `getItem`/`setItem` contract for a future Windows desktop shell. It places `save.json` and `save.backup.json` under `%LOCALAPPDATA%\Lemonade Tycoon`, outside the installation folder. Each write uses a unique temporary file in that directory, flushes it, and replaces the destination; the existing valid-backup rule in `save.ts` still applies. Reads distinguish missing files from permission or I/O failures. The directory is selected from the signed-in user's environment, not a hardcoded profile.

The adapter is tested with the same portable save document as the browser. It is not yet wired to a packaged application, so actual Windows process termination, update/reinstall behavior and file replacement still require the desktop shell and M7 package verification. Browser exports provide migration input for that future shell.
