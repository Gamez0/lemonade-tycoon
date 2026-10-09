# Playable MVP

You run a small neighborhood lemonade stand. Read the forecast, buy ingredients, tune the recipe and price, watch customers respond, review the day, then try a better plan tomorrow.

## First milestone acceptance

- A fresh launch offers a funded first day and a readable forecast.
- Choose lemon and sugar per pitcher, ice per cup, selling price and supply purchases with visible costs.
- Opening prevents further preparation edits. Customers visibly walk past or stop to buy.
- Demand responds to price, temperature, recipe quality and reputation from customer satisfaction, with reproducible random variation.
- A new pitcher consumes its lemon, sugar and all ice for its yield. Each sale consumes one prepared cup and one paper cup, then adds exactly one price to cash/revenue. Insufficient stock never becomes negative.
- Prepare the first pitcher at opening. During selling, refill immediately when its last cup sells, if ingredients and paper cups remain. Do not refill after the final visit closes the day. Unsold prepared lemonade is still an ingredient expense. Save v6 checkpoints retain the prepared pitcher and fixed recipe, preventing duplicate production on replay; older histories retain their original accounting.
- A finite day ends automatically and displays revenue, consumed stock cost, profit, purchase spending, cash change, sales, missed customers and satisfaction (no buyers = no rating).
- Next day retains cash/stock/reputation, increments the day exactly once and refreshes weather. At least three successive days work without accumulating timers/listeners/results.
- A restart path handles an unaffordable plan or depleted business. Restart is deliberate, never automatic.
- Desktop and narrow screens retain usable controls. No missing assets or uncaught browser errors on the tested loop.

## Initial rules

Start with $40 and empty supplies. Default recipe is 2 lemon units and 1 sugar unit per pitcher, with 2 ice cubes per cup; use small recipe units, not literal whole lemons. The ice setting determines pitcher yield (10–33 cups). More heat favors ice. Balance lemon/sugar around 2:1. Price, quality, weather and reputation affect willingness to buy; customers have differing budgets. New forecast each day, neutral initial reputation, smoother reputation changes than a single review.

First goal: reach $75 cash. Continue after reaching it; compare daily profit and experiment with margin versus volume. No forced campaign ending. It is possible to lose money: preserve visibility of ingredient costs and provide New business.

## Initial MVP scope limits

One free suburban location, one service point, no staff, upgrades, ads, rent or purchased commercial art. Unused prepared cups are discarded when the day ends. Leftover ice melts before the next day; lemon, sugar and cup stock carries over. A future refrigerator or ice maker will change the ice economy. Original Lemonade Tycoon remains the visual anchor.

## M5 expansion

Three locations now offer distinct traffic, budgets and patience. Rent provides
permanent unlocks, browsing and explicit reservation/cancellation. Start day charges
the visible rent and move-in fee once; interruption resumes the paid opening checkpoint.
Returning to the Neighborhood is free. Satisfaction and popularity belong to each
location, with feedback only from completed sales. Bankruptcy keeps the save and
offers export or a deliberate restart. See [M5 design](research/m5-locations-design.md)
and [implementation review](reviews/m5-locations.md). Staff/upgrades/ads remain M6.

## M6 ice-maker recovery

Per user instruction on 2026-10-09, purchased ice makers produce free ice at opening,
limited only by equipment output and free stock space. There is no electricity or
per-unit production charge. Buying ice in Supplies still costs $0.02 per unit.
Opening costs use the same calculation in the interface and simulation. Paid
checkpoints preserve the actual production; replay never produces ice again.
Existing saved purchase costs and historical books are preserved without refunds.
Free ice is consumed before purchased ice and contributes no ingredient expense.
Refrigeration retains its zero cost basis. The per-cup hint estimates the next
pitcher using available free ice, including the next opening's production.

Design guidance: use the original game's business flow and deliberate simplifications
as the starting point. Do not add realistic overheads or restrictions solely because
they exist in real life. Distinguish user-directed rules and this project's balance
values from verified original behavior.
