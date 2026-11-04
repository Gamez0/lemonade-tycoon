# Composed Korean guidance — #300

UI-only Windows alpha27 exploration reproduced English recipe hints once an
overnight ice-loss suffix was appended, and partly English daily reports when
taste advice followed missed-customer counts. The standalone translations
already existed; concatenating before lookup prevented them from matching.

The renderer now translates cooling/legacy guidance and ice loss separately,
and translates report summary/counts before appending taste advice. Taste advice
translates each complaint independently, including multiple complaints. No
generic punctuation splitting, formula, weather, RNG, price or save-schema change.
English composition stays byte-for-byte the same. Player names remain protected.

Browser regressions exercise warm+sour, watery and sweet outcomes, actual
sale-to-next-day hints, repeated Korean/English switching, identical English
report text, unchanged save bytes and reload. Native taste checks add bilingual
report/overnight guidance checks alongside actual historical paid replay.
Current-head CI and clean package verification remain required before integration.

## Exploration evidence

The12-day exploration used a clean profile, UI purchases/recipe/prices, actual
game time with the game's speed/SKIP controls, and no injected cash/state or
simulation calls. Neighborhood days1–3, Park4–8 and Downtown9–12 sold307cups for
$392.25; cash40 became301.25. Three equipment purchases cost35 on day5. Paid
day3/day8 were closed and resumed; day13 survived final normal close/relaunch.
Korean was enabled on day7. No page errors were recorded. This bounded automated
exploration is neither original-game observation nor human beta acceptance.

All screenshots/DOM/journal and the profile remain local in the recipe worktree's
`.local-m4/exploration-alpha27-final/`. Earlier instrumentation attempts used an
obsolete hidden next-day button, hidden performance values and a fieldset matcher
that did not recognize its disabled attribute. Those logs are preserved as tool
errors, not product defects. The corrected run reads visible daily report values
and tests the actual disabled recipe input.

Representative reproduction: [overnight recipe hint](composed-korean/before-recipe.png)
and [daily report with taste advice](composed-korean/before-report.png).
Human visual, listening and physical-device gates remain open.
