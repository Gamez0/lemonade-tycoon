# In-world stand redraws

The user rejected the earlier icon-like stand illustrations and asked for the
same quality as the map paintings, with thorough original-based placement.

All four source PNGs were generated using the built-in OpenAI image-generation
tool. The only supplied visual inputs were this project's own Neighborhood
painting, and for the three upgrades, the newly generated own Basic cart.
Original references were inspected privately and translated into written design
observations; no original pixels were supplied to generation or shipped.
Exact prompts are the four `*-prompt.txt` files. Selected sources: `*-v1.png`;
production copies: `src/game/assets/stand-*-v2.png`.

Basic: yellow timber cart and blue/pale-yellow parasol. Classic: red/cream pitched
canopy and yellow timber counter. Lemon: whole horizontal lemon shell and small
yellow/cream serving awning. Castle: golden round crenellated turrets and rounded
gold canopy. All share an elevated 2:1 orthographic projection with the main front
edge rising toward screen-right. Earlier assets remain preserved as superseded
studies, not the selected direction.

Native alpha crops retain source detail. A measured front-floor anchor replaces
the arbitrary bounding-box bottom-center; mirroring also mirrors this anchor.
The runtime floor point and service point are separate. Upgrades expand around
the same sales pitch without moving customer feet into the stall.

Native sources are1402x1122. Logical widths30/46/52/60 are an initial integration
scale relative to the existing customers; actual40-combination review is required.
Do not equate a sharp source drawing, successful image generation or green CI
with successful in-game integration or human visual acceptance.
