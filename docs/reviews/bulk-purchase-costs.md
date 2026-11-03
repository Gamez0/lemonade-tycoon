# Bulk packs and acquisition costs — #284

Retained original UI evidence and the
[player comparison](https://github.com/Gamez0/lemonade-tycoon/blob/5959868/docs/reviews/player-session-20261102.md)
establish these quotes:

| Item | Small pack | Medium pack | Large pack |
| --- | --- | --- | --- |
| Ice | 50 for $1.00 | 200 for $3.00 | 500 for $5.00 |
| Cups | 75 for $1.00 | 225 for $2.35 | 400 for $3.75 |

These are pack prices, not a single unit price or evidence for original storage
limits. Lemon/sugar pack pricing and the product's 999-unit storage limit remain
unchanged by this task. See the [existing equipment evidence](../research/equipment-evidence.md)
for the separate limitations on capacity and equipment coefficients.

Adopt only in fresh unpaid preparation. Existing paid v6–v12 openings retain
their old packs, purchase prices, production costs and replay. Save schema13
can hold old historical states without the new cost pool. No decode operation
reprices stock or adopts a rule. Fresh unpaid UI preparation explicitly adopts
the new model, valuing already owned paid stock at its existing nominal cost.
An older accepted document whose current stock cannot cover its recorded daily
purchases retains its old rules until the next unpaid day; no negative opening
cost basis or invented historical purchase is introduced.
New company documents carry the new model before the company-transfer journal
is written. Legacy adoption waits while that journal is pending or recovery is
blocked, so a close cannot alter its committed primary before cleanup completes.

Each item has an integer-cent remaining acquisition-cost pool. A purchase adds
its exact quoted pack total. Consuming paid units removes the rounded
proportional share of the current pool; consuming the last unit removes all
remaining cents. Generated ice has zero value and is consumed first. This is a
deterministic moving-average allocation with cent rounding, not a guessed
original costing implementation. Within a day, remaining value plus production
cost must equal opening inventory value plus purchases. Overnight ice retention
removes the corresponding share of paid ice value before the next opening.

The balance sheet uses remaining acquisition value. Recipe previews use the
current weighted paid-unit estimate; transaction costs and daily reports use
integer allocated cents. Historical ledgers keep their existing formula.

Verification must cover every quoted pack, combined/multiple packs, storage and
cash rejection without mutation, mixed acquisition prices, zero-cost generated
ice, partial/full retention, save/reload, forged pools, and actual v6–v12 paid
fixtures. Current-head browser/native CI is required before integration.
