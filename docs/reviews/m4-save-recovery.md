# M4 save checkpoint review — 2026-10-01

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
