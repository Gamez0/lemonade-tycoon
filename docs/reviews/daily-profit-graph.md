# Daily profit graph

#229 report follow-up: a third illustrated report tab plots actual completed-day
profit from the same accounting function as the ledger. It shows at most the
latest30 completed business days, names the displayed range, and keeps day numbers
instead of inventing a Year/Month calendar. Positive and negative bars straddle a
visible zero axis; zero results remain visible as marks. Single-day bars have a
bounded width rather than filling the whole plot. SVG title/description expose
every plotted value and explain loss/profit direction without relying on color.

Browsing changes no stock, cash, save schema or simulation. Daily and cumulative
tables remain available; the day selector is hidden while viewing the graph.
An empty history retains the existing no-completed-days message.

Actual negative/positive two-day save and a31-day campaign pass browser checks2/2,
including the30-day cap, saved values, zero-axis direction, 375px containment and
return to daily report without cash changes. Existing report/audit checks5/5
passed. Initial graph test failed only due to sentence capitalization in its
expectation; corrected and reran both graph checks successfully. Typecheck/lint
and production build pass after final bounded-bar refinement.

Rebuilt Windows UI passed all preparation/report tabs and native containment,
including the new graph at1097×554 and six sizes with established history. Native
screenshot inspected: `.local-m4/graph-ui-20261019/profit-graph-175-client.png`.
That run preceded the final narrower single-day bar/text refinement; current-head
remote CI must validate the final source before integration. Stock report tabs,
calendar periods and human visual acceptance #97 remain open.
