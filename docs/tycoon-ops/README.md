# Tycoon Base — execution contract (2026-11-26)

Canonical project decisions: https://chatgpt.com/space/page_bc7e802a0800819180c4e32293635ed8 . This repository ledger records *observations*, not inferred activity. Existing `main` and Windows releases remain outside this experiment.

## Every engineering automation invocation
1. Read this document, `docs/tycoon-ops/runs.jsonl`, latest Space decisions, and current PR/branch state. Never assume a previous run committed.
2. Allocate unique `run_id` (`tyc-YYYYMMDDTHHMMSSZ-role`; if collision append short suffix). Record UTC `started_at`, `role`, `task_id`, `status=in_progress` promptly to the shared ledger; use GitHub issue comment if simultaneous writes conflict. Include a source `automation_run_id` when exposed, otherwise `null`.
3. Select the highest-value actionable item, produce a concrete artifact, and capture GitHub commit / PR / CI / document evidence. No artifact means `outcome=no_progress`, not success.
4. Record `ended_at`, `work`, `evidence`, `validation`, `blockers`, `next_task`, and `outcome` whether successful, failed, blocked or no progress. Unobserved scheduled invocations are *missing/unknown*, not fabricated failed runs.
5. A verifier must run in a **separate automation/session**, re-fetch source artifacts directly, and write an independent finding referencing the immutable commit SHA/run ID. A worker's self-review, CI green badge or role-switch in the same session is not independent AI verification. Do not mark passed without a separate verifier execution.
6. Two consecutive recorded no-progress runs trigger strategy change, blocked-task isolation, and project-lead escalation. Approval waits never stop other reversible work. Don't repeat an identical failing access call.
7. Close a required-review task only after reviewer evidence and lead acceptance, then recalculate roadmap scores; review pending != done.

## Data model
JSON Lines (one object per execution or review, chronological, immutable append if possible): `run_id, automation_run_id, scheduled_for, started_at, ended_at, role, task_id, work, evidence, validation, blockers, next_task, outcome, review_of`. Omit unknown timestamps as `null`. Outcomes: `progress`, `no_progress`, `blocked`, `failed`; verification: `pending`, `passed`, `changes_requested`, `not_required`. Append *only actual invocations*. An independent supervisor computes missing scheduled slots from active schedule and latest known run; source task-automation history is preferred when available, not inferred from repo commits.

## KPI (rolling 24 hours; unavailable != zero)
Observed recording ratio = recorded automation IDs / observable actual automation run IDs. Scheduled-slot coverage = recorded invocations / due slots, reported separately because skipped/late runs may be unknown. Max gap between observed completed records, number of evidence-linked artifacts per execution, required independent verifications / required verifications, median review wait for reviewed items, repeated no-progress streak. Token usage is N/A unless runtime reports actual tokens. Never substitute estimates for measured usage.

## Workflow and authority
Lead selects/backlogs and accepts; worker authors on reversible branch; independent reviewer reopens sources without worker conclusions. A separate reviewer schedule can perform reviews asynchronously using this file and the Space page, but it is not an independent review until an actual review record exists. Avoid merge/deploy, paid resources, or public releases. For mismatched instructions, follow latest explicit user authorization, while preserving existing game's safety. GitHub Actions is independent **machine CI**, not AI code/design review.
