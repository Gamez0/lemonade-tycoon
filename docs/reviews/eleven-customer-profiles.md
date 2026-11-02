# Eleven customer groups and historical replay

2026-11-02 KST, #228 follow-up on main13cc381 (weather PR280). Active branch
implementation; full browser/native/release validation and current-head CI are
still pending. Numeric source is the retained 1.1.6 table documented in
`research/original-116-live-audit.md`, not the parent's four interpreted visual
families. Original sprite identities and patience time units remain #234 work.

## Model boundary

Schema12 introduces `customerProfileModel: eleven-profiles-v1` for unpaid
preparations and the matching paid `business.customerModel`. Existing paid
v6-v11 days keep their old model, weight count, budget, queue rules, ice and
ratings. Decoding never opts in; product new companies and completed-day
boundaries do. A paid checkpoint returns before charging or changing models.
Weather's schema11 discriminator remains independent and still freezes periods.

The new model copies the eleven numeric group weights for the selected venue
into its paid snapshot. The train station has80% in groups1/2; beach-only groups
are represented without pretending to know their original identities. Zero
weights cannot generate visitors. Strict validation accepts eleven nonnegative
integer weights summing to100 only with the new marker. Older models continue
to require three positive weights. Older schemas reject the new discriminator;
schema13+ remains protected. Mixed historical models are validated individually.

## Explicit adaptation

The retained preferred/maximum prices and base-patience values are factual
numeric inputs. Applying them to this product's willingness and fixed100ms
street rules is an adaptation, not recovered original time/price parity:

- Preferred price divided by150 replaces the old three-family budget factor;
  existing weather, reputation and seeded variation remain. Willingness caps
  at the group's maximum price before the frozen location budget modifier.
- Base queue patience multiplies the recovered patience divided by70; group4
  is neutral. The full host bonus is added afterward, never scaled down.
  Existing blender/service-time, advertising and queue-draining rules remain.
- Both purchase-first models consume ice per sale and use the same absolute
  taste function, service-time actual temperature and rating denominators.
- Existing approved map textures are reused by group-index modulo3. This is
  cosmetic variation, not a claim that an anonymous group is an office worker,
  student or a recovered original sprite. Staff portraits are unchanged.

Rent previews show the eleven-group model and the share with base patience
at most50; this includes group5, so the station's short-wait share is85%, while
the separately verified groups1/2 mixture is80%. Patience ranges exclude groups
with zero weight. Paid previews use their frozen weights and base duration;
both old/new purchase-first previews keep the full additive host bonus. Reports
treat both purchase-first discriminators consistently.

## Verification boundary

Before changing the customer model, four actual schema11 period-paid fixtures
were generated with PR280's unchanged compiled source1fee2be (tree identical
to integrated13cc381). They retain full expected final state, including RNG,
weather/quotas, inventory, cash and ratings. Existing realv6/v10 fixtures remain
unchanged; v7-shaped fixed-weather snapshots are labelled as such.

Model checks cover all ten distributions, zero-weight exclusion, seeded observed
frequencies, individual price ceilings, complete additive staff bonuses, paid
reload, per-cup ice, model validation and historical replay. Browser checks cover
actual beach rendering/high profile indices, paid reload/SKIP and next-day
adoption from realv11. Required final-head Windows suites include actual native
import/rendering, long saves, campaign, performance and normal close. Record the
results before integration. #97/#16 and original visual/time-unit evidence stay
open; this does not restore49 original visual families or establish human beta.
