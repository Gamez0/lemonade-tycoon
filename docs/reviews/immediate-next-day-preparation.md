# Immediate next-day preparation with yesterday's report

2026-10-20 KST. Original comparison evidence records that completion advances
the preparation header while yesterday's results remain visible. The product
previously waited for a separate Prepare day action, leaving forecast, stock and
calendar on the completed day until that click.

The presentation completion path now appends the exact completed state to
history, calls the existing nextDay rule once, clears the old opening checkpoint
and saves the next preparation state while showing the completed report.
Animation ticks can finish old pedestrians but cannot assign their old game
snapshot over tomorrow's state. Opening the next day resets speed, reaction
counts and transient buyer feedback. Browsing reports retains the selected tab;
the user can explicitly select Daily to return from the cumulative ledger.

The simulation formulas and save schema are unchanged. Overnight ice loss and
forecast advancement come from the existing nextDay implementation. Historical
result saves still load as results and retain the old explicit Prepare action;
they are not silently advanced or charged during import/reload. New preparation
checkpoints retain yesterday's exact completed state in history.

## Verification and self-review

The new skip/normal browser scenarios compare every saved state field to a pure
completed-day/nextDay replay after40 historical days with refrigeration. They
check the cumulative calendar title, exact completed history, half-retained ice,
report availability, old-animation settling, reload, next opening checkpoint
and speed reset. Existing old-result restore/report navigation also passes.

Full browser49/49 passed after correcting stale result-state assumptions. The
first rerun exposed a report-navigation expectation that assumed a selected
ledger would become Daily merely by leaving its page; the test now explicitly
selects Daily rather than changing that valid UI behavior. Current preparation
daily counters are empty; tests read completed metrics from history. Native disk
waits observe the cleared business checkpoint instead of phase=preparation alone,
which could have matched the preceding paid-opening save too early.

Type/lint/build and all8 actual local Windows suites (save/UI/location/management/
taste/30-day campaign/1600-day long save/performance) previously passed for the
implementation. Their native comparisons retain exact result history and exact
nextDay state, not only displayed totals. These results are from the pre-art
base; reconcile onto the integrated Neighborhood art main and require fresh
current-head CI including the complete Windows suite before integration.

Self-review found no duplicate completion/history append, overnight melt, rent,
wage, advertising or paid-opening charge path. Parent legacy work, original
resources, frozen alpha13 and #97 visual acceptance remain separate and preserved.

## Current-main reconciliation — 2026-10-24 KST

PR271 carries the original PR251 increment onto main with the launch menu,
schema9 and stand migrations. Transition tests now enter through the real menu;
native campaign and alpha13 paid-replay assertions keep schema9/Basic Stand.
The first focused run passed19/20 and caught a real integration regression:
immediate preparation created day31 after the final Challenge day. Completion
now retains the exact day30 result when the challenge is complete; Career and
earlier challenge days advance normally. The existing mode/reload test remains
unchanged and is required to pass. Final current-head CI remains required.
