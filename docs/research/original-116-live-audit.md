# Original 1.1.6 live audit — 2026-10-13

Session ended on 2026-10-14 KST when the trial expired. The user paused work for
the day. This record is the primary original-game evidence for the next session.

Primary evidence: the user's original executable, its bundled manual/help,
legitimate Try Now session, TEST save, and read-only inspection of the loaded
program. Private captures and memory artifacts stay in ignored `.local-m4`.
No licensing changes or original assets are included in the product.

## Observed taste trials

All three days used Suburbs, $1.00 price and no advertising. These are successive
days, not a seeded controlled replay; reputation and weather can change.

| Day | Actual temperature | Lemon / sugar / ice | Sales | Reported satisfaction | Notes |
|---|---|---|---|---|---|
| 8 | 34°C | 14 / 3 / 0 | 18 | 5% | Recipe complaints; 3 missed sales |
| 9 | 40°C | 6 / 3 / 3 | 20 | 100% | No missed sales; 140 ice melted |
| 10 | 40°C | 2 / 1 / 3 | 17 | 52% | Recipe complaints; no missed sales; 149 ice melted |

Day 8's recipe was accidentally set to 14 lemons after misreading the initial
digit. The actual displayed value was checked before interpreting the result.
The latter two trials demonstrate that the 2:1 ratio alone is insufficient.

## Recovered taste model (interpretation, pending further UI checks)

The customer evaluates taste after purchase. The inspected taste routine starts
with a score of 100 and tests warmth, concentration, then sugar/lemon balance.
With I ice, S sugar, L lemon, and actual temperature T:

- Warmth: T > 5*(I+4)+5 sets the score to 50.
- Let A = trunc(10000/(100-10*I)). The concentration target is
  trunc(4*A/10) + 2*trunc(2*A/10).
- If target - 10*(2*S+L) > 20, subtract 60 for weak concentration.
- Otherwise, if 2*S-L > 1, subtract 40; if 2*S-L < -1, subtract 50.
- An inclusive integer random draw from 0 through 100 determines complaints.
  Its modulo implementation has small bias, so the score is not an exact
  mathematical percentage.

No direct excessive-coldness test was found in this routine. Excess ice raises
the concentration requirement instead. Complaint flag labels still require
checking clickable reaction bubbles. Daily overall satisfaction also accounts
for other customer outcomes; it must not be equated with this taste score.

Private analysis references: taste 0x40218a, recipe getter 0x404272, current
temperature 0x40429b, price 0x4042dd, inclusive random helper 0x42e8b0.

## Customer stages

The purchase decision uses customer-specific price and temperature preferences.
Taste is evaluated later. Queue patience is initialized from the customer
profile, modified by equipment/staff and some weather conditions, then counted
down while waiting. The original has more customer profiles than our three.
The decoded profile table contains base patience values 35–100; these are
engine counters, not yet verified seconds. Their identities and map weights
remain to be mapped.

## Locations

| Location | Daily rent | Directly observed distinction |
|---|---:|---|
| Suburbs | 0 | Low traffic; free place to test a recipe |
| Park | 10 | Children; actual full scene captured |
| Downtown | 30 | Wealthier customers and busy businesspeople |
| Train Station | 30 | Commuters/tourists; people in a hurry |
| Beach | 40 | Hot, sunny days attract customers |
| Mall | 50 | Interior location; cold/rain better, hot/sun worse |
| Marina | 50 | Rich customers; full scene captured |
| Old Square | 100 | Tourists willing to pay high prices; visibility matters |
| Magic Gardens | 100 | Large but unpredictable crowds |
| Hexa-Stad | 150 | Later earned enough cash and captured the full stadium scene |

Rent confirmation is per day; switching among affordable locations during
preparation did not deduct immediate cash. Do not treat carousel thumbnails as
full-map observation. The first attempted survey was blocked by a confirmation;
the successful second survey captured actual map changes.

## Economy and presentation

- Ice purchase offers 50/$1, 200/$3, 500/$5: bulk discounts.
- All supplies except cups are perishable (bundled help).
- Forecast has multiple periods and actual temperatures; it is not one fixed
  weather label for a whole day. News introduces location-related events.
- Reports include daily totals, history graphs, ledger and stock details.
- SKIP completes a day and immediately advances the preparation header to the
  next day while showing yesterday's results. Fast-forward is separate.
- Equipment and staff use illustrated carousels, with substantially more
  choices than the current remake.

Further work: identify all customer profiles/map mixtures, inspect reaction
bubble text, measure animation states and speed settings, catalogue upgrades,
staff and marketing, test cold-weather concentration, and compare production
and queue behavior across maps. This audit does not claim complete parity.

## Decoded customer mixtures

Read-only table inspection identified 10 valid location distributions, each
containing 11 profile pointers and weights summing to 100. Location identities
match rent, known Mall pointer and the displayed location order. Profile names
below remain anonymous until their sprite identities are verified.

| Profile | Base patience | Preferred price (cents) | Maximum price (cents) |
|---|---:|---:|---:|
| P1 | 35 | 200 | 400 |
| P2 | 50 | 150 | 300 |
| P3 | 60 | 100 | 210 |
| P4 | 70 | 150 | 300 |
| P5 | 50 | 150 | 350 |
| P6 | 100 | 75 | 150 |
| P7 | 70 | 120 | 250 |
| P8 | 70 | 100 | 250 |
| P9 | 70 | 120 | 250 |
| P10 | 100 | 100 | 150 |
| P11 | 70 | 120 | 250 |

