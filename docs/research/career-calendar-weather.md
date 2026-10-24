# Career calendar and weather evidence ? 2026-10-19 KST

## Career date confirmed from preserved code

Read-only analysis uses the existing legitimate 1.1.6 loaded-image capture at
`D:/lemonade-taste-audit/.local-m4/original-runtime/original-loaded-image-live.bin`.
SHA256: `f0f8c2f87336904fc44398e95dbf355b84384a168d05ae16d12d2b39ec025aec`.
No original binary or pixels are added to the product.

The header routine calls the cumulative-day getter at `0x41b084` (getter
`0x40426e`, field `+0x7c`), then subtracts one at `0x41b091`. The mode getter
`0x404a6e` reads `+0x68`; mode 1 takes the challenge-day branch. The career branch
at `0x41b0bd..0x41b0f9` divides elapsed days by 30, uses remainder + 1 as day,
divides that quotient by 12 and uses remainder + 1 as month, then divides the
original elapsed days by 360 and uses quotient + 1 as year. The format lookup is
`+0x78`, consistent with legacy string index 15, `Year %i - Month %i - Day %i`.
This establishes the displayed career formula beyond the screenshot alone.
It does not claim a new live playthrough over a rollover.

Examples: cumulative day 30 = year 1/month 1/day 30; day 31 = 1/2/1;
day 360 = 1/12/30; day 361 = 2/1/1; day 1601 = 5/6/11.

Implementation derives header fields from the existing cumulative `State.day`.
No redundant calendar state, save migration or altered history ordering is needed.
Reports and exports retain cumulative business-day identifiers. The header title
also supplies the cumulative business day. Existing end-of-day preparation action
is retained pending a separate transition change with accounting/save evidence.

## Weather evidence and remaining work

Existing live audit observed multiple periods and rain starting within day 11.
Preserved code confirms three temperatures at `+0x80/+0x84/+0x88`, three weather
codes at `+0x70/+0x74/+0x78`, and current-period index at `+0x8c`.
Temperature getter `0x40429b` returns 20 for the Mall pointer `0x463848`, otherwise
indexes the three temperatures. `0x4042b9` explicitly indexes a requested period.
`0x4042c7/0x4042d2` provide current/requested weather codes.

The routine at `0x403d1d` perturbs each of the three weather codes by at most one
and each temperature by an inclusive -3..3, clamped 10..40. Its caller/timing and
period-index transitions still need tracing before product weather changes.
Do not assume these mutations happen at each period or assign clock boundaries.
The current product save validator accepts only the three fixed catalog forecasts;
introducing period temperatures requires a versioned migration and preserving
historical paid-opening/replay behavior. Calendar display does not resolve this.

## Verification

## Resumed period audit — 2026-10-24 KST

Read-only follow-up uses the same retained image and SHA256 above. This is
static evidence, not a fresh live observation. The bounded private trace is
`D:/lemonade-taste-audit/.local-m4/weather-period-audit-20261024/retained-image-trace.json`.

The direct call at `0x416ed0` invokes `0x403d1d` from the opening UI routine
`0x416de3`. The mutation happens before the three arrival quotas are initialized,
alongside opening cost setup. It is not evidence of a new random weather draw
at every period boundary.

Quota initialization at `0x403df2..0x403e7c` loops three times, reading the
corresponding weather code and temperature, the selected location's base
arrival count (`+0x24`), weather adjustment table (`+0x30`) and temperature
adjustment table (`+0x48`). It applies signed integer percentage arithmetic,
then divides by three and writes to game `+0x30/+0x34/+0x38`. Location-matched
news contributes to the base (`+0x57b4`) and the individual quotas
(`+0x57b8/+0x57bc/+0x57c0`); negative final quotas clamp to zero at
`0x403ec4..0x403ece`. Do not replace this with three equal time durations.

Visitor creation `0x404484` increments both total generated (`+0x28`) and
period generated (`+0x2c`) counters at `0x4044dd/0x4044e0`. Update
`0x404146..0x404165` advances period `+0x8c` only when the period counter is
strictly greater than the current quota, then clears that counter. Equality
does not advance it. This is generated traffic, not completed purchases.

The outer update `0x404117` accumulates speed-scaled elapsed input at `+0x3c`
and calls simulation steps until `+0x24` catches up; each step adds `+0x40`
at `0x404167..0x40416e`. This distinguishes elapsed simulation time from the
arrival-count period index. A displayed clock getter/format and the final
period exhaustion path still need tracing. No 12:00/18:00 boundary, forecast
agreement probability or exact original clock mapping has been established.

Next product increment must preserve old paid-opening snapshots/replay and
old forecast validation, version forecast versus actual period data, and make
the active period affect arrivals/taste/rendering consistently. This audit
does not implement varying weather or close #229. Eleven-profile adaptation
remains separate in #228; visual acceptance remains #97/#16.

Model/storage 67/67; TypeScript passed. Browser rollover restore, historical report
selection, reload and narrow containment checks added. Final browser/build/lint
and current-head CI evidence will be recorded in the PR before integration.
Human visual acceptance #97 remains open.

## Resume CI repair - 2026-10-19 KST

Exact-head Windows run39238557744 failed only in desktop-performance at the
old cumulative-day41 assertion: the calendar correctly displayed day11/month2.
The performance scenario now checks both the cumulative header title and calendar
day/month, including day60 to61 rollover. Syntax and diff checks passed.
The repaired script passed against the existing actual Windows calendar package,
including all idle/selling/minimized samples and the20-day retention scenario.
Current-head remote checks are required before merge.
