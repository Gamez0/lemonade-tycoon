# Roadmap

## M1 — Playable MVP (complete)

1. #84: Repository audit, architecture, game design, reference analysis and issue decomposition.
2. #85: Deterministic headless day simulation: preparation, stock, demand, transactions, settlement, next day; automated invariants.
3. #86: Playable single-location presentation: preparation controls, street/customers, HUD, results/restart; original pixel art, browser checks and PR CI.

Each has its own Issue → branch → implementation → checks → PR → self-review → fixes → green CI → squash merge. Review accounting, transition guards, type safety, UI access, lifecycle cleanup and test adequacy. Do not merge a red PR or describe a pending browser check as passed.

## M2 — Classic PC experience MVP (active)

User priority changed on 2026-09-29: the second MVP is the original Windows game's visual composition and preparation/selling/results interactions. [Milestone 2](https://github.com/Gamez0/lemonade-tycoon/milestone/2), [research specification](research/m2-original-study.md), [interactive reference board](research/m2-reference-board.html).

1. #92: Evidence, version baseline, measured gaps and acceptance criteria (this research).
2. #93: Classic two-column shell and real screen-switching tabs; use #92 as the baseline.
3. #94: Recipe controls and staged supply purchases; depends on #93.
4. #95: UI artwork and neighborhood composition; use #93 dimensions and #92 references.
5. #96: Selling/customer presentation and results screens; depends on #93, coordinates with #95. Verify motion evidence before claiming original animation fidelity.
6. #97: Full-loop regression, same-size visual comparisons and user visual acceptance; depends on #94–96. Only then close M2.

M2 keeps M1 economics explicit: do not relabel per-cup recipes as original pitcher production or implement fictitious original costs. It does not require every original staff, advertising, upgrade or location system. No modern card/dashboard redesign. CI success alone is not visual acceptance.

## After M2

M3: [Living street and customer queues](https://github.com/Gamez0/lemonade-tycoon/milestone/3), issue #100. User explicitly requested concurrent pedestrians/visitors, queues and departures caused by long waits as the next milestone. Define arrival/service/patience rules and observe original motion before implementation. M2 keeps sequential visits while its presentation is refined.

M4: save/load (#11), keyboard/mobile refinement and balance. M5: progression and meaningful locations (#34/#58-60). M6: upgrades (#74), advertising (#35/#72), staff (#73), more locations and sound. Keep every step runnable.

Legacy issues remain linked context; do not close them without comparing their original acceptance criteria. Draft #83 and local debug changes remain owned by their existing branch. Newly found defects get focused issues. Major design changes are recorded before implementation.

## Working agreement

PRs state behavior, rationale, tests, related Issue and remaining limits. Record self-review findings and corrections before merge. GitHub access failure does not stop local implementation: retain issue/PR text locally and state precisely what is not published. Autonomous work proceeds during an active agent session; these documents do not imply an unattended scheduler exists.

## M2 implementation checkpoint

The integrated classic-experience PR implements #93?96. Their shared shell/state transitions are reviewed together; #97 keeps visual acceptance separate. The comparison board contains captured recipe, price, staged supplies, selling, daily result and cumulative ledger screens. M2 remains active pending the user?s visual acceptance.


## Latest visual feedback

M2 remains active after the first integrated pass. Follow-up research: [selling/weather comparison](research/m2-selling-weather-study.md). Improve the connected road, weather icons and phase labels, compact performance reactions, structured settings, in-scene speed controls, typography and results composition before requesting visual acceptance again.
