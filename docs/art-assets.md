# Art direction and asset register

## Reference analysis

Primary visual anchor: original Windows Lemonade Tycoon, not its sequel or mobile reinterpretations. Examined the [selling screen](https://www.mobygames.com/game/44300/lemonade-tycoon/screenshots/windows/854921/) via its [full screenshot](https://cdn.mobygames.com/screenshots/4726190-lemonade-tycoon-windows-selling-lemonades.jpg). Also located [recipe and park screenshots](https://games.softpedia.com/get/Shareware-Games/Lemonade-Tycoon.shtml). Reference images are not bundled with the game.

The viewed 640×480 selling screen places a compact elevated street view in the right half, persistent stock/cash across the top and dense business controls on the left. Small customers contrast against broad pale sidewalks; the yellow stand is a bright focal point inside a neighborhood of houses, lawns and roads. Strong outlines and simple silhouettes do more work than fine texture. The stand is several customer widths across, while buildings dominate the environment. Green UI surrounds the world rather than replacing it. These observations guide an original composition, not copied geometry.

Reboot specification: warm cream/yellow/leaf-green palette, darker outlines, overhead three-quarter cues, original small neighborhood, low-resolution world scaled with nearest-neighbor filtering. Keep customers small relative to the stand, clear sidewalk movement lanes, a lemon sign, visible yellow drink, and readable walk/stop/buy silhouettes. Business controls remain adjacent to the scene. Character animation uses a small number of leg/arm poses; UI text stays native resolution for readability.

## Register

| Asset | Original reference | Purpose | Logical size | Animation / states | Priority | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Stand | Selling screenshot, yellow focal kiosk | Identify service point | 60×56 px | open/closed sign | P0 | Implemented in `art.ts`, scene text sign |
| Street / ground | Selling screenshot, sidewalk contrast | Customer route and context | 320×220 px | static, weather tint | P0 | Original code-drawn texture in `art.ts` |
| Basic customer | Selling screenshot, small outlined figures | Visible demand | 16×20 px | walk 2 frames, wait/buy, leave with drink | P0 | Original sprite textures; stable profile through visit |
| Lemonade | Selling screenshot, yellow supply cues | Sale readability | 3×4 px | held after purchase | P0 | Included in customer departure pose |
| HUD | Top resource strip and business panels | Cash, stock, weather, phase | responsive DOM | preparation/selling/results | P0 | Implemented in `reboot.ts` and `style.css` |
| Houses / trees / bench | Neighborhood context | Environmental storytelling | varied | static | P1 | Included in neighborhood texture |
| Customer variations | Small readable silhouettes | Diversity without visual noise | 16×20 px | three profiles, four poses each | P2 | Implemented |
| Weather effects | Original weather indicator | Reinforce forecast | scene overlay | sunny/cloudy/rainy tint | P2 | Tint implemented; particles deferred |
| Audio | No source asset reused | Feedback | n/a | sale/open/close | P3 | Backlog, silent MVP |

Procedural pixel artwork is a maintained game asset when authored to this specification; anonymous rectangles used only for debugging are placeholders. Every unfinished visual must remain listed here with a replacement priority. Existing public/assets images/audio/Tiled sources are preserved as legacy; origin/license verification is required before selectively adopting them into reboot.
