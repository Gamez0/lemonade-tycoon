# Art direction and asset register

## Reference analysis

The more detailed [M2 original-game study](research/m2-original-study.md) and [reference board](research/m2-reference-board.html) supersede informal layout assumptions below. The baseline is the consistent English Windows 1.1.5 screenshot set; other builds are labeled separately. User accepted M1 functionality and made original-game visual/interaction fidelity the second MVP. Current asset statuses describe M1, not M2 completion.

Primary visual anchor: original Windows Lemonade Tycoon, not its sequel or mobile reinterpretations. Examined the [selling screen](https://www.mobygames.com/game/44300/lemonade-tycoon/screenshots/windows/854921/) via its [full screenshot](https://cdn.mobygames.com/screenshots/4726190-lemonade-tycoon-windows-selling-lemonades.jpg). Also located [recipe and park screenshots](https://games.softpedia.com/get/Shareware-Games/Lemonade-Tycoon.shtml). Reference images are not bundled with the game.

The viewed 640×480 selling screen places a compact elevated street view in the right half, persistent stock/cash across the top and dense business controls on the left. Small customers contrast against broad pale sidewalks; the yellow stand is a bright focal point inside a neighborhood of houses, lawns and roads. Strong outlines and simple silhouettes do more work than fine texture. The stand is several customer widths across, while buildings dominate the environment. Green UI surrounds the world rather than replacing it. These observations guide an original composition, not copied geometry.

Revised direction (2026-09-29, user playtest): restore old PC tycoon aesthetics across both the world and interface; avoid modern cards and spacious cream layouts. Use saturated deep-green inset panels, lime beveled buttons, yellow highlights, small illustrated resource icons and compact native-resolution text. The world uses a consistent 2:1 diagonal ground projection, fine dark outlines, shaded building sides, roof seams, angled windows, fences, textured lawns and a small blue/yellow parasol cart. Customers stay small relative to buildings and walk along the diagonal pavement, stopping beside the cart. All artwork is original code-authored geometry; reference screenshots are not copied into game assets.

## Register

| Asset | Original reference | Purpose | Logical size | Animation / states | Priority | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Stand | Selling screenshot, small parasol cart | Identify service point | 72×88 px | open/closed sign | P0 | Original wheeled cart, segmented parasol, vendor and pitcher |
| Street / ground | Selling screenshot, diagonal sidewalk | Customer route and context | 640×440 px | static, weather tint | P0 | Original outlined neighborhood, 2:1 ground projection |
| Basic customer | Selling screenshot, small outlined figures | Visible demand | 20×34 px | walk 2 frames, wait/buy, leave with drink | P0 | Original sprite textures; stable profile through visit |
| Lemonade | Selling screenshot, yellow supply cues | Sale readability | 3×4 px | held after purchase | P0 | Included in customer departure pose |
| HUD | Top resource strip and green inset panels | Cash, stock, weather, phase | compact DOM | preparation/selling/results | P0 | Beveled controls, section shortcuts, ingredient +/- buttons; responsive narrow layout |
| Inventory / control icons | Original ingredient and tab illustrations | Quick visual identification | 26×26 SVG | static | P0 | Seven original outlined icons in `icons.ts`, shared across controls and live inventory |
| Houses / trees / bench | Neighborhood context | Environmental storytelling | varied | static | P1 | Included in neighborhood texture |
| Customer variations | Small readable silhouettes | Diversity without visual noise | 20×34 px | three profiles, four poses each | P2 | Implemented |
| Weather effects | Original weather indicator | Reinforce forecast | scene overlay | sunny/cloudy/rainy tint | P2 | Tint implemented; particles deferred |
| Audio | No source asset reused | Feedback | n/a | sale/open/close | P3 | Backlog, silent MVP |

Procedural pixel artwork is a maintained game asset when authored to this specification; anonymous rectangles used only for debugging are placeholders. Every unfinished visual must remain listed here with a replacement priority. Existing public/assets images/audio/Tiled sources are preserved as legacy; origin/license verification is required before selectively adopting them into reboot.
