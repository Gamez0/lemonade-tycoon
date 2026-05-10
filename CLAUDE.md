# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Dev server at localhost:8080 (with logging via log.js)
yarn dev-nolog    # Dev server without logging
yarn build        # Production build
yarn lint:fix     # Auto-fix lint issues (ESLint + Prettier)
```

No test suite exists yet.

## Architecture

**Phaser 3 + TypeScript game.** Canvas size is 1024×768. Entry point: `src/main.ts`.

### Scene flow

Scenes are NOT registered statically — `DayScene` and `PreparationScene` are instantiated dynamically with unique keys (e.g. `day-2025-07-01`, `preparation-2025-07-02`) so game state can be passed between them via `scene.add(..., true, data)`. After transitioning, the old scene is explicitly shut down and removed:

```ts
this.scene.get(this.scene.key).sys.shutdown();
this.scene.stop(this.scene.key);
this.scene.remove(this.scene.key);
```

Flow: `Boot → Preloader → MainMenu → PreparationScene ↔ DayScene → GameOver`

`GameOver` scene exists but is never reached in the current game flow.

### Data flow between scenes

Game state (budget, supplies, recipe, etc.) is passed as plain objects via `init(data)` on the receiving scene. The interfaces `GameDataFromPreparationScene` and `GameDataFromDayScene` (defined in `preparation-scene.ts`) describe what each scene hands off.

### Models

All models in `src/models/` extend `Phaser.Events.EventEmitter` and use getters/setters that emit events on mutation. UI components subscribe to these events to stay in sync. Pattern:

```ts
set amount(value: number) {
    this._amount = value;
    this.emit("change", this._amount);
}
```

Models: `Budget`, `Supplies`, `Recipe`, `Customer`, `CustomerQueue`, `RentedLocation`, `Price`, `Result`, `Reviews`, `LemonadePitcher`, `_Date`.

Note: all 4 `Supplies` average price setters emit the same `"averagePriceChanged"` event — listeners cannot distinguish which price changed.

### UI containers

`src/ui/` containers extend `Phaser.GameObjects.Container`. They subscribe to model events in their constructors and must unsubscribe in a shutdown handler:

```ts
scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    model.off("eventName", handler, this);
});
```

**Has proper shutdown cleanup:** `BudgetContainer`, `PerformanceContainer`, `MapContainer`, `SupplyStatusContainer`, `RecipeContainer`

**Missing shutdown cleanup:** `GameControlContainer`, `MarketingContainer`

### DayScene simulation

Time runs for 72 real seconds = 12 game hours (8:00–20:00). `timerEvent` tracks elapsed time; current game hour is computed as:

```ts
Math.floor(timerEvent.getElapsed() / 1000 / 6) + 8
```

Four `TimerEvent`s drive the simulation loop (none cleaned up on shutdown — known bug):
- `timerEvent` — 72s day end trigger
- `enterIntervalDuration` — customer arrival tick (1s)
- `queueIntervalDuration` — patience decay tick (1s)
- `sellIntervalDuration` — lemonade sale tick (1s)

Customer lifecycle: `getCustomerList()` pre-generates customers by hour → `customerEnterTheMap()` spawns sprites following Tiled polyline paths → `checkLemonadeStand()` decides whether to enqueue → `sellLemonade()` dequeues and sells → `customerLeaveTheMap()` plays exit animation.

Customer queue max length is 5 (hardcoded in `CustomerQueue` constructor default and checked in `checkLemonadeStand`).

### Customer decision logic (`checkLemonadeStand`)

Order of checks:
1. If supplies empty AND pitcher empty → leave
2. If `price.amount > (2 ± 20% random)` → leave with bad review
3. If queue length >= 5 → leave with bad review
4. Roll `enQueuePoint = random(0–100) + weatherBonus` — if > 50, join queue

Weather bonus: +30 if very hot (>30°C), +15 if hot (>25°C), -15 if cold (<20°C).

Missing (TODO): popularity bonus, time-of-day effects.

### Recipe & flavor

`Recipe.getFlavor()` returns `"perfect" | "good" | "bad"`:
- `"perfect"`: ratio === 2 AND sugar >= 3
- `"good"`: ratio 1.5–2.5 AND lemon >= 2 AND sugar >= 1
- `"bad"`: everything else

Ice level (1–7) maps to cups-per-pitcher via `PITCHER_PER_ICE = [10,11,12,14,16,20,25,33]` (index = ice value).

`costPerCup` auto-updates when recipe or supply average prices change.

### Tilemap

Map loaded from `assets/tiles/park.json` (Tiled JSON). NPC paths are Tiled object layers: `"Npc Enter Path"` and `"Npc Exit Path"`. Each path object has a `polyline` and an `initDirection` property. `MapContainer.loadMap()` renders 3 tile layers at absolute position (516, 198) — not relative to the container.

### Tab system (PreparationScene)

`GameControlContainer` owns all tabs. Tab indices (numeric — `GameControlTab` enum exists in `src/enums/game-control-tab.ts` but is unused):

| Index | Tab |
|-------|-----|
| 0 | Results |
| 1 | Rent |
| 2 | Upgrades |
| 3 | Staff |
| 4 | Marketing |
| 5 | Recipe |
| 6 | BuySupplies |

### Supply purchase pricing (hardcoded in `buy-items.ts`)

| Item | Bundle options (price / amount) |
|------|--------------------------------|
| Lemons | $4.80/12, $7.20/24, $9.60/48 |
| Sugar | $4.80/12, $7.00/24, $15.00/48 |
| Ice | $1.00/50, $3.00/200, $5.00/500 |
| Cups | $1.00/75, $2.35/225, $3.75/400 |

### Locations

3 locations in `src/data/locations.ts`: Suburbs (free), Park ($10/day), Downtown ($30/day). `RentedLocation` tracks current key + per-location popularity/satisfaction arrays (5 slots each, only 3 used).

### BGM state

BGM pause state persisted via `this.registry` (`"bgmPaused"` key) so it survives scene transitions. Only managed in `PreparationScene.loadBgm()`.

## Known bugs

| Location | Issue |
|----------|-------|
| `recipe.ts:30` | `this.off("shutdown", ...)` in constructor with no prior `on()` — dead call, should be deleted |
| `day-scene.ts:189–219` | 4 TimerEvents never cleaned up on shutdown → leak on repeated play |
| `location-carousel-with-rent-button.ts:126` | `updateRentButton()` calls `this.rentButton.destroy()` then `this.add(new TextButton(...))` without removing the old entry from the container's children list first — destroyed button references accumulate |
| `text-button.ts:52` | Method named `destory()` (typo for `destroy()`) — never called externally, harmless but misleading |
| `customerQueue.ts:32` | Method named `peak()` — should be `peek()` |

## Known stubs (not yet implemented)

- `StaffContainer` — title only
- `UpgradesContainer` — title only
- `ResultsContainer` — title only (has array of 4 title variants but always shows index 0)
- `MarketingContainer` — advertising +/- buttons exist with no event handlers
- Weather always `"sunny"` (hardcoded in `PreparationScene.getWeatherForecast`)
- News text hardcoded in `PreparationScene.getNews()`
- `GameControlTab` enum defined but never used — tab switching uses raw numbers
- Popularity/satisfaction tracked in `RentedLocation` but never written or factored into customer decisions
