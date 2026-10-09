# Free ice-maker correction — 2026-10-09

The user clarified that an owned ice maker should simply produce ice without
electricity or production fees. Follow the original game's intentional gameplay
simplifications; do not invent realistic overheads. This is a user-directed rule,
not a claim that this project's output values match measured original values.

Removed the opening production charge. Equipment still produces up to 60/120 ice,
bounded by the 999-unit storage limit. An owned machine works even with zero cash.
Rent, moving, staff and ads retain their explicit costs. Bought ice remains $0.02.

Free stock is consumed first and contributes no ingredient expense. Refrigeration
preserves its zero cost basis; the next-pitcher cost hint uses available free ice.
UI and simulation now share the opening-cost calculation. Opening checkpoint replay
neither produces extra ice nor charges again.

Save v5 records `freeIce` and `daily.freeIceUsed`, validates inventory/consumption
bounds and ingredient-cost reconciliation, and imports v0–v4. Existing stock is
treated as purchased, preserving historical charges and profit without refunds.
An old paid opening remains paid; its original expenses survive replay. Later
openings use the corrected rule. Old executables cannot read v5; export before
updating and preserve a v4 backup if rollback is needed.

Self-review: checked mixed bought/free batches, full storage, both equipment
levels, zero-cash opening, fixed costs, no duplicate production, refrigerator
levels and old charged-checkpoint migration. No new dependency or purchased asset.
The initially considered cash-limited paid-production approach was superseded by
the user's free-production instruction and is not part of this change.

Validation and final package provenance are recorded in `docs/cloud-work.md`.
M2 visual, human listening/playtesting, deferred device and actual Steam gates
remain open.
