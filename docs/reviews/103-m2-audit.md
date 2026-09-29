# M2 acceptance audit self-review

PR #102 was completed and merged before this audit, as requested. The acceptance matrix is in `docs/research/m2-acceptance-audit.md`.

Found and fixed two responsive omissions: 521-700px hid all news/progress, and narrow Supplies moved Start day down by about 22px. Added actual viewport/visibility/button-position checks for 375/520/640/768px and retained desktop equal-column/5:4 checks.

A second review found that the original's visible SKIP operation could be implemented within M2 instead of leaving it absent. The shared customer transaction handler now supports both animated arrivals and resolving remaining visits. SKIP clears the animation and advances from the current immutable state, including any already committed in-flight visitor. It records one completed snapshot, updates reaction totals, and immediately enables next day. Ordinary day completion still waits for the last visitor's exit. Skip before any visit and after at least one transaction are compared with a normal deterministic day; cash, stock, revenue, costs, visitor totals and one-day ledger are checked, including delayed stale-animation effects.

Also added storage overflow checkout in the browser: buy 900 ice, stage 40 lemon and 120 ice, reject the entire order, retain both stock/cash and the draft, then cancel it. Pure checkout guards already covered this; the UI path had not.

No simulation constants or M3 concurrency/queue rules changed. M2 remains open: typography/artwork are original interpretations, original motion timing remains unverified, daily weather is fixed and user visual acceptance is pending. The second longplay attempt stalled after seeking and does not count as motion evidence.

Check final local and CI results in the PR. Do not use a previous revision's green status to merge this audit branch.

Final local result: strict typecheck and zero-warning lint pass, production build passes, and all 7 browser tests pass in 2.2 minutes. The two SKIP paths match the deterministic normal-day cash/stock/revenue/cost result and keep exactly one completed report. Medium-width and narrow-layout regressions and atomic storage overflow pass. Inspected updated selling/SKIP and 640px captures. CI on the current PR head remains the required merge gate.
