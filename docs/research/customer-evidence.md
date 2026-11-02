# Eleven original groups: frame-bank links and counter units

2026-11-02, #234. This reuses the existing eleven-group/ten-location table and
the retained loaded image with SHA256
`f0f8c2f87336904fc44398e95dbf355b84384a168d05ae16d12d2b39ec025aec`.
No original program is launched. Outputs are the
[eleven-row link/unit table](customer-evidence/customer-group-links.csv) and
[addresses, hashes and limitations](customer-evidence/customer-evidence.json).

## Newly confirmed program links

Visitor creation at`0x401e81..0x401e9b` requests a random slot0..4, reads one of
the profile record's first five integers and stores it at visitor`+0x48`.
The getter`0x402413` returns that field and is called by the renderer at
`0x40c480`. Rendering at`0x40c580..0x40c5a1` adds direction, indexes the
stride12 table at`0x464cbc`, then adds the pose offset.

All196 direction-bank entries were checked: start frame is`5 * bankIndex` and
count is5. Thus four direction banks correspond to20 frames per program
character ordinal. The old five appearance fields are **not five extra customer
types**. The resulting choices are:

| Original group | Program character slots, preserving repetitions |
| --- | --- |
| P1 | 1,2,3,4,5 |
| P2 | 6,7,8,4,5 |
| P3 | 15,16,17,18,9 |
| P4 | 19,20,21,22,23 |
| P5 | 24,25,26,27,19 |
| P6 | 10,11,12,13,14 |
| P7 | 36,37,38,39,40 |
| P8 | 41,42,43,44,44 |
| P9 | 45,46,47,48,48 |
| P10 | 28,29,30,31,28 |
| P11 | 32,33,34,35,32 |

Characters4/5 are shared byP1/P2 and19 byP4/P5. A visible figure therefore does
not uniquely identify patience or budget. Repeated slots are retained instead
of deduplicating their selection weight; exact RNG uniformity was not remeasured.
Character0 is not selected by these eleven records in this constructor path;
this is not proof that no other path can show it.

The extracted49-character/980-frame metadata has matching structural ordinals.
The parent archive's release version remains unverified, so the program-bank
mapping is confirmed while cross-version sprite-pixel identity is not asserted.
Semantic person names remain unverified. The parent's four interpreted visual
families, product's three approved map families and these eleven behavioral
groups remain separate. No original sprite is added to the product.

## Patience and speed: confirmed units versus real seconds

The existing base patience values35..100 are reused, not rediscovered.
`0x401f52` dispatches state2 visitors to`0x402152`, which decrements the waiting
counter at visitor`+8` once per visitor update. The game step loops those visitor
updates at`0x4041b7..0x40420d`. Constructor`0x40337f` initializes game`+0x40`
to70, and`0x404167..0x40416e` advances the step accumulator by that quantum.

The incoming elapsed value is multiplied by game`+0x18` at`0x40411a`.
The source toggle at`0x40c9c5` changes1 to10 and10 to1; quick-finish paths
`0x40ca21`/`0x417ad0` set30000. This establishes source multipliers, not a
millisecond input API or perfectly timed wall-clock expiry. The retained
image's import descriptors have no original-thunk name table; the upstream
clock source/unit was not resolved in this bounded pass. Real seconds remain
explicitly `unverified` in every row.

Nominal unmodified counter durations are base steps multiplied by70 incoming
clock units at1x, or by7 at the source10x toggle. For example,P1 is35 steps,
nominal2450/245 input units; P6 is100 steps,7000/700. These values exclude
modifiers, initial step alignment, scheduling jitter and time spent walking or
being served. They are not labelled2.45/0.245 seconds without clock-unit proof.

The constructor also establishes modifiers: weather code>3 subtracts10 counter
steps, getter`0x404a0e` adds a global modifier, and a negative result uses5
(zero is not the negative branch). That getter reads game`+0x57cc` and adds
game`+0x44` when the object at`+0x579c` has its byte`+0x10` flag set; constructor
default`+0x44` is15. The modifier is additive, not a percentage of each profile.
Its complete equipment/staff identity chain belongs to the equipment audit;
do not name it from an address alone.

## Product boundary and next evidence

[Schema12's customer implementation](../reviews/eleven-customer-profiles.md)
uses the recovered mixture/base-price/base-patience data with explicit product
scaling. Its100ms ticks, relative patience/70, host bonus12, fast4x, cosmetic
family reuse and deterministic SKIP are not claims of the original clock,
speed toggle, sprite identities or weather-patience formula. Existing paid
v6-v12 rules cannot be retroactively changed to incorporate a new discovery.
Any future runtime rule change needs its own approved scope and paid-replay
boundary; research alone does not expand product requirements.

```powershell
python scripts/customer-evidence.py --legacy-root C:/Users/dobin/Documents/Projects/lemonade-tycoon --runtime-root D:/lemonade-taste-audit/.local-m4/original-runtime --output .local-m4/customer-evidence-check
```

The stdlib script pins the image hash and bounded instruction anchors, uses the
already-recovered profile pointers, checks all196 bank entries and preserves
five appearance slots per group. It verifies the existing frame metadata and
records source hashes. It refuses output in the preserved input trees and
exports no binary/sprite/glyph data. Two runs reproduce both reports exactly.

Remaining evidence is specific: identify the upstream elapsed-clock API/unit
and its configuration; validate real waiting at each source speed against a
timed legitimate capture; verify sprite pixels against the matching archive;
and confirm semantic labels only where the original UI/manual supports them.
The trial ended2026-10-14; do not restart/bypass it for new observations.
This completes the numeric correspondence/unit/limit audit, not human #97/#16
acceptance or proof of every original runtime detail.

Follow-up: [equipment evidence](equipment-evidence.md) links the12999-cent
hardware pointer to the conditional15-step bonus. This narrows the earlier
object-identity uncertainty without establishing real seconds or a live test.
