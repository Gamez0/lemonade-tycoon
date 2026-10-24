# Beta readiness review — 2026-10-24 KST

## Decision

The verified Windows build is a candidate for a small, private formative
playtest. Formal M8 beta acceptance is incomplete. Do not describe the game
as feature-frozen, fully faithful to the original, or release-ready.

Start with five Windows testers using the same fixed build and separate
profiles. This review prepares that test; no invitations, public release or
Steam upload have occurred. Actual participants remain **0/5** in #159.

## Product evidence

Baseline: main `1ee06930fdfaf2a8f9d9c50ad378c6c62138c532`, alpha.14.
Latest main checks, including Windows packaging, passed in
[run 40092501190](https://github.com/Gamez0/lemonade-tycoon/actions/runs/40092501190).
PR269 exact-head validation covered 91 model/storage, 15 release and 76 browser
tests, plus Windows packaged suites. These are automated results, not testers.

The actual clean-main executable verified at the previous checkpoint is
`D:/lemonade-main/.local-m4/start-menu-main-20261024/release/Lemonade Tycoon-win32-x64/Lemonade Tycoon.exe`.
Its adjacent `native-menu` evidence covers eight companies, both game modes,
options, reload and normal exit. This path is a local candidate, not a new
published download. Existing alpha13 distribution is historical.

Implemented: launch/load menu, eight company slots, Career and 30-day Challenge,
ten playable locations, supplies/recipe/pricing, selling and queues, equipment,
staff/advertising, daily/history/graph/balance reports, file save/recovery and
independently authored game art. Current simulation uses three adapted customer
profiles and a whole-day weather snapshot.

## Remaining work and acceptance

| Area | State and consequence | Tracking |
| --- | --- | --- |
| In-day forecast/actual weather | Investigation resumed; period quotas now traced; compatible implementation pending | #229 |
| Immediate next preparation | Old green draft PR251 needs current-main reconciliation and new exact-head CI | #229 / PR251 |
| Eleven customer profiles | Three adapted profiles implemented; full versioned adaptation remains | #228 |
| Visuals and sound | Implementation exists; human visual/listening acceptance remains open | #97 / #16 / #113 |
| New player understanding | Observe first three days and first location unlock, record confusion and recovery | #154 / #159 |
| Real support environment | Long sessions, minimum hardware, Alt-Tab/audio and installation/update/save retention unaccepted | #161 / #162 |
| Physical environment | Offline, real DPI and clean Windows without developer tools remain deferred | #137–139 |
| Mobile preview | Real Safari/Chrome checks remain; Windows is the primary candidate | #160 |
| Release | Rights/content acceptance and RC remain open; Steam operations are later work | #167–169 / #172–174 |

M8 has four completed and four open task issues, excluding its tracker.
That is **4/8 issue completion**, not 50% product completion. M7 feature freeze
#155 remains blocked by acceptance evidence. Live Project has Running1, Ready6,
Manual10, Deferred6, Blocked2 and Backlog5; research and legacy work are separate
from mandatory beta product work. No defensible overall percentage is available.

## Prepared test protocol

1. Freeze the chosen candidate SHA, package checksum and known differences.
   Never substitute a newly rebuilt executable partway through the cohort.
2. Each tester creates a new Career company, plays days 1–3 without coaching,
   then continues to the first location unlock. Observe purchases, recipe/price,
   opening, results, loss recovery and whether the player understands profit.
3. Save, quit normally, relaunch and load; export/import a backup into a spare
   company. Verify money, day and company identity. Keep original backups.
4. Record Windows version, hardware, resolution/DPI, session duration, audio
   preference, completion/abandonment point, confusing text, bugs and subjective
   visual/music feedback. Record build identity with every report.
5. Stop testing that profile on progression loss, save corruption or a crash
   that blocks continuation; preserve save/log/reproduction steps. File defects
   against existing issues where appropriate, fix and retest the same scenario.

Suggested record fields: participant ID, candidate SHA/checksum, environment,
first-three-days result, unlock reached, save/reload result, blocking defects,
confusion points, audio fatigue, retest result. Do not record automated runs
as human participants or publish participant personal data.

Formal beta acceptance requires the observed five-player results, fixes and
remaining M8 environment evidence. A private formative test can reveal those
problems before original-fidelity work is complete, provided its known
differences are explicit. Broader distribution requires separate readiness
review and the outstanding rights/environment gates.
