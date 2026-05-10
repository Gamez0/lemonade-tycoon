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

### UI containers

`src/ui/` containers extend `Phaser.GameObjects.Container`. They subscribe to model events in their constructors and must unsubscribe in a shutdown handler:

```ts
scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    model.off("eventName", handler, this);
});
```

Containers that have this correctly: `BudgetContainer`, `PerformanceContainer`, `MapContainer`.  
Containers missing shutdown cleanup: `GameControlContainer`, `MarketingContainer`, `RecipeContainer` (uses `.off()` without callback).

### DayScene simulation

Time runs for 12 real-world seconds = 12 game hours (8:00–20:00). `timerEvent` tracks elapsed time; current game hour is computed as:

```ts
Math.floor(timerEvent.getElapsed() / 1000 / 6) + 8
```

Four `TimerEvent`s drive the simulation loop — none are cleaned up on shutdown (known bug).

Customer lifecycle: `getCustomerList()` pre-generates customers by hour → `customerEnterTheMap()` spawns sprites following Tiled polyline paths → `checkLemonadeStand()` decides whether to enqueue → `sellLemonade()` dequeues and sells → `customerLeaveTheMap()` plays exit animation.

Customer sprites are created in `followEnterPath`/`followExitPath` and destroyed via tween `onComplete`. A known floating sprite bug exists in `makeCustomerListByTime` (see `// FIX ME` comment at day-scene.ts:407).

### Tilemap

Map is loaded from `assets/tiles/park.json` (Tiled JSON). NPC paths are stored as Tiled object layers: `"Npc Enter Path"` and `"Npc Exit Path"`. Each path object has a `polyline` and an `initDirection` property. `MapContainer.loadMap()` renders 3 tile layers at absolute position (516, 198) — not relative to the container.

### Known stubs (not yet implemented)

- `StaffContainer` — title only, no functionality
- `UpgradesContainer` — title only, no functionality  
- `MarketingContainer` — advertising buttons exist but have no event handlers
- Weather is always `"sunny"` (hardcoded in `PreparationScene.getWeatherForecast`)
- Customer decision logic has several TODOs (popularity, time of day, weather effects)

### Tab system (PreparationScene)

`GameControlContainer` holds all tabs. Tab indices: 0=Results, 1=Rent, 2=Upgrades, 3=Staff, 4=Marketing, 5=Recipe, 6=BuySupplies. `PreparationTabContainer` emits `"tabSelected"` → `GameControlContainer.onTabSelected()` toggles visibility.

### Locations

3 locations defined in `src/data/locations.ts`: Suburbs (free), Park ($10/day), Downtown ($30/day). `RentedLocation` tracks current key + per-location popularity/satisfaction arrays.

### Recipe & flavor

`Recipe.getFlavor()` returns `"perfect" | "good" | "bad"` based on lemon:sugar ratio (ideal ratio = 2). Ice level (1–7) maps to cups-per-pitcher via `PITCHER_PER_ICE` constant. `costPerCup` auto-updates when recipe or supply average prices change.
