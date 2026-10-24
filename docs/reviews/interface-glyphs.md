# Weather, recipe and navigation glyph pass

Follow-up to #257. Staff navigation used a happy reaction bubble and Upgrades
used the same crate as Supplies. Replace those unrelated pictures with the
unchanged native server portrait and a dedicated striped shop. Marketing gets
its own handbill/coins glyph; the money glyph remains available for money.
Rent now uses a folded map/location pin following the observed map-tab concept.
Results keeps its existing ledger after review.

Refine the three supported weather glyphs: eight-point sunburst, layered clouds
and actual blue raindrops. No weather state, temperature, tint or forecast rule
changes. Recipe uses a curved transparent-style pitcher with handle/ticks, and
Supplies a folded cardboard carton. These remain shared code-native vectors;
no original pixels, new raster asset or generation is introduced.

Staff navigation reuses the approved server image at43px/32px with normal
filtering. Its100px catalogue appearance and all three portraits are unchanged.
Text labels, targets, focus/pressed/disabled styling, quantities, prices and
saves remain unchanged. Two dedicated names bring the glyph library to28.

Private comparison:
`node art/studies/remaining-images/interface-glyph-review.cjs <private-root>`
shows ten roles against baseline1ce0651. Weather uses equal32px boxes. Tabs use
the first normal50px-high original button frame from retained metadata, including
its label; revised glyphs are43px/32px. The general inventory reviewer also now
clips only the normal frame rather than shrinking an entire3/4-state strip.
It reports28 glyphs and20 reference matches. All original pixels stay in ignored
`.local-m4/interface-glyph-review`.

Typecheck, reboot lint, production build, source-script lint, all revised
viewBox/console checks and four focused catalogue/seven-screen/preparation
breakpoint browser checks passed. Native UI/weather captures and final CI
remain pending. This does not establish #97 visual acceptance.
