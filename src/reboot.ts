import Phaser from "phaser";
import { ITEMS, ITEM_KEYS } from "./game/content/catalog";
import type { Item } from "./game/content/catalog";
import {
    buyOrder,
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
import type { CustomerEvent, State, Stock } from "./game/simulation/game";
import { StreetScene } from "./game/presentation/street-scene";
import { icon } from "./game/presentation/icons";
import { markup } from "./game/presentation/layout";
import "./game/presentation/style.css";

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
type Page = "recipe" | "price" | "supplies" | "results";
const emptyOrder = (): Record<Item, number[]> => ({
    lemon: [0, 0, 0],
    sugar: [0, 0, 0],
    ice: [0, 0, 0],
    cup: [0, 0, 0],
});
const bundleSizes = [1, 2, 5];
let state = newGame();
let reactions = { bought: 0, price: 0, passed: 0, "sold-out": 0 };
let history: State[] = [];
let order = emptyOrder();
let selectedSupply: Item = "lemon";
let currentPage: Page = "recipe";
let reportPage: "daily" | "ledger" = "daily";
let lastFeedback = "Your first customers are just around the corner.";
let restartArmed = false;
let fast = false;
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = markup;
function element<T extends HTMLElement = HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
}
function text(id: string, value: string): void {
    element(id).textContent = value;
}
function quantities(): Stock {
    const quantity = (item: Item) =>
        order[item].reduce((sum, count, i) => sum + count * bundleSizes[i] * ITEMS[item].bundle, 0);
    return { lemon: quantity("lemon"), sugar: quantity("sugar"), ice: quantity("ice"), cup: quantity("cup") };
}
function orderCost(): number {
    const q = quantities();
    return ITEM_KEYS.reduce((sum, item) => sum + q[item] * ITEMS[item].cost, 0);
}
function showPage(page: Page): void {
    currentPage = page;
    render();
}
function rows(id: string, values: [string, string][]): void {
    element(id).replaceChildren(
        ...values.flatMap(([label, value]) => {
            const dt = document.createElement("dt"),
                dd = document.createElement("dd");
            dt.textContent = label;
            dd.textContent = value;
            return [dt, dd];
        }),
    );
}
for (const [i] of bundleSizes.entries()) {
    const row = document.createElement("div");
    row.className = "bundle-row";
    row.innerHTML = `<span id="bundle-label-${i}"></span><strong id="bundle-price-${i}"></strong><div class="spinner"><button data-bundle="${i}" data-delta="-1">−</button><output id="bundle-count-${i}">0</output><button data-bundle="${i}" data-delta="1">+</button></div>`;
    element("supplies").append(row);
}
function advanceCustomer(): CustomerEvent {
    const step = stepCustomer(state);
    state = step.state;
    reactions[step.event.kind]++;
    if (state.phase === "results") {
        history.push(state);
        currentPage = "results";
        reportPage = "daily";
    }
    lastFeedback =
        step.event.kind === "bought"
            ? `Sold! Satisfaction: ${step.event.satisfaction}%.`
            : step.event.kind === "price"
              ? "Too expensive! A neighbor walked away."
              : step.event.kind === "sold-out"
                ? "Sold out! A customer left empty-handed."
                : "Just passing by. Maybe next time!";
    return step.event;
}
const scene = new StreetScene({
    state: () => state,
    profile: () => stepCustomer(state).event.profile,
    arrive: advanceCustomer,
    changed: render,
});
new Phaser.Game({
    type: Phaser.CANVAS,
    width: 640,
    height: 512,
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
            showPage(id === "price" ? "price" : "recipe");
            input.setAttribute("aria-invalid", "true");
            input.focus();
            throw new Error(`Check ${id}: enter a value from ${input.min} to ${input.max} in steps of ${input.step}.`);
        }
        input.removeAttribute("aria-invalid");
    }
    return setPlan(state, {
        price: Math.round(Number(element<HTMLInputElement>("price").value) * 100),
        recipe: {
            lemon: Number(element<HTMLInputElement>("lemon").value),
            sugar: Number(element<HTMLInputElement>("sugar").value),
            ice: Number(element<HTMLInputElement>("ice").value),
        },
    });
}
for (const id of ["lemon", "sugar", "ice", "price"]) element(id).addEventListener("change", () => act(readPlan));
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-adjust]"))
    button.addEventListener("click", () => {
        const input = element<HTMLInputElement>(button.dataset.adjust!);
        if (button.dataset.direction === "1") input.stepUp();
        else input.stepDown();
        act(readPlan);
    });
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-page]"))
    button.addEventListener("click", () => {
        if (state.phase !== "preparation") return;
        showPage(button.dataset.page as Page);
    });
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-supply]"))
    button.addEventListener("click", () => {
        selectedSupply = button.dataset.supply as Item;
        render();
    });
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-bundle]"))
    button.addEventListener("click", () => {
        const i = Number(button.dataset.bundle),
            delta = Number(button.dataset.delta);
        order[selectedSupply][i] = Math.max(0, Math.min(99, order[selectedSupply][i] + delta));
        text("message", "");
        render();
    });
