# Purchase, patience and taste review — 2026-10-14

Issue #228 follows the user's original-game comparison. New openings distinguish
the purchase decision, individual waiting deadline and reaction after tasting.
Price/weather/budget/prior reputation determine purchase intent; current recipe
quality is excluded. Location traffic/advertising and the existing business
progression remain this project's adaptation.

Taste checks use the observed original 1.1.6 cooling, absolute concentration,
dilution and lemon/sugar balance thresholds. Recipe bounds are 0–20/0–10/0–7.
Lemons/sugar are used when a pitcher is prepared; ice is used for sold cups only,
with free ice consumed first. The original's inclusive random helper is not copied;
our seeded generator supplies reproducible buyer reactions. Daily satisfaction
includes lost customers, while passersby are excluded. Three customer abstractions
and three locations remain; the decoded eleven original profiles/ten locations
are research evidence, not implemented content or identical timing claims.

Save v7 retains historical accounting and already-paid opening rules. Frozen
alpha13 v6 and v4 fixtures verify the previous customer decisions, queue deadline,
reserved ice, stock/cost/free-ice and final ledger. New v7 requires a pre-update
export for rollback to alpha13. Frozen alpha13 release assets are untouched.

Self-review found and corrected:

- UI and browser/native tests still described/reserved a whole pitcher's ice.
- A legacy browser fixture had relabeled a new opening without charging legacy
  ice; it now creates the legacy opening under legacy production rules.
- Zero ingredients were treated as invalid and bankruptcy still referred to a
  cheapest pitcher; validation tests now exercise the real upper bound, and
  bankruptcy describes the minimum paper cup or the fixed paid recipe.
- New taste advice was being attached to historical results/no-buyer days.
- Rent's extra customer information exceeded the shared mobile panel height at
  640px. A 620px common minimum keeps the action fixed; desktop containment stays
  governed by its existing override.
- Old saves/legacy-paid v7 allowed zero sugar and expanded recipe bounds, risking
  non-finite legacy demand. Decode now enforces historical recipe bounds and
  rejects a new customer-model marker under pre-v7 schemas.
- Multiplying the host bonus by a customer's patience factor reduced the promised
  12 ticks to 6 for office workers. The profile applies to base patience, then the
  full staff bonus is added. A regression verifies all three profiles.

Local model/storage/accounting: 66/66 PASS; strict typecheck/lint and release
tooling 15/15 PASS. The affected 640px layout regression passes. Earlier native
management and three taste/real-v6 replay checks pass, but were before the final
host/schema refinements and are not final-head package evidence. Initial native
taste startup hit a 5-second visibility deadline; a 30-second startup assertion
then passed without product changes. Initial browser failures/repairs are recorded
in `docs/cloud-work.md`; interrupted checks are not counted as completed.

Final production/browser checks, clean-source Windows package and native
taste/management/campaign/save suites must run for the final candidate. Require
exact-head GitHub CI before main integration. Human visual #97, remaining M2 #229,
physical/clean-PC and actual Steam acceptance remain open. No original executable,
research screenshots, memory dumps or private company captures are shipped.

Final local product source e8405fc: full browser35/35, native taste/real-v6 replay
3/3, management, thirty-day campaign and save/recovery/import/export/relocation
PASS. The general native save test initially failed because three baseline
restores hardcoded the previous two-lemon default; they now restore the captured
baseline's actual recipe, and the complete suite passes. The final follow-up also
updates current English/Korean save/play guides. Exact-head CI is still required;
the first PR Windows job reproduces that obsolete test baseline failure.
