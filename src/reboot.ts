import Phaser from "phaser";
import { ITEMS, ITEM_KEYS } from "./game/content/catalog";
import type { Item } from "./game/content/catalog";
import {
    buy,
    capacity,
    newGame,
    nextDay,
    openDay,
    quality,
    results,
    setPlan,
    stepCustomer,
    unitCost,
} from "./game/simulation/game";
import type { State } from "./game/simulation/game";
import { StreetScene } from "./game/presentation/street-scene";
import "./game/presentation/style.css";

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
let state = newGame();
let lastFeedback = "Your first customers are just around the corner.";
let restartArmed = false;
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
    <header class="masthead"><div><span class="eyebrow">A LITTLE STAND. A BIG SUMMER.</span><h1>Lemonade <span>Tycoon</span></h1></div><span class="edition">REBOOT / EARLY ACCESS</span></header>
    <section class="ledger" aria-label="Business overview">
        <div><span class="label">DAY</span><strong id="day">01</strong></div>
        <div><span class="label">CASH ON HAND</span><strong id="cash"></strong></div>
        <div><span class="label">TODAY'S FORECAST</span><strong id="weather"></strong></div>
        <div><span class="label">REPUTATION</span><strong id="reputation"></strong></div>
    </section>
    <main class="layout">
      <section class="panel preparation" aria-labelledby="panel-title">
        <div class="panel-heading"><span class="step" id="phase-number">01</span><div><span class="eyebrow" id="phase-label">BEFORE THE RUSH</span><h2 id="panel-title">Make it your own.</h2></div></div>
        <div id="preparation">
          <p class="intro">Check the weather. Mix a recipe. Stock up for the neighbors.</p>
          <fieldset id="recipe-controls"><legend>01 / YOUR RECIPE <small>per cup</small></legend>
            <label>Lemon units <input id="lemon" type="number" min="1" max="6" step="1" value="2"></label>
            <label>Sugar scoops <input id="sugar" type="number" min="1" max="4" step="1" value="1"></label>
            <label>Ice cubes <input id="ice" type="number" min="0" max="6" step="1" value="2"></label>
          </fieldset>
          <p class="hint" id="recipe-hint"></p>
          <fieldset id="price-controls"><legend>02 / SET YOUR PRICE</legend><label>Price per cup ($) <input id="price" type="number" min="0.25" max="5" step="0.01" value="1.50"></label></fieldset>
          <div class="cost-line"><span>Ingredients / cup</span><strong id="unit-cost"></strong></div>
          <fieldset id="supply-controls"><legend>03 / STOCK THE STAND</legend><div id="supplies"></div></fieldset>
          <div class="capacity"><span>Ready to serve</span><strong id="capacity"></strong></div>
          <button id="open" class="primary">Open for the day <span>→</span></button>
        </div>
        <div id="selling" hidden><p class="intro">The stand is open. Watch what your neighbors think!</p><div class="sale-summary" id="sale-summary"></div><p class="hint">Today's recipe and price are locked until closing.</p><button id="speed" class="secondary">Speed: 1×</button></div>
        <div id="results" hidden><p class="intro" id="result-intro"></p><dl id="result-values"></dl><p class="hint">Profit counts ingredients used. Cash change also includes all supplies bought. Leftovers carry over.</p><button id="next" class="primary">Prepare next day <span>→</span></button></div>
        <p id="message" role="status" aria-live="polite"></p>
      </section>
      <section class="world-column" aria-label="Willow Lane stand">
        <div class="world-frame"><div class="location-heading"><div><span class="eyebrow">THE NEIGHBORHOOD</span><h2>Willow Lane</h2></div><span class="rent-tag">FREE RENT</span></div><div id="game-container"></div>
          <div class="world-caption"><span id="world-status">A fresh start on a familiar street.</span><span id="progress-text">Ready when you are</span></div><progress id="day-progress" max="1" value="0" aria-label="Day progress"></progress></div>
        <section class="daily-strip" aria-label="Today's performance"><div><span class="label">CUPS SOLD</span><strong id="sold">0</strong></div><div><span class="label">REVENUE</span><strong id="revenue">$0.00</strong></div><div><span class="label">PROFIT</span><strong id="profit">$0.00</strong></div></section>
        <section class="notebook"><span class="eyebrow">NOTES FROM THE COUNTER</span><p id="feedback" aria-live="off"></p><p id="goal"></p><p class="hint">Try two lemon units for each scoop of sugar. Hot days call for more ice. Higher prices earn more per cup, but can turn customers away.</p></section>
      </section>
    </main><footer><span>A neighborhood business, one day at a time. <small>Progress lasts for this session.</small></span><button id="restart" class="text-button">New business</button><a href="./legacy.html">Legacy reference</a></footer>`;

function element<T extends HTMLElement = HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
}
function text(id: string, value: string): void {
    element(id).textContent = value;
}
for (const item of ITEM_KEYS) {
    const row = document.createElement("div");
    row.className = "supply-row";
    row.innerHTML = `<span>${ITEMS[item].name}<small id="stock-${item}"></small></span><button class="supply-button" data-item="${item}">+${ITEMS[item].bundle} <small>${money(ITEMS[item].cost * ITEMS[item].bundle)}</small></button>`;
    element("supplies").append(row);
}
const scene = new StreetScene({
    state: () => state,
    profile: () => stepCustomer(state).event.profile,
    arrive: () => {
        const step = stepCustomer(state);
        state = step.state;
        lastFeedback =
            step.event.kind === "bought"
                ? `Sold! Customer satisfaction: ${step.event.satisfaction}%.`
                : step.event.kind === "price"
                  ? "A neighbor passed: the price was too high."
                  : step.event.kind === "sold-out"
                    ? "Missed a customer: not enough supplies for this recipe."
                    : "A passerby wasn't thirsty enough. Try price, recipe or tomorrow's weather.";
        return step.event;
    },
    changed: render,
});
new Phaser.Game({
    type: Phaser.CANVAS,
    width: 640,
    height: 440,
    parent: "game-container",
    backgroundColor: "#9bc77e",
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [scene],
    audio: { noAudio: true },
});

function act(action: () => State): void {
    try {
        state = action();
        text("message", "");
        render();
    } catch (error) {
        text("message", error instanceof Error ? error.message : "Please check your choices.");
    }
}
function readPlan(): State {
    for (const id of ["lemon", "sugar", "ice", "price"]) {
        const input = element<HTMLInputElement>(id);
        if (input.value === "" || !input.checkValidity()) {
            input.setAttribute("aria-invalid", "true");
            throw new Error(`Check ${id}: enter a value from ${input.min} to ${input.max} in steps of ${input.step}.`);
        }
        input.removeAttribute("aria-invalid");
    }
    const price = Number(element<HTMLInputElement>("price").value) * 100;
    return setPlan(state, {
        price: Math.round(price),
        recipe: {
            lemon: Number(element<HTMLInputElement>("lemon").value),
            sugar: Number(element<HTMLInputElement>("sugar").value),
            ice: Number(element<HTMLInputElement>("ice").value),
        },
    });
}
for (const id of ["lemon", "sugar", "ice", "price"]) element(id).addEventListener("change", () => act(readPlan));
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-item]")) {
    button.addEventListener("click", () => {
        const item = button.dataset.item as Item;
        act(() => buy(readPlan(), item, ITEMS[item].bundle));
    });
}
element("open").addEventListener("click", () =>
    act(() => {
        const opened = openDay(readPlan());
        scene.resetDay();
        return opened;
    }),
);
let fast = false;
function resetPresentation(): void {
    scene.resetDay();
    fast = false;
    scene.setSpeed(1);
    text("speed", "Speed: 1×");
    restartArmed = false;
    text("restart", "New business");
    for (const key of ["lemon", "sugar", "ice"] as const)
        element<HTMLInputElement>(key).value = String(state.plan.recipe[key]);
    element<HTMLInputElement>("price").value = (state.plan.price / 100).toFixed(2);
    for (const input of document.querySelectorAll("input")) input.removeAttribute("aria-invalid");
}
element("speed").addEventListener("click", () => {
    fast = !fast;
    scene.setSpeed(fast ? 4 : 1);
    text("speed", `Speed: ${fast ? 4 : 1}×`);
});
element("next").addEventListener("click", () => {
    if (scene.finishing) return;
    act(() => {
        const next = nextDay(state);
        resetPresentation();
        lastFeedback = "A new forecast, a new chance to improve.";
        return next;
    });
});
element("restart").addEventListener("click", () => {
    if (!restartArmed) {
        restartArmed = true;
        text("restart", "Confirm new business");
        return;
    }
    restartArmed = false;
    text("restart", "New business");
    scene.resetDay();
    lastFeedback = "Your first customers are just around the corner.";
    state = newGame();
    resetPresentation();
    act(() => state);
});
element("restart").addEventListener("blur", () => {
    restartArmed = false;
    text("restart", "New business");
});
element("restart").addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        restartArmed = false;
        text("restart", "New business");
    }
});

function render(): void {
    const report = results(state),
        prep = state.phase === "preparation",
        selling = state.phase === "selling";
    text("day", String(state.day).padStart(2, "0"));
    text("cash", money(state.cash));
    text("weather", `${state.weather.label} / ${state.weather.temperature}°C`);
    text("reputation", `${Math.round(state.reputation * 100)}%`);
    element("preparation").hidden = !prep;
    element("selling").hidden = !selling;
    element("results").hidden = state.phase !== "results";
    text("phase-number", prep ? "01" : selling ? "02" : "03");
    text("phase-label", prep ? "BEFORE THE RUSH" : selling ? "OPEN FOR BUSINESS" : "COUNTING THE DAY");
    text("panel-title", prep ? "Make it your own." : selling ? "Here come the neighbors." : "Every cup counts.");
    for (const id of ["recipe-controls", "price-controls", "supply-controls"])
        element<HTMLFieldSetElement>(id).disabled = !prep;
    element<HTMLButtonElement>("next").disabled = scene.finishing;
    for (const key of ITEM_KEYS) text(`stock-${key}`, `${state.stock[key]} in stock`);
    text("capacity", `${capacity(state)} cups`);
    text("unit-cost", money(unitCost(state.plan.recipe)));
    text(
        "recipe-hint",
        `Forecast fit: ${Math.round(quality(state.plan.recipe, state.weather.temperature) * 100)}%. ${state.weather.temperature >= 30 ? "It's hot — try 4 ice cubes." : state.weather.temperature >= 25 ? "Warm out — try 3 ice cubes." : state.weather.temperature >= 21 ? "Mild weather — try 2 ice cubes." : "Cool out — try 1 ice cube."}`,
    );
    text("sold", String(state.daily.sold));
    text("revenue", money(state.daily.revenue));
    text("profit", money(report.profit));
    text("feedback", lastFeedback);
    text(
        "goal",
        state.cash >= 7500
            ? "First goal reached: $75 in the till! Keep building your neighborhood business."
            : `Your first goal: $75 in the till. ${money(Math.max(0, 7500 - state.cash))} to go.`,
    );
    text(
        "world-status",
        prep
            ? "A fresh start on a familiar street."
            : selling
              ? "The stand is open. Come say hello!"
              : "Closed for today. See you tomorrow!",
    );
    text("progress-text", prep ? "Ready when you are" : `${state.daily.visitors} / ${state.weather.traffic} neighbors`);
    element<HTMLProgressElement>("day-progress").value = state.daily.visitors / state.weather.traffic;
    text(
        "sale-summary",
        `${money(state.plan.price)} / cup · ${capacity(state)} cups left\nRecipe: ${state.plan.recipe.lemon} lemon / ${state.plan.recipe.sugar} sugar / ${state.plan.recipe.ice} ice\nStock: ${state.stock.lemon} lemon · ${state.stock.sugar} sugar · ${state.stock.ice} ice · ${state.stock.cup} cups`,
    );
    if (state.phase === "results") {
        text(
            "result-intro",
            state.daily.sold === 0
                ? "No sales today. Try a lower price tomorrow."
                : `You served ${state.daily.sold} neighbors. ${report.profit > 0 ? "A little business is growing." : "Try a better margin tomorrow."}`,
        );
        const rows: [string, string][] = [
            ["Cups sold", String(state.daily.sold)],
            ["Revenue", money(state.daily.revenue)],
            ["Ingredients used", money(state.daily.cost)],
            ["Profit", money(report.profit)],
            ["Supplies bought", money(state.daily.purchases)],
            ["Cash change", money(report.cashChange)],
            ["Passed / sold out", `${state.daily.rejected} / ${state.daily.soldOut}`],
            ["Satisfaction", report.satisfaction === null ? "No buyers yet" : `${report.satisfaction}%`],
        ];
        element("result-values").replaceChildren(
            ...rows.flatMap(([label, value]) => {
                const dt = document.createElement("dt"),
                    dd = document.createElement("dd");
                dt.textContent = label;
                dd.textContent = value;
                return [dt, dd];
            }),
        );
    }
}
render();
