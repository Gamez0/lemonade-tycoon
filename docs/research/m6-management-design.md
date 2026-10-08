# M6 management decisions

User authorized continuing through M10 on 2026-10-08. Physical offline, DPI and
clean Windows checks are deferred until release; they do not block development.

Existing #74/#73 requests concern meaningful equipment and staff choices. The
reboot uses its established pitcher, ingredient consumption and queue accounting,
rather than copying legacy manufacturing delays. These are newly designed values.

Three equipment families have two permanent purchase levels: refrigerator keeps
50/100% leftover ice, ice maker produces 60/120 ice at normal supply cost, blender
reduces service from 8 to 7/6 ticks. Ice production is convenience, not free stock;
its exact purchase amount is included in supply cash expenses at opening. Staff
choice: owner, server ($2.50/day; 2 ticks faster), host ($1.80/day; +12 patience).
Advertising: none, flyers ($1.80/day; +20% traffic), radio ($4.50/day; +45%).
Staff and ads charge atomically with rent at opening. Paid checkpoints lock these
choices and do not charge again on replay. Capital purchases affect cash, not daily
operating profit; reports show equipment spend separately. Ads increase demand,
requiring matching stock/service; no ad is an appropriate low-budget choice.

Save v4 migrates v0-v3 with zero management costs/default equipment. Validate
integer levels, known choices, wages/ads against the paid opening, equipment
payments against lifetime capital ledger and ordinary cash reconciliation.

M7 language scope: English only for the first candidate, explicitly indicated in
help/store materials. Korean translation is not claimed. Original code-generated
music avoids third-party recording requirements; hearing/fatigue acceptance is
still needed before calling #113 complete.
