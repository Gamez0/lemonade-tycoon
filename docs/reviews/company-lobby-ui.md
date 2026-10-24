# Company lobby UI - 2026-10-25

The user requested improvement to the lobby used to select and load saves.
The old composition confined eight names to a small list, separated its load
button from the selected summary and retained inactive exchange/get-game
controls. It did not expose a company's progress until selection.

The640x480 classic frame now uses a two-column company card grid with slot
number, name, mode, trading day and cash on each occupied card. Empty cards
have a separate appearance and explicit availability text. A distinct selected
card connects to a right-side summary with calendar, cash, location and current
company indication, followed by the primary Load Game action.

New Career,30-day Challenge and Import Backup occupy their own action row.
Options/help/credits/quit remain in the header. Automatic saving is explained
in the footer. The create form replaces the selected preview/load action;
full-book replacement still requires its existing checkbox. Recovery controls
take the new-company action positions only while recovery is required.
Arrow keys/Home/End navigate selection without loading or mutating a save.

Names remain text nodes and long names are clipped in cards and limited to
two preview lines, with full titles retained. Per-slot raw-keyed summaries are
bounded to eight entries, so long histories are not decoded on every render.
Company journal, save10 format, transfers, replay and import/export storage
contracts are unchanged. The new layout is an intentional product UI change,
not a claim of matching the original menu's exact coordinates.

Validation includes geometry/overlap checks, keyboard navigation, long/full
slots and explicit replacement cancellation, escaped names, company isolation,
protected future saves, failed journal cleanup, correct-company recovery,
challenge completion and held close/transfer ordering. Actual native menu
creation/switch/relaunch/options/quit and screenshot review are recorded in
the PR, followed by exact-head full required CI before integration. Candidate
alpha18 retains the map viewport and Rent fixes from alpha17/16.
