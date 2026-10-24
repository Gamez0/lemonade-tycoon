# Weather periods: implementation boundary and compatibility plan

2026-10-24 KST. Follow-up for #229 after PR271. This is a reviewed code-path
inventory and implementation plan; varying weather is **not implemented**.

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
| `game.ts:forecast/newGame/nextDay` | One catalog weather and one RNG draw | Preparation forecasts remain stable across browsing/reload |
| `game.ts:openDay` | Frozen paid BusinessDay; existing checkpoint returns early | Actual period draw happens once after successful readiness/fee checks; failed opening consumes no RNG/cash |
| `game.ts:drawVisitor/settleVisitor` | Demand and taste read `state.weather` | Use an explicitly defined actual-period observation; queued customers cannot silently change semantics |
| `street-day.ts:tickStreet` | Fixed100ms, generated `arrived`, frozen total traffic | Advance on generated traffic, settle every visitor exactly once, drain the final queue |
| `save.ts:validLocations/validState/decodeSave` | Schema9, exact three catalog weather tuples, traffic1–500 | Add a new version/model discriminator; strict validation remains for every historical model |
| `reboot.ts` / `street-scene.ts` | Same weather drives labels, advice, sky and report taste | All presentation uses the same actual-period selector; remove “steady all day” only for the new model |

## Proposed save boundary

Introduce schema10 with an explicit weather model discriminator independent of
`customerModel`. Keep the existing three-profile purchase/taste model until #228
changes it separately. Keep `state.weather`'s historical meaning for old models;
do not widen old validation to accept arbitrary weather values.

New-model preparation stores three forecast entries. New-model paid BusinessDay
stores the three actual entries, three nonnegative integer arrival quotas and
their frozen total. Validate tuple lengths, known weather identities, bounded
temperatures/traffic and quota sum against total. Never recompute these from
current location/configuration while restoring an already-paid day.

Old v0–v9 histories and paid openings retain their old weather, RNG sequence,
fees, daily totals and deterministic replay. An old unpaid preparation may adopt
the new model only at a clearly defined new-day boundary; importing or reloading
must not itself reroll weather. Mixed histories require per-entry model checks.
Preserve optional company identity/mode and the eight-company journal behavior.
Existing newer-version protection must treat schema11+ as protected after the
schema10 upgrade, and old schema9 binaries must protect schema10 saves.

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
