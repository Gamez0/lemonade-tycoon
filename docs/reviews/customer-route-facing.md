# Customer route and counter facing

Follow-up to #257; #16 and #97 retain manual visual acceptance.

Previously every walking departure used an unmirrored front pose. The existing
rear texture was never selected; only stationary customers could mirror towards
the stand horizontally. Neighborhood arrivals and through walkers even use
different diagonals, so a single orientation cannot represent both.

The renderer now samples the actual local route tangent, including separate
through/departure paths and decreasing progress during queue approach. Standing
customers face the stand's ground anchor. Direction selects front/back and
horizontal mirroring; near-stationary axes retain their previous component.
Two additional combinations of the existing code-native drawing provide rear
stride and rear cup poses. This is a directional correction of current art,
not acceptance or integration of generated customer sheets.

Reduced motion retains facing and purchased cups while suppressing walk poses.
Per-person facing is deleted with the sprite and cleared on day reset.
Routes, timing, transactions, IDs, saves and body scale are unchanged.

User correction on2026-10-24: independently generated v1-v3 customer studies have
excessive facial detail and cartoon head proportions. All remain rejected and
unshipped. Future art should use restrained small heads, minimal facial marks
and identity conveyed by clothing/silhouette/direction at equal map width.

Validation:

- Model/storage79/79, typecheck, reboot lint and production build passed.
- Route checks cover all ten maps, all three path purposes, reverse queue
  movement, counter direction, stationary axes and reduced-motion cups.
- `node scripts/customer-facing-review.cjs` invokes the actual production
  drawPeople/createArt methods in Phaser, covering10 maps and80 actor instances,
  serving/queue approach/through/departure, reduced motion and departure cleanup.
  Private PNGs and JSON are in ignored `.local-m4/customer-facing`.
  It is a controlled scene harness, not a packaged/full-game acceptance claim.
- The first harness attempt used TypeScript's default ES5 transpile target:
  Map iteration failed in the harness. Matching the production ES2020 target
  fixed the harness; the rerun passed. No product lifecycle fix was needed.
- Full browser and actual Windows checks remain pending.
