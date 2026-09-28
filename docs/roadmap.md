# Roadmap

## M1 — Playable MVP

1. #84: Repository audit, architecture, game design, reference analysis and issue decomposition.
2. #85: Deterministic headless day simulation: preparation, stock, demand, transactions, settlement, next day; automated invariants.
3. #86: Playable single-location presentation: preparation controls, street/customers, HUD, results/restart; original pixel art, browser checks and PR CI.

Each has its own Issue → branch → implementation → checks → PR → self-review → fixes → green CI → squash merge. Review accounting, transition guards, type safety, UI access, lifecycle cleanup and test adequacy. Do not merge a red PR or describe a pending browser check as passed.

## After M1, in order

M2: stabilize the loop, user playtest feedback, save/load (#11), keyboard/mobile UX and balance experiments. M3: progression and meaningful location choices (#34/#58–60). M4: upgrades (#74), then advertising (#35/#72) and staff (#73). M5: more content and art polish. Keep every step runnable.

Legacy issues remain linked context; do not close them without comparing their original acceptance criteria. Draft #83 and local debug changes remain owned by their existing branch. Newly found defects get focused issues. Major design changes are recorded before implementation.

## Working agreement

PRs state behavior, rationale, tests, related Issue and remaining limits. Record self-review findings and corrections before merge. GitHub access failure does not stop local implementation: retain issue/PR text locally and state precisely what is not published. Autonomous work proceeds during an active agent session; these documents do not imply an unattended scheduler exists.
