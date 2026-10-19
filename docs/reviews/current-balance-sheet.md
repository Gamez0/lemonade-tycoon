# Current balance sheet

The original capture named `result-stock.png` actually shows a Balance Sheet.
Add a fourth illustrated report tab for current cash, paid supplies at unit cost,
equipment at cumulative acquisition cost, total assets, initial capital, net
asset change and total equity. It is available before the first completed day.
The shared initial-capital constant retains the existing4000-cent starting cash.
No simulation rule, price, save schema or transaction changes.

The view explicitly says current day, regardless of the selected historical daily
report. Free ice has zero book value. Equipment is valued at acquisition cost,
not represented as cash that can be recovered by selling. Net asset change is
assets minus original capital, so it includes overnight stock losses. It is
deliberately distinguished from the existing trading-profit report, whose rules
do not charge the overnight loss in that completed day's result.

Actual normal-seed reproduction:

| Case after overnight transition | Cash | Paid stock | Equipment | Assets / equity | Net asset change |
|---|---:|---:|---:|---:|---:|
| No refrigeration |66.80|6.16|0.00|72.96|32.96|
| Half retention |57.80|8.40|9.00|75.20|35.20|
| Half retention, unused free ice |45.80|8.76|21.00|75.56|35.56|

The first two completed trading profits are37.44, but paid-stock write-offs are
4.48 and2.24 respectively. In the free-ice case,190 total ice melt including30
free units; paid inventory loses3.20, not3.80. Treating every ice cube as purchased
would overstate assets and its write-off. Diagnostic inputs/results are preserved
privately in `.local-m4/balance-report-audit-20261019.json`.

Model/storage66/66, typecheck, lint and production build pass. Browser11/11 covers
all three actual overnight scenarios, a new business, financial/graph/daily
switching, narrow containment, older feedback and report-day actions. Native UI
inspects all four report tabs across its established-history window matrix and
passes, including1097x554 and six preparation sizes. The actual balance-sheet
capture was inspected at `.local-m4/balance-ui-20261019/balance-sheet-175-client.png`.
Remote exact-head results remain required before integration.
Calendar/weather parity and human visual acceptance #97 remain open.