| Location | P1–P11 weights (%) |
|---|---|
| Suburbs | 5, 5, 25, 5, 5, 35, 10, 10, 0, 0, 0 |
| Park | 5, 0, 10, 20, 10, 40, 10, 5, 0, 0, 0 |
| Downtown | 25, 15, 15, 15, 15, 5, 5, 5, 0, 0, 0 |
| Train Station | 40, 40, 5, 5, 5, 5, 0, 0, 0, 0, 0 |
| Beach | 0, 0, 10, 0, 0, 10, 15, 15, 10, 15, 25 |
| Mall | 5, 5, 15, 30, 20, 15, 5, 5, 0, 0, 0 |
| Marina | 25, 15, 15, 15, 15, 5, 5, 5, 0, 0, 0 |
| Old Square | 15, 15, 10, 10, 10, 10, 15, 15, 0, 0, 0 |
| Magic Gardens | 10, 10, 10, 10, 10, 10, 10, 10, 0, 10, 10 |
| Hexa-Stad | 12, 12, 12, 12, 12, 16, 12, 12, 0, 0, 0 |

## Equipment and staff catalogue

Direct UI survey captured 13 equipment cards. Prices are purchase prices;
the brief effects are paraphrases of the original UI, not measured multipliers.

| Equipment | Price | Intended effect |
|---|---:|---|
| High Output Citrus Juicer | 49.99 | Faster pitcher refill |
| ShadeMaker 3000 Canopy | 129.99 | Customer cooling |
| Miracle 9000 Power Juicer | 149.99 | Faster pitcher refill |
| EZserve Cash Register | 249.99 | Faster serving |
| Mr. Fridge | 249.99 | Prevent lemon spoilage |
| Ice-O-Matic Ice Dispenser | 399.99 | Avoid repeated ice purchases |
| Classic Stand | 449.99 | Stand upgrade |
| HighFive Sound System | 799.99 | Music/attraction |
| Lemon Stand | 999.99 | Stand upgrade |
| Bright Lights Neon System | 1249.99 | Visibility/attraction |
| Take2 Lemonade Dispenser | 1599.99 | Faster serving and refill |
| High Output Automatic Icemaker | 2599.99 | Ice production; advanced stands required |
| Castle Stand | 9999.99 | Highest stand upgrade |

Staff has two cards: Martine the Cashier, 60/day (serving help), and Simon the
Lemon, 80/day (queue happiness). The carousel ends after Simon; repeated next
clicks do not reveal more staff. These are daily wages, not purchase costs.

Additional live animation trial (Day 11): 6/3/3, 40°C at opening, ten cups sold
before cups ran out; reported satisfaction 62%. This is deliberately excluded
from recipe comparisons because stock-outs affect the overall report. Rain
started during the same day. Day 12 at 2/1/0 sold 19 cups, satisfaction 0%, no
missed sales. Poor taste does not prevent the initial purchases.

## Indoor cold/dilution check and satisfaction denominator

The Mall live UI displays 20°C even when the external forecast is much hotter;
the temperature getter explicitly returns 20 for this location.

- Day 18, Mall, 6/3/0: 53 sales; report 63%, stock-out, no recipe-complaint
  advice. Stock-outs make this unsuitable as a pure taste-score comparison.
- Day 19, Mall, 6/3/5: 40 sales; report 21%, stock-out. Read-only inspection of
  the completed TEST daily record gives 22 dissatisfied buyers and 42
  stock-out outcomes, with no queue/price missed sales. Thus buyer taste
  satisfaction is 18/40 = 45%, while the report is trunc(1800/82) = 21%.
  This matches the recovered diluted-recipe score of 40 within sample noise.

The report formula is happy buyers / (buyers + queue/price missed customers +
stock-out customers). It reports zero if no purchases occurred. A flavor score,
buyer happiness rate and overall daily satisfaction are distinct quantities.
The private code-state cross-check identified the active TEST world in the
loaded image and verified recipe order as ice, sugar, lemon (5, 3, 6), with
price 100 cents. No memory modification was used.

## Recipe boundaries and ice consumption

Verified both by the live controls and their bound checks: lemon 0–20, sugar
0–10, ice 0–7. The live maximum 20/10/7 shows 33 cups per pitcher; the minimum
0/0/0 shows 10 cups. The remake's current 1–6 lemons/1–4 sugar limits are a
material difference, not the original limits.

Ice is consumed per sold cup in the original: the live Mall opening at 6/3/5
shows 200 ice remaining while its first 20-cup pitcher is already prepared.
40 sales consume precisely 200 ice. Lemons and sugar are consumed when a
pitcher is prepared. The remake currently reserves the entire batch's ice at
pitcher preparation; this should be separately corrected with legacy paid-day
replay protection. Ice quantity affects pitcher yield, but that does not imply
ice is charged for all unsold cups immediately.

All 13 equipment descriptions, both staff descriptions and all 10 location
descriptions have now been captured using a dialog-close routine that finds the
OK button on each image. Its height varies with the text. Failed earlier fixed
coordinate batches are not counted as completed surveys. The inexpensive
49.99 juicer was purchased in TEST, confirmed by the 49.99 cash deduction and
the disabled purchase button. Advanced equipment effects remain description-
and code-based evidence, not claims of purchased live testing.
