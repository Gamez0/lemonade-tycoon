# Neighborhood road correction

User visual feedback: the neighborhood road looked unnatural.

The old side street used an independently drawn narrow polygon that ended behind the main street's continuous pavement. This left a curb/grass break instead of a connected junction, and its edge line did not follow the asphalt edge.

Rebuilt the pavement and asphalt as two continuous T-shaped outlines on the same 2:1 projection. The branch has parallel edges and consistent width. Pavement seams stop at the opening, center dashes leave the junction clear, and a short crossing follows the existing pedestrian route. Moved the mailbox onto the corner pavement so the wider branch does not run under it. Building positions and simulation rules remain unchanged.

Visual review: inspected a canvas capture at the actual displayed size, including the curb corners, crossing, mailbox and cart clearance. Updated the M2 captures after the production browser run. Typecheck/lint and production checks are recorded in the PR. No geometry-mirroring unit test was added for this artwork-only correction.

## Selling/weather follow-up

The user expanded the review after the road fix: study the opened-day design and refine M2 comprehensively. Re-examined the original preparation, two selling and results screenshots. Detailed observations and their implementation mapping are in `docs/research/m2-selling-weather-study.md`.

- Added original SVG sunny/cloudy/rainy symbols, a date/weather/news hierarchy and distinct forecast/current/closed-day labels. Temperature remains the simulation's actual constant daily value. Day progress moves into the forecast header.
- Enlarged small text and ingredient artwork, added directional spinner controls, and reduced the standalone text blocks around the neighborhood.
- Selling now shows compact reaction icons and separate event counters, then structured location/rent/price/recipe/capacity rows. Counters reset with the presentation and are checked against processed visitors. These do not simulate patience or queues.
- Speed is inside the scene's lower-right corner. The completion sign only appears after the final customer exits. Ratings show actual reputation and buyer satisfaction, with an empty state when nobody bought.
- Results pairs the accounting ledger with illustrated customer feedback and report tabs. Existing accounting rows stay intact.
- M3 milestone 3 / issue #100 records concurrent visitors, queues and waiting departures. No M3 simulation behavior was added here.

Review limits: original timing and fonts are not exactly reproduced. SKIP, within-day weather changes, advertising and upgrade controls are not faked. The scene still handles one visitor at a time until M3.

Final local verification: strict TypeScript and lint pass; production build and all 3 browser tests pass (1.9 minutes). Desktop and 375px runs each complete three days. Additional assertions cover weather phase labels, completion sign after the last exit, reaction totals and next-day counter reset. Four preparation tabs have the same Start day top (y=676 at 1280×1000); the app measures 960×761 and the scene remains 5:4.

Weather inspection uses normal simulation seeds 2026 (sunny), 300 (cloudy) and 1000 (rainy), substituted only in a Playwright-intercepted development response. No test hook or seed override was shipped. Captured weather panels and rainy selling are labeled accordingly. A failed first fixture missed Vite's timestamp query and therefore showed sunny; it was corrected and the cloudy label/value were explicitly checked before capture.

Final CSS review split WebKit/Mozilla progress selectors into separate rules so an unknown vendor pseudo-element does not invalidate the other browser's fill styling. Remote CI runs the final source after this small correction. The refreshed board and runtime images are inspected separately from automated checks.
