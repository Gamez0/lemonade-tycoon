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
