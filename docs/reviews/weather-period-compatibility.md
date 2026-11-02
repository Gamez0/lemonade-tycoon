# Weather periods: implementation boundary and compatibility plan

2026-11-02 KST. Follow-up for #229 on main fee1153 (PR279). This is a reviewed code-path
inventory and compatibility design. Varying weather is implemented on the active
branch; full browser/native/release checks and final-head CI are still required.

## Evidence and limits

See [retained-image findings](../research/career-calendar-weather.md). Three
weather/temperature entries are perturbed at opening and feed three generated
arrival quotas. Period changes use generated visitors, not purchases or a
proven 12:00/18:00 clock. The existing legacy forecast probability/temperature
error is remake tuning. Do not present it as recovered original behavior.

Additional private trace `weather-period-audit-20261024/exhaustion-trace.json`
has the same source SHA256 and records `0x404117..0x40426a`. New visitor creation
first fills a pool while total-generated is below `0x4056ae`'s pool count.
Finished actors are reused at `0x4041c2..0x4041e7` while total-generated is at
most the sum of three quotas minus one; otherwise they are cleared. Once the
active-actor sum is zero, `0x404254..0x404262` marks completion and finalizes.
This distinguishes exhausting all planned traffic from waiting for the last
customers to finish. Strict-greater period advancement, zero quotas and initial
pool fill need boundary review before copying the original algorithm literally.
There is still no recovered original clock mapping.

## Current product paths that must change together

| Path | Current behavior | Required invariant |
| --- | --- | --- |
| `game.ts:forecast/newGame/nextDay` | One of four catalog tuples and one RNG draw | Preparation forecasts remain stable across browsing/reload |
| `game.ts:openDay` | Frozen paid BusinessDay; existing checkpoint returns early | Actual period draw happens once after successful readiness/fee checks; failed opening consumes no RNG/cash |
| `game.ts:drawVisitor/settleVisitor` | Demand and taste use `effectiveWeather(state)` | Use an explicitly defined actual-period observation; queued customers cannot silently change semantics |
| `street-day.ts:tickStreet` | Fixed100ms, generated `arrived`, frozen total traffic | Advance on generated traffic, settle every visitor exactly once, drain the final queue |
| `save.ts:validLocations/validState/decodeSave` | Schema10, exact four catalog weather tuples, traffic1–500 | Add a new version/model discriminator; strict validation remains for every historical model |
| `reboot.ts` / `street-scene.ts` | Same weather drives labels, advice, sky and report taste | All presentation uses the same actual-period selector; remove “steady all day” only for the new model |

## Proposed save boundary

Introduce schema11 with an explicit weather model discriminator independent of
`customerModel`. Keep the existing three-profile purchase/taste model until #228
changes it separately. Keep `state.weather`'s historical meaning for old models;
do not widen old validation to accept arbitrary weather values.

New-model preparation stores three forecast entries. New-model paid BusinessDay
stores the three actual entries, three nonnegative integer arrival quotas and
their frozen total. Validate tuple lengths, known weather identities, bounded
temperatures/traffic and quota sum against total. Never recompute these from
current location/configuration while restoring an already-paid day.

Old v0–v10 histories and paid openings retain their old weather, RNG sequence,
fees, daily totals and deterministic replay. An old unpaid preparation may adopt
the new model only at a clearly defined new-day boundary; importing or reloading
must not itself reroll weather. Mixed histories require per-entry model checks.
Preserve optional company identity/mode and the eight-company journal behavior.
Existing newer-version protection must treat schema12+ as protected after the
schema11 upgrade, and old schema10 binaries must protect schema11 saves.

## Decisions before runtime integration

Determine the weather identity mapping and the new-model period generation from
existing evidence before choosing adaptation constants. Explicitly document any
remaining adaptation rather than inventing parity. Define whether a waiting
visitor's taste observes arrival or service-time temperature, then make the
visitor snapshot, reports and replay use that choice consistently.

Use count-based period labels initially; an unverified hour is unnecessary for
functional periods. Derive the active index from generated arrivals and frozen
quota boundaries, handling empty periods and trailing actors without index3.
Do not use settled sales, visual frame rate or speed/SKIP as the source of time.

## Required evidence for the next implementation

- Existing actual v6 and v7/v9 paid openings replay field-for-field, including
  RNG/stock/cash/history, through decode/reload/SKIP and native import.
- New-model same-seed normal/fast/SKIP and reload produce identical state and
  history; failed readiness/insufficient funds do not draw actual weather.
