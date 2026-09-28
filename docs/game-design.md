# Playable MVP

You run a small neighborhood lemonade stand. Read the forecast, buy ingredients, tune the recipe and price, watch customers respond, review the day, then try a better plan tomorrow.

## First milestone acceptance

- A fresh launch offers a funded first day and a readable forecast.
- Choose lemon, sugar and ice units per cup, selling price and supply purchases with visible costs.
- Opening prevents further preparation edits. Customers visibly walk past or stop to buy.
- Demand responds to price, temperature, recipe quality and reputation from customer satisfaction, with reproducible random variation.
- Each sale consumes all recipe ingredients plus one cup, debits no extra cash, and adds exactly one price to cash/revenue. Insufficient stock never becomes negative.
- A finite day ends automatically and displays revenue, consumed stock cost, profit, purchase spending, cash change, sales, missed customers and satisfaction (no buyers = no rating).
- Next day retains cash/stock/reputation, increments the day exactly once and refreshes weather. At least three successive days work without accumulating timers/listeners/results.
- A restart path handles an unaffordable plan or depleted business. Restart is deliberate, never automatic.
- Desktop and narrow screens retain usable controls. No missing assets or uncaught browser errors on the tested loop.

## Initial rules

Start with $40 and empty supplies. Default recipe is 2 lemon units, 1 sugar unit and 2 ice cubes per cup; use small recipe units, not literal whole lemons. More heat favors ice. Balance lemon/sugar around 2:1. Price, quality, weather and reputation affect willingness to buy; customers have differing budgets. New forecast each day, neutral initial reputation, smoother reputation changes than a single review.

First goal: reach $75 cash. Continue after reaching it; compare daily profit and experiment with margin versus volume. No forced campaign ending. It is possible to lose money: preserve visibility of ingredient costs and provide New business.

## Deliberate scope limits

One free suburban location, one service point, no staff, upgrades, ads, rent, melting, storage or purchased commercial art. Supplies carry over; prepared pitcher wastage is deferred. Recipe is per cup to make costs transparent; this is an MVP simplification from the old pitcher model. Original Lemonade Tycoon remains the visual anchor.
