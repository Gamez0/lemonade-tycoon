# Customer report rating labels

The results table displayed buyer-only taste as “Satisfaction”, while the adjacent
commentary displayed a lower overall rating under “Customer satisfaction”. A real
two-day simulation reproduced 100% happy buyers on both days, but overall ratings
of 92% and 96% because two and one visitors left the queue. The cumulative rating
is 94%, with buyer taste remaining 100%.

Label the table row “Buyer taste” and the commentary “Overall satisfaction”. Explain
that overall ratings include buyers and visitors lost to price, stock and waiting,
but exclude passers-by. Historical or mixed saved reports retain an explicit older
rating-basis notice. No formula, save schema or accounting change.

Browser regression restores an actual simulated two-day save and checks the daily,
cumulative and reload views. The new test and both existing hot/cold taste tests
pass (3/3); typecheck, lint and production build pass. Rebuilt Windows UI checks
pass all five window sizes, daily/ledger containment and replay. The first native
run exceeded the old five-second canvas startup wait on relaunch; a thirty-second
startup allowance passed without changing geometry checks. Current-head CI
remains required before integration. #229 report composition and
same-location art comparison remain open, as does human visual acceptance #97.
