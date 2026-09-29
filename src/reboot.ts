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
import { icon } from "./game/presentation/icons";
import { markup } from "./game/presentation/layout";
import "./game/presentation/style.css";

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
let state = newGame();
let lastFeedback = "Your first customers are just around the corner.";
let restartArmed = false;
type PreparationPage = "recipe" | "price" | "supplies";
let preparationPage: PreparationPage = "recipe";
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = markup;

function element<T extends HTMLElement = HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
}
function text(id: string, value: string): void {
    element(id).textContent = value;
}
function showPreparationPage(page: PreparationPage): void {
    preparationPage = page;
    for (const name of ["recipe", "price", "supplies"] as const) element(`${name}-page`).hidden = name !== page;
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-jump]")) {
        button.setAttribute("aria-pressed", String((button.dataset.jump === "lemon" ? "recipe" : button.dataset.jump) === page));
    }
    if (state.phase === "preparation") text("panel-title", page === "recipe" ? "Recipe" : page === "price" ? "Price" : "Supplies");
}
for (const item of ITEM_KEYS) {
    const row = document.createElement("div");
    row.className = "supply-row";
    row.innerHTML = `<span class="supply-name">${icon(item)}<span>${ITEMS[item].name}<small id="stock-${item}"></small></span></span><button class="supply-button" data-item="${item}" aria-label="Buy ${ITEMS[item].bundle} ${ITEMS[item].name}">+${ITEMS[item].bundle} <small>${money(ITEMS[item].cost * ITEMS[item].bundle)}</small></button>`;
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
            showPreparationPage(id === "price" ? "price" : "recipe");
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
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-adjust]")) {
    button.addEventListener("click", () => {
        const input = element<HTMLInputElement>(button.dataset.adjust!);
        if (button.dataset.direction === "1") input.stepUp();
        else input.stepDown();
        act(readPlan);
    });
}
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-jump]")) {
    button.addEventListener("click", () => {
        if (state.phase !== "preparation") return;
        showPreparationPage(button.dataset.jump === "lemon" ? "recipe" : button.dataset.jump as PreparationPage);
        const target =
            button.dataset.jump === "supplies"
                ? element("supplies").querySelector<HTMLButtonElement>("button")!
                : element(button.dataset.jump!);
        target.focus();
        target.scrollIntoView({ block: "nearest" });
    });
}
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
    showPreparationPage("recipe");
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
    text("panel-title", prep ? preparationPage === "recipe" ? "Recipe" : preparationPage === "price" ? "Price" : "Supplies" : selling ? "Today's settings" : "Results");
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-jump]")) button.disabled = !prep;
    app.dataset.phase = state.phase;
    element<HTMLMeterElement>("reputation-meter").value = Math.round(state.reputation * 100);
    for (const id of ["recipe-controls", "price-controls", "supply-controls"])
        element<HTMLFieldSetElement>(id).disabled = !prep;
    element<HTMLButtonElement>("next").disabled = scene.finishing;
    for (const key of ITEM_KEYS) {
        text(`stock-${key}`, `${state.stock[key]} in stock`);
        text(`inventory-${key}`, String(state.stock[key]));
    }
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
