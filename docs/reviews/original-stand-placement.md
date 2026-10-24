# Original stand placement and projection audit

Private retained sources: parent worktree `src/data/original-map-layouts.json`,
`public/assets/original/*-objects.png`, `.local/browser/maps/*-stand-{1,2,3}.png`.
Frame placement is recovered evidence; the legacy `APPROACHES` and `getStandPoint`
helpers are authored navigation, not recovered original NPC movement.

The original Classic sprites establish two mirrored projection families.
Neighborhood and Park use a long serving-front edge rising toward screen-right;
Downtown uses the opposite diagonal. Park/Marina/Mall/Old Square Classic sprites
match each other's family; Downtown/Beach/Stadium/Station/Magic Gardens match the
other. Pixel equality and a private enlarged three-sprite board confirm this;
Neighborhood has distinct pixels but the same visible front diagonal as Park.
The earlier inference that Downtown was the right-facing family was incorrect.

Here `right` means the customer-side floor normal points toward bottom-right,
with a front edge rising toward screen-right. `left` is its horizontal mirror.

| Location | Original Basic frame x,y,w,h | Original front | Initial adapted floor | Service feet |
|---|---|---|---|---|
| Neighborhood |85,112,34,37|right|113,142|123,150|
| Park |138,61,34,37|right|155,124|167,136|
| Downtown |121,136,34,37|left|138,173|126,185|
| Beach |241,100,34,37|left|256,145|244,157|
| Old Square |92,102,34,37|right|140,136|152,148|
| Train Station |210,112,34,37|left|216,161|204,173|
| Mall |234,109,34,37|right|228,188|240,200|
| Marina |43,61,34,37|right|65,100|77,112|
| Stadium |212,66,34,37|left|237,154|225,166|
| Magic Gardens |194,124,34,37|left|204,142|192,154|

Adapted floors are authored on the new300x240 coordinate grid, not claimed as
exact original coordinates. New scenery differs: the promenade stairs, Mall
escalator/planter, Stadium seating edges and square statue require clearance for
the largest tier. Review all four tiers before accepting any placement. Record
further changes here rather than silently claiming original-perfect reproduction.

Neighborhood returns to the original left junction lot. Customers use that
sidewalk to approach/leave; noncustomers use an independent through-sidewalk
route so they no longer perform a forced crossing U-turn to visit a counter.
All routes are presentation authoring, not recovered original simulation rules.

2026-10-24 route audit: Downtown's owned-map stand floor moves to138,165 and
service feet126,177, eight map units inward from the curb. Its original-facing
family, tier anchors and business location are unchanged. The table above is
the earlier initial placement, not a new pixel-identical original claim.
