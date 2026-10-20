# Independent upgradeable stand appearance — 2026-10-20

This records the initial schema8 implementation and its historical checks.
The user subsequently rejected the illustration style and placement. Selected
redraws and the original-facing audit are in `art/studies/stand-upgrades-v2` and
`docs/reviews/original-stand-placement.md`. Native alpha crops with measured
front-floor anchors replace logical-grid downsampling/bottom-center alignment;
the floating OPEN/FRESH image label is removed. See `native-art-rendering.md`
before treating earlier screenshots as the delivered visual result.

User explicitly requires the upgraded stand to appear in every map as a separate
object. Inspection found that the reboot had one fixed cart texture and no owned
stand tier. The retained original equipment UI survey confirms Classic449.99,
Lemon999.99 and Castle9999.99 purchase prices; see original-116-live-audit.md.

## Behavior

The Upgrades catalogue now offers Basic→Classic→Lemon→Castle. Each purchase
charges once as capital and is recorded in the equipment book value. Other
equipment retains its two levels; Stand has three. No unverified inventory,
attraction or speed modifier is assigned to the new stand tiers.

Save schema8 records the tier. Versions0–7 normalize to Basic without rewriting
old cash, paid openings or outcomes; old fixtures remain unchanged. Current saves
reject missing/fractional/out-of-range tiers, unpaid purchases and older-version
documents smuggling upgraded stands. Original/customer replay fixture tests adjust
only the new Basic default in expected objects.

Four independently generated alpha assets are preloaded and rasterized once onto
the logical grid. The scene chooses `stand-0` through `stand-3` from ownership,
using one bottom-center ground anchor per location. The background and rent
thumbnail never contain a stand. Depth and the separate OPEN/FRESH sign follow
the stand ground point. Tier also appears in the catalogue, equipment summary
and accessible canvas label. Shape/style acceptance remains separate from tests.

## Evidence

- Model/storage69/69, including stage charges, multi-day round trips, v7 histories
  and tamper rejection.
- Full browser50/50; new three-location tests buy all tiers, reload and compare
  exact charges, actual selected sprite, four distinct rendered frames and
  unchanged background thumbnails. Catalogue navigation covers four items.
- Release audits15/15. Build-directory and shipped-ASAR policies share the same
  narrow four-name stand PNG predicate; arbitrary reference PNGs remain rejected.
- TypeScript/lint/build passed. Rebuilt actual Windows save/recovery/import/export,
  UI, paid-location replay and30-day campaign passed. Dedicated native stand test
  passed all12 location/tier combinations,12 close/relaunches, exact charges,
  version8 durability and unchanged background thumbnails.
- Actual Windows performance run also passed: preparation/results/minimized idle
  had zero canvas draws, and the20-day sample used about167MiB mean private memory.
- Private ten-map atlas uses the ACTUAL runtime stand rasterizer and all four
  alpha frames;40 map/tier compositions, source comparison, resize/grayscale and
  sprite controls pass. Game still has three playable locations; no claim that
  the other seven are implemented by this review atlas.

Exact original alpha PNGs and prompts: art/studies/stand-upgrades. Private runtime
evidence: .local-m4/stand-upgrades and test-results/stand-*.png. Updated atlas:
.local-m4/all-map-art/atlas.html. No source-game image was supplied to generation.
Require final-head remote CI before merging. #229 and visual acceptance #97 stay open.

## Next

Integrate the improved backgrounds with coherent stand/service/queue/entrance and
exit geometry; validate placement with moving people instead of baking a stand
into each map. Preserve the separate immediate-next-day and weather work.
