# Original equipment and rules: evidence boundaries

2026-11-02, #235. Reuses [the retained 1.1.6 audit](original-116-live-audit.md),
[customer units](customer-evidence.md), and product #228/PR281. No original
program was launched and no new timing sample was taken. Prices below are
observed card prices; descriptions establish intended effects, not coefficients.

| Equipment | Price USD | Known description / remaining measurement question |
| --- | ---: | --- |
| High Output Citrus Juicer | 49.99 | Faster refill; refill steps and stacking with other juicers unknown |
| Shade Maker 3000 Canopy | 129.99 | Cooling; static waiting bonus below; other temperature effects unknown |
| Miracle 9000 Power Juicer | 149.99 | Faster refill; exact multiplier and stacking unknown |
| EZserve Cash Register | 249.99 | Faster service; exact service counter change unknown |
| Mr. Fridge | 249.99 | Lemon preservation; spoilage function and storage limit unknown |
| Ice-O-Matic | 399.99 | Ice supply; output quantity, timing and capacity unknown |
| Classic Stand | 449.99 | First paid shape; stock limits and prerequisites unmeasured |
| High Five Sound System | 799.99 | Attraction; arrival increment and location interaction unknown |
| Lemon Stand | 999.99 | Second paid shape; capacity and progression conditions unmeasured |
| Bright Lights Neon | 1249.99 | Visibility; arrival increment and stacking unknown |
| Take 2 Dispenser | 1599.99 | Refill/service; each counter and stacking unknown |
| High Output Automatic Icemaker | 2599.99 | Advanced stand prerequisite observed; precise eligible shapes/output unknown |
| Castle Stand | 9999.99 | Third paid shape; capacities and gating unmeasured |
| Martine cashier | 60/day | Serving assistance; coefficient and interaction with register unknown |
| Simon Lemon | 80/day | Queue happiness; exact waiting modifier and activation boundary unknown |

The free base plus three paid stands make four shapes. Staff prices are daily
wages, not equipment purchase prices. Duplicate 249.99 prices cannot identify
an object by price alone. Recipe bounds, per-cup ice use, location rent,
original price/taste curves and overall-versus-buyer satisfaction denominator
are already recorded in the existing audit; they are not new missing tasks.

## Additional static evidence: canopy and waiting counter

The retained loaded image SHA256 is
`f0f8c2f87336904fc44398e95dbf355b84384a168d05ae16d12d2b39ec025aec`.
Constructor 0x4035a5 pushes12999 cents for the object at game+0x5670.
At0x4036e8..0x4036ee that object's address is stored at game+0x579c.
Getter0x404a11 reads that pointer and calls0x40793a, which returns its
byte+0x10 ownership flag. When set,0x404a26 adds game+0x44; constructor
0x403386 initializes that field to15. The price uniquely matches the canopy
among the observed cards. This supports a conditional15 waiting-step bonus
for that hardware object, not a live purchase experiment, a Simon bonus,
a seconds measurement or proof of the canopy's only effect.

The companion script verifies those exact byte anchors without executing code.
The other additive field game+0x57cc remains semantically unresolved. Modifiers
and real time units retain the limitations of the customer evidence report.

## Concrete observation gates and protocol

The retained legitimate Try Now session expired2026-10-14. A valid licensed
execution environment of the same version is required before new gameplay
measurement. No license bypass, clock adjustment or expired-session launch is
part of this audit. Existing supplies-cup capture shows a selectable75-cup pack
and disabled225/400 packs at47 cups; cash, pack affordability and capacity are
confounded. It establishes no exact storage limit.

For each unresolved row, capture version, location, day/weather, eleven-group
mixture, starting stock/cash, all owned items and staff; record a before/after
purchase pair and at least three repeated days per condition. Count refill and
service simulation updates separately from wall time, retain arrivals and
served/rejected counts, and test each item alone before combinations. Do not
attribute random arrival variation to equipment. For capacity, vary cash and
stock independently around each purchase threshold, test all pack sizes, and
record the rejection text; repeat for each stand. For spoilage/ice, record
inventory before opening, after each cup and at day boundaries. Progression
requires both affordable and unaffordable controls and explicit prerequisite
messages. These are proposed protocols, not fabricated samples or constants.

## Product scope and compatibility

The reboot's juicer/register/ice/staff choices and its timing/arrival tuning are
product rules. This audit does not add all thirteen original cards, ten places
or original art to release requirements. Ice machines stay free of invented
electricity charges. Any future rule adoption needs a separately scoped backlog
item, frozen paid-opening parameters and exact old-save replay fixtures, as
#228/PR281 did; decoding a previous company must not silently recalculate a paid
day. Human acceptance and release-rights gates remain independent.
