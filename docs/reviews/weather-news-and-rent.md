# Weather, location and news

The user requested a meaningful decision: hot days need more ice, cold days
less, and an outdoor park in rain should have very few customers. Previously
global weather traffic scaled every location alike and news was decorative.

The recovered recipe calculation is retained. Six lemon / three sugar with
zero ice scores 50 at 32 C and 100 at 18 C. Two ice restore 100 at 32 C;
40 C needs three ice. Excess ice also dilutes the recipe.

Retained original 1.1.6 analysis identifies location weather/temperature tables
and news adjustments around 0x403df2. Mall's getter at 0x40429b returns 20 C.
Park weather penalties are [10,10,10,20,30,40], Beach [0,0,0,30,40,60], Mall
[40,30,20,10,0,0]. The six weather-code names are not completely mapped;
no particular column is claimed as Rainy. Original intraday arrival periods
are not implemented here. No original art or news text is shipped.

Rain visitor multipliers: Neighborhood .45, Park .08, Downtown .65, Beach .05,
Old Square .25, Station .8, Mall 1.4, Marina .2, Stadium .85, Magic Gardens .1.
Sunny Mall uses .8 and indoor baseline40. These are explicit product tuning,
not recovered original constants. Minimum one visitor preserves the existing
simulation contract. Price, supplies and service still determine purchases.

Mall uses indoor20 C for advice, display and taste and hides outdoor rain.
Nine authored daily news events affect their named locations. Headlines,
expected traffic and Rent previews expose the decision before opening.

Paid days freeze conditions/news/traffic. Schema10 and alpha15 protect the new
model from older binaries; older paid days without conditions keep the old
calculation. The real version6 fixture still checks exact paid-day replay.
Browsing does not consume RNG or charge rent.

Rent replaces its horizontal scrollbar with Previous/Next buttons, counter
and keyboard arrows. All ten locations remain accessible at1280/800/640/375px.

Verification includes98 model/storage cases, browser actual rainy Park/Mall
days and native Windows taste/weather/Rent/reload checks. Exact-head CI and
native evidence are recorded in the PR before integration. Human acceptance
and beta acceptance remain open gates.
