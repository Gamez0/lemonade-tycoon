# Remaining image pass

Inventory: `docs/reviews/remaining-image-inventory.md`; issue #257 remains open.

First implementation: three Staff catalogue portraits, generated with built-in
OpenAI image generation. Exact prompts are `staff-*-prompt.txt`; full native
transparent sources are `staff-*-v1.png`, copied unchanged to `src/game/assets`.
The only image input was our own `map-neighborhood.png`, as a style reference.
The cashier and entertainer references were inspected privately and translated
into the prompt's written clothing/silhouette observations. Original pixels were
never input to generation or shipped. Owner is our own remake character.

The existing `none`, `server`, `host` identities, wages and effects remain intact.
This adapts observed cashier/entertainer visual motifs to those existing roles;
it does not claim original employee mechanics or names have been implemented.
The portraits are catalogue images, not in-world customer/staff sprite sheets.

Native 1254×1254 alpha images are displayed with ordinary image filtering at
100×100 CSS pixels inside the existing 110px card. They bypass the 26×26 glyph
and have no low-resolution canvas intermediary. Source quality must still be
checked in the actual packaged game, including transparency against card green.

Run the private comparison board:

```
node art/studies/remaining-images/review.cjs <private-legacy-parent-worktree>
```

It writes only to ignored `.local-m4/remaining-images`, embeds private references
there, covers all 26 baseline glyphs and includes the three revised portraits.
It is a research artifact, excluded from desktop output. Standalone reference
matches are visual evidence only, not mappings of equivalent game mechanics.
Actual contextual sizes differ and are reported in the inventory.