element("cancel-order").addEventListener("click", () => {
    order = emptyOrder();
    text("message", "Order cancelled. Your cash and stock are unchanged.");
    render();
});
element("buy-order").addEventListener("click", () =>
    act(() => {
        const bought = buyOrder(readPlan(), quantities());
        order = emptyOrder();
        return bought;
    }),
);
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-report]"))
    button.addEventListener("click", () => {
        reportPage = button.dataset.report as typeof reportPage;
        render();
    });
element("open").addEventListener("click", () =>
    act(() => {
        if (orderCost() > 0) {
            showPage("supplies");
            throw new Error("BUY or CANCEL your pending order before starting the day.");
        }
        const opened = openDay(readPlan());
        scene.resetDay();
        return opened;
    }),
);
function resetPresentation(): void {
    reactions = { bought: 0, price: 0, passed: 0, "sold-out": 0 };
    currentPage = "recipe";
    reportPage = "daily";
    selectedSupply = "lemon";
    order = emptyOrder();
    scene.resetDay();
    fast = false;
    scene.setSpeed(1);
    text("speed-label", "Speed: 1×");
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
    text("speed-label", `Speed: ${fast ? 4 : 1}×`);
});
element("skip").addEventListener("click", () => {
    if (state.phase !== "selling") return;
    // The pending visit may already be committed. Resume from the actual state,
    // not the animation's profile/elapsed time, to avoid charging it twice.
    scene.resetDay();
    while (state.phase === "selling") advanceCustomer();
    act(() => state);
});
element("next").addEventListener("click", () => {
    if (scene.finishing) return;
    act(() => {
        state = nextDay(state);
        resetPresentation();
        lastFeedback = "A new forecast, a new chance to improve.";
        return state;
    });
});
element("restart").addEventListener("click", () => {
    if (!restartArmed) {
        restartArmed = true;
        text("restart", "Confirm new business");
        return;
    }
    state = newGame();
    history = [];
    resetPresentation();
    lastFeedback = "Your first customers are just around the corner.";
    act(() => state);
});
function cancelRestart(): void {
    restartArmed = false;
    text("restart", "New business");
}
element("restart").addEventListener("blur", cancelRestart);
element("restart").addEventListener("keydown", (event) => {
    if (event.key === "Escape") cancelRestart();
});
function renderReport(): void {
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-report]"))
        button.setAttribute("aria-pressed", String(button.dataset.report === reportPage));
    const latest = history[history.length - 1];
    if (!latest) {
        text("result-intro", "No completed days yet. Open your stand to start the books!");
        rows("result-values", []);
        element("report-commentary").hidden = true;
        return;
    }
    element("report-commentary").hidden = false;
    const reports = reportPage === "ledger" ? history : [latest];
    const sum = (key: keyof State["daily"]) => reports.reduce((total, day) => total + day.daily[key], 0);
    const sold = sum("sold");
    text(
        "result-intro",
        reportPage === "ledger"
            ? `Business ledger · ${history.length} completed ${history.length === 1 ? "day" : "days"}. Current preparation purchases are not included.`
            : `Day ${latest.day} · ${sold === 0 ? "No sales. Try a lower price tomorrow." : `${sold} neighbors served.`}`,
    );
    const satisfaction = sold === 0 ? null : Math.round(sum("satisfactionTotal") / sold);
    element("report-face").innerHTML = icon(sold > 0 ? "happy" : "expensive");
    text(
        "report-verdict",
        sold === 0
            ? "A quiet day..."
            : satisfaction !== null && satisfaction >= 80
              ? "A refreshing success!"
              : "Room to improve!",
    );
    text(
        "report-response",
        sold === 0
            ? "No buyers yet. Try a lower cup price."
            : "Customer satisfaction: " +
                  satisfaction +
                  "%. " +
                  sum("soldOut") +
                  " visitors missed out on empty stock. " +
                  sum("rejected") +
                  " passed without buying.",
    );

    rows("result-values", [
        ["Cups sold", String(sold)],
        ["Revenue", money(sum("revenue"))],
        ["Ingredients used", money(sum("cost"))],
        ["Profit", money(sum("revenue") - sum("cost"))],
        ["Supplies bought", money(sum("purchases"))],
        ["Cash change", money(reports.reduce((total, day) => total + results(day).cashChange, 0))],
        ["Passed / sold out", `${sum("rejected")} / ${sum("soldOut")}`],
        ["Satisfaction", sold === 0 ? "No buyers yet" : `${Math.round(sum("satisfactionTotal") / sold)}%`],
    ]);
}
function render(): void {
    const report = results(state),
        prep = state.phase === "preparation",
        selling = state.phase === "selling",
        closed = state.phase === "results";
    text("day", String(state.day).padStart(2, "0"));
    text("cash", money(state.cash));
    text("weather", state.weather.temperature + "°C");
    element("weather-art").innerHTML = icon(
        state.weather.label === "Sunny" ? "sunny" : state.weather.label === "Cloudy" ? "cloudy" : "rainy",
    );
    element("weather-art").setAttribute("aria-label", state.weather.label);
    element("weather-art").setAttribute("role", "img");
    text("weather-label", selling ? "Current weather" : closed ? "Today's weather" : "Weather forecast");
    text("weather-advice", state.weather.label + " · " + (prep ? "steady all day" : "Willow Lane"));
    app.dataset.weather = state.weather.label.toLowerCase();
    text(
        "forecast-news",
        state.day === 1
            ? "A new lemonade stand opens on Willow Lane!"
            : `${state.weather.traffic} neighbors are expected to pass today. Make every cup count!`,
    );
    text("reputation", `${Math.round(state.reputation * 100)}%`);
    element<HTMLMeterElement>("reputation-meter").value = Math.round(state.reputation * 100);
    element("preparation").hidden = !prep || currentPage === "results";
    for (const page of ["recipe", "price", "supplies"]) element(`${page}-page`).hidden = page !== currentPage;
    element("selling").hidden = !selling;
    element("results").hidden = !(closed || (prep && currentPage === "results"));
    element("day-actions").hidden = !prep;
    element("next").hidden = !closed;
    element<HTMLButtonElement>("next").disabled = scene.finishing;
    element("scene-controls").hidden = !selling && !scene.finishing;
    element<HTMLButtonElement>("skip").disabled = !selling;
    element("closed-sign").hidden = !closed || scene.finishing;
    const satisfaction = prep
        ? history.length
            ? results(history[history.length - 1]).satisfaction
            : null
        : report.satisfaction;
    text("location-satisfaction", satisfaction === null ? "—" : satisfaction + "%");
    element<HTMLMeterElement>("satisfaction-meter").value = satisfaction ?? 0;
    element("satisfaction-meter").setAttribute(
        "aria-valuetext",
        satisfaction === null ? "No buyers yet" : satisfaction + "%",
    );
    element("satisfaction-meter").title = prep ? "Last completed day's buyers" : "Today's buyers";
    text(
        "panel-title",
        selling
            ? "Today's settings"
            : closed || currentPage === "results"
              ? "Results"
              : currentPage[0].toUpperCase() + currentPage.slice(1),
    );
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-page]")) {
        button.disabled = !prep;
        button.setAttribute("aria-pressed", String(!selling && button.dataset.page === currentPage));
    }
    app.dataset.phase = state.phase;
    for (const id of ["recipe-controls", "price-controls", "supply-controls"])
        element<HTMLFieldSetElement>(id).disabled = !prep;
    for (const key of ITEM_KEYS) {
        text(`stock-${key}`, `${state.stock[key]} in stock`);
        text(`inventory-${key}`, String(state.stock[key]));
    }
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-supply]"))
        button.setAttribute("aria-pressed", String(button.dataset.supply === selectedSupply));
    bundleSizes.forEach((size, i) => {
        const quantity = size * ITEMS[selectedSupply].bundle;
        text(`bundle-label-${i}`, `${quantity} ${ITEMS[selectedSupply].name}`);
        text(`bundle-price-${i}`, money(quantity * ITEMS[selectedSupply].cost));
        text(`bundle-count-${i}`, String(order[selectedSupply][i]));
        for (const button of document.querySelectorAll<HTMLButtonElement>(`[data-bundle="${i}"]`)) {
            const adding = button.dataset.delta === "1";
            button.setAttribute(
                "aria-label",
                `${adding ? "Add" : "Remove"} bundle of ${quantity} ${ITEMS[selectedSupply].name}`,
            );
            button.disabled = !prep || (adding ? order[selectedSupply][i] >= 99 : order[selectedSupply][i] === 0);
        }
    });
    const q = quantities(),
        cost = orderCost();
    text(
        "order-summary",
        ITEM_KEYS.filter((item) => q[item] > 0)
            .map((item) => `${q[item]} ${ITEMS[item].name}`)
            .join(" · ") || "Your order is empty.",
    );
    text("order-total", money(cost));
    element<HTMLButtonElement>("cancel-order").disabled = cost === 0;
    text("capacity", `${capacity(state)} cups`);
    text("unit-cost", money(unitCost(state.plan.recipe)));
    text(
        "recipe-hint",
        `Recipe per cup · Forecast fit: ${Math.round(quality(state.plan.recipe, state.weather.temperature) * 100)}%. Try ${state.weather.temperature >= 30 ? 4 : state.weather.temperature >= 25 ? 3 : state.weather.temperature >= 21 ? 2 : 1} ice for today's weather.`,
    );
    text("sold", String(state.daily.sold));
    text("revenue", money(state.daily.revenue));
    text("profit", money(report.profit));
    text("feedback", lastFeedback);
    for (const kind of ["bought", "price", "passed", "sold-out"] as const)
        text("reaction-" + kind, String(reactions[kind]));
    text(
        "goal",
        state.cash >= 7500
            ? "First goal reached: $75 in the till!"
            : `Goal: $75 in the till · ${money(7500 - state.cash)} to go`,
    );
    text("world-status", prep ? "Ready to open" : selling ? "Open for business" : "Closed for today");
    text("progress-text", prep ? "Willow Lane" : `${state.daily.visitors} / ${state.weather.traffic} neighbors`);
    element<HTMLProgressElement>("day-progress").value = state.daily.visitors / state.weather.traffic;
    text("setting-price", money(state.plan.price));
    text("setting-capacity", capacity(state) + " cups");
    for (const item of ["lemon", "sugar", "ice"] as const) text("setting-" + item, String(state.plan.recipe[item]));
    renderReport();
}
render();