- Boundary scenarios include zero first/middle/final quotas, one visitor,
  exact quota equality, sold-out/price/passing visitors and a final waiting line.
- At least one day visibly changes actual weather while its purchases/taste
  respond to the same period data; three forecast icons alone do not pass.
- Save export/import, wrong tuple lengths/quotas, newer version protection,
  company switching and the final Challenge day remain covered.
- Current-head model/browser/release and packaged Windows checks pass before
  integration. Human visual acceptance and full eleven-profile parity stay open.


## Reviewed boundary decisions - 2026-11-02 KST

The six original codes are not the three product labels. Retained-image opening
mutation clamps codes to 0..5 (`0x403d51..0x403d69`). Forecast icon binding at
`0x417595..0x417612` selects manager offsets [0x430,0x418,0x420,0x408,0x410,0x428].
Current-weather binding at `0x417908..0x417964` uses the same ordering. This proves
shared identities, not their six English names. The manager's image handles point
outside the retained image; no new trial or heap capture was performed. Keep this
mapping distinction explicit when adapting the existing three product labels.

The taste routine `0x40218a..0x402293` calls the current temperature getter at
`0x4021a6` immediately before evaluating the cooling penalty and the taste draw.
This establishes evaluation-time access, not a captured arrival temperature.
The new product model will therefore use **service-time** temperature for taste
and arrival-time weather for willingness. This matches the current product's
existing separation of arrival and settlement; no visitor snapshot is necessary.
Old paid snapshots must keep their existing constant temperature and RNG behavior.
A queued visitor crossing a boundary needs a dedicated regression for this choice.

Use the existing independently authored Sunny/Cloudy/Rainy identities initially;
any three-state transition probabilities are product tuning, not a decoded
six-state original mapping. Retain the original observed temperature bounds
10..40 and opening perturbation -3..3. Do not claim original weather-code parity.

The pure `weather-periods.ts` boundary kernel uses one-based generated visitor
numbers. Visitor N belongs to the first quota whose inclusive prefix sum reaches
N. Empty first/middle/final periods are skipped. While the final queue drains,
retain the last occupied period, including when the third quota is zero. A
zero-total plan is rejected by the kernel; runtime generation must guarantee at
least one visitor, preserving the current nonempty-day settlement contract.
This is a deliberate boundary adaptation rather than copying the original's
strict-greater counter/reset and initial-pool behavior. Exhaustive small-quota
tests compare against an independently expanded visitor schedule.

## Active implementation and validation

The product enables forecasts for new companies and after completing an old day.
Decoding an old unpaid preparation leaves its forecast and seed unchanged until
that day completes. The pure simulation's `withWeatherForecast` explicitly marks
this boundary; `nextDay` retains the new model for already-adopted companies.
Forecast entry one retains the existing catalog draw; entries two and three each
consume one additional draw. Browsing locations or reloading consumes none.

Successful opening draws each actual code and temperature once, in alternating
code/temperature order. Three-label code tuning: a seven-way draw moves down one
label for zero, up one for six, otherwise stays, clamped Sunny/Cloudy/Rainy.
Temperatures change by inclusive -3..3 and clamp 10..40. Each quota rounds one
third of the existing location/weather/news/popularity/advertising traffic.
An otherwise empty plan uses quotas [1,0,0]. All these are product adaptations.

Paid checkpoints freeze actual entries, quotas and total. Active index is updated
only by `drawVisitor`'s one-based generated visitor number, before willingness
and same-tick service settlements. Normal, accelerated and SKIP paths share
`tickStreet`. `effectiveWeather` feeds demand, taste, the weather panel and sky;
the Mall remains indoors at20 C. Forecast displays all three entries before
opening; selling shows the current period and actual weather. Daily report
weather retains the forecast snapshot plus all three actual entries in business.

Schema11 rejects period fields in older schemas, invalid tuple lengths,
out-of-range actual temperatures, invalid quotas/totals and invalid paid-opening
or final active boundaries. Schema12+ remains protected. Historical models keep
their strict catalog-weather and daily-condition validation.

Real v10 paid fixtures were generated from unchanged main fee1153 with its own
compiled simulation, before this branch's model was run. Tests compare complete
state after decode and final RNG, stock, fees, cash, ratings and ledger. Existing
v6 fixture replay remains covered independently. Final evidence is recorded in
the PR and cloud handoff; #229 and manual acceptance remain open.
