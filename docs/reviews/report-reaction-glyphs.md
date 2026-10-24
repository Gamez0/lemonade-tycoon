# Report and reaction glyphs

The report toolbar reused the Profit & loss ledger for Profit graph and a supply
carton for Balance sheet. Give those existing report pages their own line-graph
and account-sheet/coin glyphs. The Daily calendar now shows a small grid rather
than a fixed numeral1. These are independently authored vectors in the existing
26-unit icon system, displayed at32px. Actual chart values remain data-driven;
the tab symbol is only a navigation label.

No-sales commentary previously reused the price-rejection dollar bubble even
when its advice identified empty stock or a waiting line. Use a neutral face
there, while preserving the existing cause-specific text and live price icon.
Happy/unhappy buyer-rating symbols and the price/passing/stock/wait symbols were
reviewed against private reaction references and retained. Small map faces and
the positively reviewed Staff portraits are unrelated to this report change.

`art/studies/remaining-images/report-glyph-review.cjs` makes the private
original/baseline/revised board at actual32px and42px sizes, checks stroke-safe
bounds and image decoding, and saves ignored `.local-m4/report-glyphs` evidence.
Original pixels are comparison inputs only. No bitmap, new weather/customer
state, accounting rule or save change is introduced.

Initial checks: model79/79, typecheck, reboot lint, production build and eight
focused browser report/graph/balance-sheet tests passed. Ten role comparisons
decode and stay within stroke-safe bounds. Native packaged review and exact-head
CI remain required before integration; human visual acceptance remains in #97.
