# Results composition follow-up — 2026-10-18

Read the existing original1.1.6 captures `good-results.png`,
`original-day8-result.png`, `result-daily.png` and `result-ledger.png` from the
private runtime study. Filenames alone are unreliable: the latter two actually
show Profit & loss. This session did not rerun the expired original trial.

The original Yesterday's Results pairs a compact nine-row monetary table with a
hand reaction, overall satisfaction, missed sales, complaint/advice and melted
ice. Four illustrated navigation tabs switch calendar/graph/ledger/stock views.
The Profit & loss capture shows current year/month, last and best columns. Results
stay in the preparation surface with Start day available.

The rebuilt product has two illustrated period tabs: Last day and cumulative
Profit & loss. Its thirteen-row table additionally separates supply purchases,
cash change and equipment capital from ingredient/operating expenses. Customer
feedback remains adjacent. PR243 removes the ambiguous rating labels: buyer taste
stays100% in the actual two-day regression, while overall satisfaction is96% for
the latest day and94% cumulatively after queue departures.

Inspected the actual native175% client capture `results-175-client.png`: all
thirteen rows, verdict, explanations and Prepare next day fit without overlap;
the button remains within the panel. Complete browser38/38 also exercises three
successive days, daily/cumulative switching, returning to past results during
preparation, no buyers, reload and the next-day action. Windows UI/management
checks pass. These are automation and author review, not user visual acceptance.

Remaining differences are functional, not merely missing decoration: selectable
calendar periods, graph/stock report tabs, current/last/best periods and direct
start from the closed-day surface are not implemented. They must not be replaced
by inert icons. Keep #229 report follow-up open and #97 human acceptance separate;
the current daily/cumulative labels describe the actual available scope.

## Completed-day navigation candidate

The Daily tab now offers every completed business day through a labeled native
select. Selecting a day restores that day's location, totals, customer outcomes
and recipe advice; cumulative Profit & loss stays independent. Switching between
the two views retains the selected day. A newly completed day, restart/import or
reload defaults to the latest report. Selection does not mutate cash, business
state or the save schema. No Year/Month calendar is invented for the day-only game.

Extended the actual two-day save regression to select Day1 (92% and two waiting
departures), switch to cumulative (94% and three), return to Day1 and reload back
to latest Day2 (96%). Focused report/three-day/older taste/feedback checks6/6 and
rebuilt Windows UI/next-day containment at all five window sizes pass, as do
typecheck, lint and production build. Current-head remote CI and prerequisite
integration remain required before this increment's integration.
