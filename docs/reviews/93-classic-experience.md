# M2 implementation self-review

Scope: #93–96, with automated and visual evidence for #97. A single PR integrates the shared screen shell, transactions, reports and artwork so the intermediate branch stays playable. #97 and milestone 2 remain open for the user's visual acceptance.

## Behavior

- Four real screens replace simultaneous forms. Stock/cash, forecast and the neighborhood retain their positions. The Start day button stays at the same position across preparation tabs.
- Supplies offers ingredient subtabs and three bundle sizes. Counts form an order; BUY commits all ingredients or none. CANCEL clears every category. Switching screens preserves the order. Opening with an outstanding order returns to Supplies and explains the required action.
- Invalid recipe/price values bring their own screen into view and focus the bad field. Failed checkout preserves the draft, cash, stock and purchase accounting.
- Selling shows Performance / Today's settings, distinct passing/price/stock feedback and speed near the scene. Preparation is locked. Next day waits for the final customer to exit.
- Results has Last day and Profit & loss. Immutable completed-day snapshots feed the ledger once per completed day. During preparation the ledger excludes new purchases explicitly; restarting clears it.
- 50:50 columns and a 640×512 neighborhood; cart rendered at 0.8 scale, expanded lower garden, clearer inventory silhouettes and results icon. All artwork is authored code, not extracted original assets.

## Review findings and corrections

1. Extending the canvas left a blank bottom strip because the generated texture was still 640×440. Updated both texture and weather overlay to 640×512 and checked a screenshot.
2. Different tab content heights moved Start day. The work panel now uses a fixed minimum height and flex placement; all four preparation tabs measured button top y=669 at a 1280×1000 viewport.
3. The first browser run started while production output was rebuilding and received 404s. It is invalid evidence. Rebuilt to completion before launching a fresh preview server and browser suite.
4. An initial history lookup used Array.at, outside the project's configured library target. Replaced with indexed access; strict typecheck passes.
5. Reference motion remains unverified. The YouTube page loaded, but seeks stayed at readyState 1 and displayed buffering. No frame timing, queue behavior or original animation fidelity is claimed. Existing 1.6-second sequential visits are our own presentation.

## Verification

- Pure simulation: 9 tests, including immutable multi-item success, empty/invalid orders, insufficient funds on a later item, storage overflow on a later item and phase guards.
- Strict reboot TypeScript and zero-warning ESLint.
- Production build includes reboot and legacy entries.
- Browser suite: desktop three-day accounting and cumulative ledger; purchase/cancel/errors and input recovery; 375px three no-sale days and restart during a visit. Canvas ratio and equal columns are asserted.
- Same-width reference board: recipe, price, order draft, selling, daily result, three-day ledger and previous M1 capture. User acceptance is pending.

Local final result: simulation 9/9; strict typecheck and lint pass; production build exits 0; browser 3/3 pass in 2.0 minutes. Both desktop and 375px scenarios complete three days. The earlier 404 run is superseded. Remote CI status is recorded in the PR.

## Limits

M1's per-cup economics, supply prices, day/customer counts and reputation rules are unchanged. No advertising, pitcher production, spoilage, queue economy, staff, paid rent, persistence or sound was introduced. Results use completed days only. This is a closer original-style interface, not a claim of exact pixel or motion reproduction.
