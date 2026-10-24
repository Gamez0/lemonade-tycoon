# Remaining imagery: original-based review inventory

Issue: [#257](https://github.com/Gamez0/lemonade-tycoon/issues/257). Inventory at
`87ec71c`, following the map/stand rendering work in #229. This records unfinished
visual work; it does not claim that a replacement or human acceptance is complete.

## What actually reaches the reboot game

`src/reboot.ts` imports `presentation/layout.ts`, `icons.ts` and `street-scene.ts`.
The scene imports `art.ts`, `map-assets.ts` and `stand-art.ts`. Desktop builds use
this reboot entry point, and `scripts/desktop-assets.cjs` restricts shipped files.
The legacy parent's `public/assets/original` directory is private research input,
not a product asset directory. Its many files are not an inventory of shipped art.

The current ten map PNGs and four v2 stand PNGs have their own review records.
Four separately drawn Neighborhood scenery pieces remain imported for historical
scene studies; inspect their actual use before replacing or deleting them. The
old v1 stand PNGs remain source history and are not the active stand imports.

## Inventory and next action

Sizes below are CSS pixels or Phaser world units, not source PNG resolution.
The actual map backing is 1280 by 1024 for a 640 by 512 world, so screenshots must
be compared at the same displayed size. Enlarging a 26-unit drawing does not add
material detail, even when SVG edges stay sharp.

| Family | Current implementation and use | Retained original reference | Next visual work |
|---|---|---|---|
| Customers | `art.ts`: three profiles, four 20×34 generated textures each; scene scales them 1.4×. Idle, two stride frames and cup pose; one rear pose is generated but not selected by the current scene. | `customers.png` + `customers.json`; retained same-location map captures. Atlas source cells are 22×34, with trimmed bounds. | Highest priority: compare silhouettes and foot positions at actual display size; independently draw matching bodies, clear walk/wait/drink poses and appropriate facing. Coordinate identity expansion with #228 and behavioral facing with #16. |
| Staff catalogue | `icons.ts` owner/server/host SVGs, 26×26 viewBox displayed 88×88 inside 110px cards. No separate staff sprite in the scene. | `equipment-cashier.png`, `equipment-entertainer.png`, original Staff screen captures. | Replace large placeholder portraits with detailed independent illustrations. Original cashier has a green cap, brown hair and white uniform; entertainer is a lemon-costumed mascot. Preserve current IDs, wages and effects; explicitly record any naming/role adaptation. |
| Equipment catalogue | Refrigerator, iceMaker, blender and stand SVGs, same 88px display. Stand card also reports the next state-driven upgrade. | `equipment-refrigerator.png`, `equipment-commercial-fridge.png`, `equipment-ice-maker.png`, `equipment-ice-dispenser.png`, `equipment-citrus-juicer.png`, `equipment-power-juicer.png`; original Upgrades screen. | Separate substantial catalogue illustrations from small glyphs. Inspect each observed tier before drawing its materials and silhouette. Use actual v2 stand art for stand-tier previews rather than the unrelated generic green-roof glyph. Do not invent missing equipment mechanics. |
| Advertising | Text-only flyers/radio options and text in Today's settings; toolbar reuses price glyph. | Original Marketing screen; `equipment-neon.png`, `equipment-sound-system.png` are equipment references, not evidence that current ad IDs have those effects. | Review screen context first; add independently drawn campaign pictures only where they clarify the existing choice. Keep ownership and state separate. |
| Ingredients | Lemon, sugar, ice and cup SVGs reused in stock bar, recipe and supply category tabs. Default34px; supply29px, bundles25px; responsive overrides apply. | `supply-lemon.png`, `supply-sugar.png`, `supply-ice.png`, `supply-cup.png`; Recipe/Supplies captures. | Improve vector silhouettes, paper folds, ice facets and lemon rind at actual small size. Keep quantity badges legible. Retain vector implementation for shared glyphs. |
| Pitcher / recipe | `recipe` SVG, 32px yield illustration and toolbar; supply purchase area reuses ingredient glyphs. | `supply-pitcher-levels.png`; original per-pitcher composition and supply purchase captures. | Review empty/filled states and separate large container art from small navigation glyph. State must follow actual recipe/yield rather than decorative levels. |
| Weather | Sunny/cloudy/rainy SVGs at32px; separate full-scene weather tint. | `weather-sunny.png`, `weather-little-cloudy.png`, `weather-cloudy.png`, `weather-rainy.png`, `weather-thunderstorm.png`, `weather-panel.json`. | Improve the three supported forecast glyphs first; retain the others in the reference inventory. A new weather symbol must not imply an unimplemented weather state. Compare tint and un-tinted art separately. |
| Reactions / results | Happy, unhappy, expensive, passing, empty, clock SVGs; daily counters and report face42px. In-world reactions are text `$`, `!`, `...` and taste feedback. | Original customer bubbles and Daily/Results captures. | Review bubble shapes, expressions and text baseline at actual size; distinguish price, stock, queue and taste. Do not substitute a happy expression for measured satisfaction. |
| Reports / calendar | Calendar, results ledger and supplies glyphs in four report tabs. Profit graph is data-driven SVG, not a bitmap. | Original Daily, Profit & loss, graph and Balance Sheet captures; original result-stock capture is Balance Sheet. | Improve tab glyphs and commentary illustration together. Preserve signed graph values and accounting labels; do not rasterize the data graph. |
| Navigation / actions | Seven toolbar tabs, rent house, price coins, supplies crate, arrow characters and play triangle; CSS button frames, focus/pressed/disabled states. | `tab-{results,rent,upgrades,staff,marketing,recipe,supplies}.png`, `button-{buy,rent,start-day,options,help}.png` and matching full screens. | Independently redraw small vectors consistently; retain accessible labels and state styling. Inspect shared icon meanings because several tabs currently reuse unrelated glyphs. |
| Shell / brand / progress | Masthead lemon glyph, CSS edition badge, date text, progress bar, modal/display controls. | Original masthead/status/options screenshots, not map scenery. | Audit at supported window sizes and Windows DPI; improve only after larger visible art. Preserve product's own name and readable controls. |

There are 26 named vector glyphs in `icons.ts`: stand, refrigerator, iceMaker,
blender, owner, server, host, rent, sunny, cloudy, rainy, happy, unhappy,
expensive, passing, empty, clock, calendar, lemon, sugar, ice, cup, results,
recipe, supplies and price. The generator reports the count and detects future
additions. Every glyph is included in
the comparison board, including those reused across several screens.

## Review and implementation order

1. Generate the private equal-size reference/current board with the accompanying
   script. Review original Staff/Upgrades context before prompting large art.
2. Replace staff and large equipment placeholders, including state-driven stand
   preview. This is a bounded first implementation; customer pose work follows
   with its own animation/facing review rather than a static image swap.
3. Improve the shared ingredient/weather/reaction/navigation vector families,
   followed by report, brand and remaining control imagery.
4. For each family retain original/current/revised comparisons, exact prompts
   for generated art, provenance, normal-size packaged screenshots and rendering
   checks. Original reference pixels stay private and are never supplied to image
   generation or shipped. Use the independently generated map/stand art as style
   references when useful.

Changing art alone must preserve prices, ownership, selected staff, recipe,
save compatibility and simulations. New PNG families need a narrow packaged-asset
allowlist and credits. Customer animations require consistent foot anchors,
direction, pose boundaries and reduced-motion behavior; source image quality
alone does not establish runtime quality. Human acceptance stays in #97.

## First implementation: Staff catalogue

The baseline inventory above is retained for comparison. The first change replaces
the three large Staff glyphs with native transparent 1254×1254 illustrations,
displayed at100×100 inside the existing110px card. Server follows the observed
cap/hair/uniform motif; host follows the lemon-costume motif. Owner is an original
remake design. The existing Jamie/Robin names, IDs, wages and effects are preserved.
No in-world employee sprite or new mechanic is introduced. Shared small SVGs
remain available. Sources, prompts and provenance: `art/studies/remaining-images`.
Actual packaged screenshots and verification results must accompany review.

Initial verification: model/storage77/77, typecheck, reboot lint, release15/15,
browser management5/5 and actual Windows six-card review passed. The package was
built from clean76da2cf before an ancestry-only rebase; product contents match.
All three native1254px images decode with transparent corners and normal filtering
at both tested window sizes. The private actual Windows board is
`.local-m4/remaining-images/native/review.html`. Performance is being rechecked
in isolation after an initial sample recorded one startup repaint; later idle
samples had zero draws and20-day private memory was209MiB. Do not claim a full
performance pass until the isolated enforced run completes.

## Progress - 2026-10-24 KST

Staff portraits were integrated in PR258 and the user positively reviewed their
detail today. Preserve them. The minimal-face requirement is specific to people
moving on the map, not catalogue portraits.

PR260 corrects current-art route/stand-facing, rear stride/cup combinations and
reduced-motion cups. Model79, full browser67, release15, clean native UI and
isolated enforced20-day performance pass (215.5MiB private, zero idle draws).
The large-headed detailed generated studies remain rejected; draft259 preserves
a minimal-face restart and source/scale evidence, with no art shipped.

The next equipment-card improvement reuses the actual native v2 stand artwork
for the owned stage. It replaces only the unrelated generic catalogue glyph;
the small navigation glyph remains. Other equipment, ingredients, weather,
reaction/report and navigation image work stays open in #257.

Equipment follow-up replaces the refrigerator/ice-maker/blender catalogue glyphs
with native1402x1122 independent illustrations. Source259e6fc clean Windows:
six equipment/eight stand previews and enforced20-day performance passed
(229.9MiB private, zero idle redraws,0.257MiB retained heap). Final CI pending.
The next ingredient inspection corrects this table's paper-fold assumption:
the retained sugar reference depicts a scoop with a small sugar pile, not a bag.

## Implementation checkpoint - final family review

The initial table above is historical. The current source bindings and private
native captures establish the following scope; human visual acceptance remains
separate in #97/#16. Do not interpret a retained original reference as proof of
recovered mechanics or identities.

| Family | Implementation / review result |
|---|---|
| Map people | PR265: minimal faces only, named presentation families with an explicit profile adapter,66 native128x192 frames, alternating walk/order/cup states, four route directions, fixed feet and reduced motion. Ten real Windows maps and controlled80actor review pass. |
| Staff | PR258: approved detailed native1254px catalogue portraits remain unchanged. Staff navigation reuses the same server image. No in-world employee sprite is invented. |
| Equipment / stands | PR261/262: owned stand stage uses the actual four native v2 images/crops; three equipment illustrations use native1402x1122 sources at100px. Existing equipment levels remain explicit text with the same role image; no unsupported original machine variant or mechanic is claimed. |
| Ingredients / supplies | PR262: sugar scoop/pile, nested cup stacks and lemon rind/wedge; ice facets reviewed and retained. Shared vectors serve recipe, purchase bundles and stock without raster enlargement. |
| Recipe / weather / navigation | PR264: curved pitcher, carton, three supported weather glyphs, map pin, shop, handbill/coins and unchanged Staff portrait. No extra forecast state or decorative fill-level simulation is added. |
| Reports / calendar | PR266 candidate: separate Daily calendar, ledger, graph and balance symbols. Neutral no-sales face avoids asserting price rejection when the text identifies another cause. Actual data graphs, accounting and completed-day selection are preserved. |
| Reactions | Happy/unhappy, price, passing, stock and wait roles reviewed at actual sizes and retained. Map taste/price/stock/queue text remains distinct; a served count is not a measured satisfaction value. |
| Advertising | Current candidate: word-of-mouth bubbles, authored handbill/coins and radio symbols; name, daily price and traffic effect separated. Keyboard selection, save state, no browse charge and450-cent radio opening charge verified in Windows. Matching original selected Marketing capture is unavailable; these are remake role symbols, not claimed original campaign art. |
| Shell / actions | Retain the remake's own masthead/edition and live date, progress/rating meters, native text controls, arrows/play and shared focus/pressed/disabled button treatment. The masthead uses the revised shared lemon. Native UI/relaunch and browser breakpoints cover these controls; do not copy a source-game logo or rasterize changing values. |

The vector inventory reports33 names after both current candidates, including
unused legacy catalogue glyphs. Those source glyphs are not the large images
rendered by the actual catalogue; use the native card screenshots and dedicated
Staff/equipment/stand reviewers for the final path. Twenty standalone original
reference matches supplement the separate customer/report comparisons.

No original pixels enter the shipped allowlist, generated art inputs or store
assets. Generated Staff/equipment PNGs and exact prompts remain in
`art/studies/remaining-images`; only our own authored scenery was a style input.
The new customer and interface work is code-native. Ownership, prices, recipe,
save schema, business ticks and dynamic scene layers remain state-driven.

Validation checkpoint: customer model79/full browser67 plus final I/O-resume
regression/release15, controlled Phaser10map80actor66frame, clean Windows real
selling10maps and full UI/relaunch pass. Isolated enforced20day performance:
231.14MiB maximum phase-mean private memory, zero idle frames and0.256MiB retained
JS growth. Report candidate781 combines with customer mainf6 and passes clean
Windows26asset/full UI/relaunch/10report panels plus79model/type/lint; final CI
and advertising integration remain pending. These checks establish engineering
evidence, not minimum-device certification or human visual acceptance.
