# Playable neighborhood review

The default entry now runs the reboot's complete preparation, selling and results loop. `legacy.html` preserves the previous entry and assets; production builds include both pages. Original code-authored street, kiosk and character textures accompany native DOM controls.

## Findings corrected

- The draft had no connected entrypoint and an empty CSS import. Connected the reboot and removed the invalid import.
- Customer appearance changed at arrival because the draft guessed a profile. Preview the deterministic event without mutation and retain its profile for the visit; commit accounting only at arrival.
- The draft jumped the customer's vertical position at purchase. Keep a continuous horizontal route with stop and departure poses.
- The last visitor settled simulation before leaving. Disable next day until exit completes; restart can deliberately cancel animation. Every reset clears visit state and speed.
- Invalid field values could be overwritten by unrelated renders, and blank ice became zero. Preserve edits, check browser number constraints, report invalid fields, and prevent purchases/opening from silently using another plan. Round validated dollar input to integer cents.
- Narrow CSS grid sizing expanded to the canvas's intrinsic width. Set grid children to `min-width: 0`; retain full controls at 375px.
- Restart confirmation persisted after focus moved. Cancel it on blur or Escape and clear draft values when confirmed.
- The inherited Yarn lock diverged from npm's lock. Use npm consistently for README, contribution instructions, CI and deployment; remove the stale Yarn lock only in the reboot branch. The parent worktree's Yarn changes are untouched.

## Validation scope

Strict reboot TypeScript and zero-warning reboot ESLint. Eight deterministic simulation tests, including ten days and 200 seeded invariants. Chromium browser coverage uses real controls for three consecutive days and reconciles revenue, consumed cost, profit and cash change; also tests invalid/blank/fractional input, insufficient cash, no-sale satisfaction, restart, speed reset and narrow layout. Production output is the browser test target, avoiding development hot reload during checks.

Manual screenshot inspection covers desktop results, selling, and narrow preparation/results. Legacy sources are intentionally preserved; their pre-existing repository-wide type/lint findings remain documented, not suppressed. This is a silent, single-location session-only MVP, with no persistence or expanded progression.
