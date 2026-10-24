# Beta readiness review - 2026-10-25 KST

A small private Windows formative playtest is appropriate once PR274's final
required checks pass. Formal M8 beta acceptance remains incomplete. Human
participants are still0/5 in #159. No invitations or public release are made.

Candidate alpha15 combines the compact customer rework (PR272), ten-map route
audit (PR273) and weather/news/Rent changes (PR274). Read PR274's exact final
head and CI evidence before selecting a package; use its manifest/checksum.
Do not substitute a new build during the same test cohort.

The playable loop includes eight companies, Career/30-day Challenge, ten
locations, supplies, recipe/price, customer queues, staff/equipment/advertising,
daily/history/graph/balance reports and native save/recovery. Next-day
preparation now advances immediately (PR271). Rain and location/news now
change actual daily visitors; indoor Mall cooling is20 C. All three changes
are product behavior, not just forecast labels. Retained original assets and
the separate dirty parent worktree are preserved.

| Area | Current consequence | Tracking |
| --- | --- | --- |
| Weather | Whole-day location/news effects implemented; original intraday periods still absent | #229 |
| Customers | Three adapted business profiles/visual families; original eleven/49 families not restored | #228 |
| Visuals | Compact art and all-map routes have automated/native evidence; human acceptance still needed | #97 / #16 |
| Players | Five observed first-three-day/unlock sessions not performed | #154 / #159 |
| Environment | Minimum hardware, long sessions, physical DPI, offline/clean Windows and mobile evidence incomplete | #137–139 / #160–162 |
| Sound/rights/release | Human listening, content rights acceptance and release candidate gates remain | #113 / #167–169 |

Live M8 has4 closed and4 open task issues, excluding its tracker. This is not
a product completion percentage. Functional playability is substantially
implemented; beta acceptance and original fidelity are separate unfinished
work. No defensible overall percentage is available.

For the first five testers retain the previous protocol in
[the prior review](beta-readiness-20261024.md#prepared-test-protocol): a new
Career company, first three days without coaching, first location unlock,
normal quit/reload and export/import into a spare company. Record build SHA,
checksum, Windows/hardware/DPI, confusion, blockers, saves and music fatigue.
Add one controlled rainy outdoor-versus-Mall comparison and hot/cold recipe
comparison; keep these distinct from uncoached discovery observations.

Stop the affected profile on progression loss, corruption or a blocking crash
and retain its logs/save for reproduction. Automation is not a human tester.
Private testing can expose usability and balance problems before fidelity is
complete; broader release requires a new review of the open gates.
