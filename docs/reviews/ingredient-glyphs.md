# Ingredient glyph reference correction

Follow-up to #257. Private source inspection shows sugar as a measuring scoop
with a small pile, and paper cups as nested stacks. The current SVGs instead
showed a paper bag and two individual cups. Lemon references also include a cut
wedge rather than only whole fruit.

Independently redraw these three shared vectors in the existing26x26 icon
system: scoop/pile, nested paper cups, and whole lemon/cut wedge. Keep the
existing two-cube ice glyph after comparison. No source pixels, new bitmap,
generation input or external asset is introduced. Names, labels, quantities,
badge counts and recipe/purchase rules are unchanged. Cup stacks are an
ingredient emblem, not a representation of the current numeric inventory.

`node art/studies/remaining-images/ingredient-review.cjs <private-legacy-root>`
compares original, baseline334f052 and revised vectors at25/29/34px, preserving
aspect ratio. Twelve revised samples decode and fit inside the26px viewBox,
including space for the shared stroke. Private PNG/HTML/bounds are under ignored
`.local-m4/ingredient-review`. Visual review confirms the scoop handle/pile and
cup nesting remain readable at25px. Original pixels remain private.

Typecheck, reboot lint and production build passed. Focused purchase-draft and
all-preparation-screen breakpoint tests passed2/2. This is a partial ingredient
pass; pitcher/container imagery and remaining weather/report/navigation families
stay open. Staff portraits and map pedestrians are unaffected.
