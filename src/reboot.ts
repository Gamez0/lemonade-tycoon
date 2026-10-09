import { GameAudio } from "./game/presentation/audio";
import { maxSaveBytes } from "./desktop/save-limits.json";
import { UPGRADES, STAFF, ADS } from "./game/content/management";
import type { Upgrade, Management } from "./game/content/management";
import { purchaseUpgrade, hireStaff, selectAdvertising } from "./game/simulation/game";
import Phaser from "phaser";
import { ITEMS, ITEM_KEYS } from "./game/content/catalog";
import type { Item } from "./game/content/catalog";
import { LOCATIONS, LOCATION_IDS } from "./game/content/locations";
import type { LocationId } from "./game/content/locations";
import {
    buyOrder,
    capacity,
    cupsPerPitcher,
    newGame,
    nextDay,
    openDay,
    openingCosts,
    quality,
    results,
    setPlan,
    unitCost,
    reserveLocation,
    expectedTraffic,
    dayTraffic,
    isBankrupt,
} from "./game/simulation/game";
import type { CustomerEvent, State, Stock } from "./game/simulation/game";
import { beginStreetDay, finishStreetDay, tickStreet } from "./game/simulation/street-day";
import type { StreetDay } from "./game/simulation/street-day";
import { decodeSave, encodeSave, readSave, writeSave } from "./game/simulation/save";
import { readSaveAsync, writeSaveAsync } from "./game/simulation/async-save";
import type { AsyncSaveStorage } from "./game/simulation/async-save";
import { StreetScene } from "./game/presentation/street-scene";
import { icon } from "./game/presentation/icons";
import { markup } from "./game/presentation/layout";
import "./game/presentation/style.css";

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
type Page = "recipe" | "marketing" | "supplies" | "results" | "rent" | "upgrades" | "staff";
const emptyOrder = (): Record<Item, number[]> => ({
    lemon: [0, 0, 0],
    sugar: [0, 0, 0],
    ice: [0, 0, 0],
    cup: [0, 0, 0],
});
const bundleSizes = [1, 2, 5];
const audio = new GameAudio();
let state = newGame();
let reactions = { bought: 0, price: 0, passed: 0, "sold-out": 0, abandoned: 0 };
let street: StreetDay | null = null;
let openingCheckpoint: State | null = null;
let history: State[] = [];
let order = emptyOrder();
let selectedSupply: Item = "lemon";
let currentPage: Page = "recipe";
let selectedLocation: LocationId = "neighborhood";
let reportPage: "daily" | "ledger" = "daily";
let lastFeedback = "Your first customers are just around the corner.";
let restartArmed = false;
let fast = false;
let saveBlocked = false;
const desktopApp = (window as Window & { desktopApp?: { quit(): Promise<void>; diagnostics(): Promise<unknown> } }).desktopApp;
const desktopSave = (window as Window & { desktopSave?: AsyncSaveStorage & { onFlush(handler: () => Promise<void>): void } }).desktopSave;
if (desktopSave) {
    document.documentElement.classList.add("desktop");
    const fitDesktop = () => document.documentElement.style.setProperty("--desktop-ui-scale", String(Math.min(1, window.innerHeight / 820)));
    fitDesktop();
    window.addEventListener("resize", fitDesktop);
}
let saveQueue = Promise.resolve();
desktopSave?.onFlush(() => saveQueue);
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = markup;
function element<T extends HTMLElement = HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
}
function text(id: string, value: string): void {
    element(id).textContent = value;
}
function persist(): void {
    if (state.phase === "selling" || saveBlocked) return;
    if (desktopSave) {
        try {
            queueDesktopSave(encodeSave(state, history));
        } catch { text("save-status", "Save could not be prepared · export a backup"); }
        return;
    }
    try {
        writeSave(localStorage, state, history);
        text("save-status", "Saved on this device");
    } catch {
        text("save-status", "Storage unavailable · export a backup");
    }
}
function queueDesktopSave(raw: string, status = "Saved on this PC"): void {
    saveQueue = saveQueue.then(() => writeSaveAsync(desktopSave!, raw)).then(() => {
        text("save-status", status);
    }).catch(() => {
        text("save-status", "Storage unavailable · export a backup");
    });
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
function applyStreet(events: CustomerEvent[]): void {
    for (const event of events) {
        reactions[event.kind]++;
        if (events.length < 8 && event.kind === "bought") audio.effect("sale");
        lastFeedback = event.kind === "bought" ? `Sold! Satisfaction: ${event.satisfaction}%.`
            : event.kind === "price" ? "Too expensive! A neighbor walked away."
            : event.kind === "sold-out" ? "Sold out! A customer left empty-handed."
            : event.kind === "abandoned" ? "The line took too long. A customer left."
            : "Just passing by. Maybe next time!";
    }
    if (state.phase === "results" && history[history.length - 1] !== state) {
        history.push(state);
        currentPage = "results";
        reportPage = "daily";
        persist();
    }
}
const scene = new StreetScene({
    state: () => state,
    street: () => street,
    tick: () => {
        if (!street) return;
        const next = tickStreet(street);
        street = next.day;
        state = street.game;
        applyStreet(next.events);
    },
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
        audio.effect("buy");
        text("message", "");
        render();
        persist();
    } catch (error) {
        audio.effect("error");
        text("message", error instanceof Error ? error.message : "Please check your choices.");
    }
}
function readPlan(): State {
    for (const id of ["lemon", "sugar", "ice", "price"]) {
        const input = element<HTMLInputElement>(id);
        if (input.value === "" || !input.checkValidity()) {
            showPage(id === "price" ? "marketing" : "recipe");
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
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-location]"))
    button.addEventListener("click", () => {
        selectedLocation = button.dataset.location as LocationId;
        renderRent();
    });
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-upgrade]"))
    button.addEventListener("click", () => act(() => purchaseUpgrade(state, button.dataset.upgrade as Upgrade)));
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-staff]"))
    button.addEventListener("click", () => act(() => hireStaff(state, button.dataset.staff as Management["staff"])));
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-advertising]"))
    button.addEventListener("click", () => act(() => selectAdvertising(state, button.dataset.advertising as Management["advertising"])));
element("confirm-rent").addEventListener("click", () => act(() => {
    if (orderCost() > 0) throw new Error("BUY or CANCEL your pending supply order before reserving a location.");
    return reserveLocation(state, selectedLocation);
}));
element("cancel-rent").addEventListener("click", () => act(() => reserveLocation(state, null)));
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
        const planned = readPlan();
        const opened = openDay(planned);
        openingCheckpoint = { ...opened, phase: "preparation" };
        if (!saveBlocked && desktopSave) {
            queueDesktopSave(encodeSave(openingCheckpoint, history));
            text("save-status", "Opening checkpoint queued · reload restarts this day");
        } else if (!saveBlocked) {
            try {
                writeSave(localStorage, openingCheckpoint, history);
                text("save-status", "Saved before opening · reload restarts this day");
            } catch { text("save-status", "Storage unavailable · export a backup"); }
        }
        scene.resetDay();
        street = beginStreetDay(opened);
        return opened;
    }),
);
function resetPresentation(): void {
    reactions = { bought: 0, price: 0, passed: 0, "sold-out": 0, abandoned: 0 };
    street = null;
    openingCheckpoint = null;
    currentPage = "recipe";
    selectedLocation = state.pendingLocation ?? state.location;
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
    if (state.phase !== "selling" || !street) return;
    const done = finishStreetDay(street);
    street = done.day;
    state = street.game;
    applyStreet(done.events);
    scene.resetDay();
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
    saveBlocked = false;
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
element("export-save").addEventListener("click", () => {
    try {
        const raw = encodeSave(state.phase === "selling" ? openingCheckpoint! : state, history);
        const url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `lemonade-tycoon-day-${state.day}.json`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        text("save-status", "Save exported");
    } catch (error) { text("save-status", error instanceof Error ? error.message : "Export failed"); }
});
element("import-save").addEventListener("click", () => element<HTMLInputElement>("save-file").click());
element<HTMLInputElement>("save-file").addEventListener("change", async (event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
        if (file.size > maxSaveBytes) throw new Error("Save file is too large.");
        const imported = decodeSave(await file.text());
        if (desktopSave) {
            await saveQueue;
            await writeSaveAsync(desktopSave, encodeSave(imported.state, imported.history));
        } else writeSave(localStorage, imported.state, imported.history);
        state = imported.state;
        history = [...imported.history];
        saveBlocked = false;
        resetPresentation();
        currentPage = state.phase === "results" ? "results" : "recipe";
        lastFeedback = "Imported business restored.";
        render();
        text("save-status", "Imported save · saved on this device");
    } catch (error) { text("save-status", error instanceof Error ? error.message : "Import failed"); }
    input.value = "";
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
    const sum = (key: Exclude<keyof State["daily"], "model">) => reports.reduce((total, day) => total + day.daily[key], 0);
    const sold = sum("sold");
    text(
        "result-intro",
        reportPage === "ledger"
            ? `Business ledger · ${history.length} completed ${history.length === 1 ? "day" : "days"}. Current preparation purchases are not included.`
            : `Day ${latest.day} · ${LOCATIONS[latest.location].name} · ${sold === 0 ? "No sales. Try a lower price tomorrow." : `${sold} customers served.`}`,
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
                  sum("abandoned") +
                  " left the line. " +
                  sum("priceRejected") +
                  " found the price too high; " +
                  sum("passed") +
                  " passed by.",
    );

    rows("result-values", [
        ["Cups sold", String(sold)],
        ["Revenue", money(sum("revenue"))],
        ["Ingredients used", money(sum("cost"))],
        ["Profit", money(sum("revenue") - sum("cost") - sum("rent") - sum("moveFee") - sum("wages") - sum("advertising"))],
        ["Supplies bought", money(sum("purchases"))],
        ["Cash change", money(reports.reduce((total, day) => total + results(day).cashChange, 0))],
        ["Price / passed", `${sum("priceRejected")} / ${sum("passed")}`],
        ["Empty / wait", `${sum("soldOut")} / ${sum("abandoned")}`],
        ["Satisfaction", sold === 0 ? "No buyers yet" : `${Math.round(sum("satisfactionTotal") / sold)}%`],
        ["Rent", money(sum("rent"))],
        ["Moving fees", money(sum("moveFee"))],
        ["Wages / advertising", `${money(sum("wages"))} / ${money(sum("advertising"))}`],
        ["Equipment bought", money(sum("capital"))],
    ]);
}
function openingBill(): number {
    return openingCosts(state).fees;
}
function renderRent(): void {
    const location = LOCATIONS[selectedLocation], rating = state.locationStats[selectedLocation];
    for (const id of LOCATION_IDS) {
        const button = document.querySelector<HTMLButtonElement>(`button[data-location="${id}"]`)!;
        button.setAttribute("aria-pressed", String(id === selectedLocation));
        button.disabled = state.phase !== "preparation";
        text(`location-state-${id}`, !state.unlocked.includes(id) ? "Locked" : state.pendingLocation === id ? "Reserved"
            : state.location === id ? "Current" : "Available");
        const image = element<HTMLImageElement>(`thumbnail-${id}`);
        const preview = !image.getAttribute("src") ? scene.thumbnail(id) : null;
        if (preview) { image.src = preview; image.hidden = false; }
    }
    const moveFee = selectedLocation === state.location ? 0 : location.moveFee;
    text("rent-description", location.description);
    rows("rent-details", [
        ["Daily rent / moving", `${money(location.rent)} / ${money(moveFee)}`],
        ["Visitors / budget", `${expectedTraffic({ ...state, business: null }, selectedLocation)} / ${Math.round(location.budget * 100)}%`],
        ["Patience / arrivals", `${(location.patience / 10).toFixed(1)}s / ${(location.arrival / 10).toFixed(1)}s`],
        ["Popularity / satisfaction", `${Math.round(rating.popularity * 100)}% / ${Math.round(rating.satisfaction * 100)}%`],
    ]);
    const locked = !state.unlocked.includes(selectedLocation);
    text("rent-unlock", locked ? `Unlock: ${location.days} completed days, ${money(location.revenue)} sales, ${Math.round(location.satisfaction * 100)}% rating where you sell. Now: ${history.length} days / ${money(state.lifetimeRevenue)}.`
        : "Unlocked permanently. Charges apply only when you start the day.");
    const target = state.pendingLocation ?? state.location;
    const openingCost = openingBill();
    text("rent-reservation", state.business ? "Today's location is already paid. Replay incurs no extra fees."
        : `${state.pendingLocation ? "Reserved" : "Next opening"}: ${LOCATIONS[target].name} · ${money(openingCost)} due at Start day.`);
    element<HTMLButtonElement>("confirm-rent").disabled = locked || Boolean(state.business) || state.phase !== "preparation";
    element<HTMLButtonElement>("cancel-rent").disabled = state.pendingLocation === null || Boolean(state.business) || state.phase !== "preparation";
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
    text("weather-advice", state.weather.label + " · " + (prep ? "steady all day" : LOCATIONS[state.location].street));
    app.dataset.weather = state.weather.label.toLowerCase();
    text(
        "forecast-news",
        state.day === 1
            ? "A new lemonade stand opens on Willow Lane!"
            : `${expectedTraffic(state)} visitors expected at ${LOCATIONS[state.pendingLocation ?? state.location].street}.`,
    );
    const rating = state.locationStats[state.location];
    text("reputation", `${Math.round(rating.popularity * 100)}%`);
    element<HTMLMeterElement>("reputation-meter").value = Math.round(rating.popularity * 100);
    text("location-name", LOCATIONS[state.location].name);
    text("location-description", LOCATIONS[state.location].description);
    text("location-rent", `Rent: ${LOCATIONS[state.location].rent === 0 ? "FREE" : money(LOCATIONS[state.location].rent) + " / day"}`);
    document.querySelector(".world-column")!.setAttribute("aria-label", LOCATIONS[state.location].street + " stand");
    app.dataset.location = state.location;
    element("preparation").hidden = !prep || currentPage === "results";
    for (const page of ["recipe", "marketing", "supplies", "rent", "upgrades", "staff"]) element(`${page}-page`).hidden = page !== currentPage;
    element("selling").hidden = !selling;
    element("results").hidden = !(closed || (prep && currentPage === "results"));
    element("day-actions").hidden = !prep;
    element("next").hidden = !closed;
    element<HTMLButtonElement>("next").disabled = scene.finishing;
    element("scene-controls").hidden = !selling && !scene.finishing;
    element<HTMLButtonElement>("skip").disabled = !selling;
    element("closed-sign").hidden = !closed || scene.finishing;
    const satisfaction = Math.round(rating.satisfaction * 100);
    text("location-satisfaction", satisfaction + "%");
    element<HTMLMeterElement>("satisfaction-meter").value = satisfaction;
    element("satisfaction-meter").setAttribute(
        "aria-valuetext",
        satisfaction + "%",
    );
    element("satisfaction-meter").title = "This location's satisfaction across completed days";
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
    audio.setPhase(state.phase);
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
    text("unit-cost", money(unitCost(state.plan.recipe, state.freeIce + openingCosts(state).ice)));
    text("pitcher-yield", `${cupsPerPitcher(state.plan.recipe)} cups per pitcher`);
    text("pitcher-cups", `${state.pitcherCups} cups`);
    text(
        "recipe-hint",
        `Forecast fit: ${Math.round(quality(state.plan.recipe, state.weather.temperature) * 100)}%. Try ${state.weather.temperature >= 30 ? 4 : state.weather.temperature >= 25 ? 3 : state.weather.temperature >= 21 ? 2 : 1} ice for today's weather.${state.daily.meltedIce ? ` ${state.daily.meltedIce} ice melted overnight.` : ""}`,
    );
    text("sold", String(state.daily.sold));
    text("revenue", money(state.daily.revenue));
    text("profit", money(report.profit));
    text("feedback", lastFeedback);
    for (const kind of ["bought", "price", "passed", "sold-out", "abandoned"] as const)
        text("reaction-" + kind, String(reactions[kind]));
    text(
        "goal",
        state.cash >= 7500
            ? "First goal reached: $75 in the till!"
            : `Goal: $75 in the till · ${money(7500 - state.cash)} to go`,
    );
    text("world-status", prep ? "Ready to open"
        : selling ? `Open · ${street?.waiting.length ?? 0} waiting` : "Closed for today");
    text("progress-text", prep ? LOCATIONS[state.location].street : `${state.daily.visitors} / ${dayTraffic(state)} visitors`);
    element<HTMLProgressElement>("day-progress").value = state.daily.visitors / dayTraffic(state);
    text("setting-location", LOCATIONS[state.location].name);
    text("setting-rent", `${money(state.daily.rent)} / ${money(state.daily.moveFee)}`);
    text("setting-price", money(state.plan.price));
    text("setting-capacity", capacity(state) + " cups");
    for (const item of ["lemon", "sugar", "ice"] as const) text("setting-" + item, String(state.plan.recipe[item]));
    const target = state.pendingLocation ?? state.location;
    const due = openingBill();
    text("management-bill", `Opening bill ${money(due)} | Wages ${money(STAFF[state.management.staff].wage)} | Ads ${money(ADS[state.management.advertising].cost)}`);
    const bankrupt = isBankrupt(state);
    element("business-warning").hidden = !prep || (!bankrupt && state.cash >= due && !state.pendingLocation);
    text("business-warning", bankrupt ? "Not enough cash or stock for the cheapest pitcher. Export your save or confirm New business to restart."
        : state.cash < due ? "Opening costs exceed cash. Reduce ads, dismiss staff or use Rent to return to the free Neighborhood."
        : `Reserved: ${LOCATIONS[target].name}. ${money(due)} will be charged at Start day.`);
    for (const [id, item] of Object.entries(UPGRADES)) {
        const level = state.management.upgrades[id as Upgrade];
        text(`upgrade-effect-${id}`, `Level ${level}/2 | ${level < 2 ? item.effects[level] : item.effects[1]}`);
        const button = document.querySelector<HTMLButtonElement>(`[data-upgrade="${id}"]`)!;
        button.textContent = level < 2 ? `BUY ${money(item.prices[level])}` : "MAX LEVEL";
        button.disabled = !prep || Boolean(state.business) || level === 2 || state.cash < item.prices[level];
    }
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-staff], [data-advertising]")) {
        button.disabled = !prep || Boolean(state.business);
        button.setAttribute("aria-pressed", String(button.dataset.staff === state.management.staff || button.dataset.advertising === state.management.advertising));
    }
    renderRent();
    renderReport();
}
async function restore(): Promise<void> {
    try {
        const loaded = desktopSave ? await readSaveAsync(desktopSave) : readSave(localStorage);
        if (loaded.document) {
            state = loaded.document.state;
            history = [...loaded.document.history];
            resetPresentation();
            currentPage = state.phase === "results" ? "results" : "recipe";
            lastFeedback = loaded.recovered ? "Recovered from the previous valid save." : "Business restored from this device.";
            if (loaded.recovered) {
                if (desktopSave) queueDesktopSave(encodeSave(state, history), "Recovered from backup");
                else writeSave(localStorage, state, history);
            }
            text("save-status", loaded.recovered ? "Recovered from backup" : desktopSave ? "Saved on this PC" : "Saved on this device");
        } else persist();
    } catch (error) {
        saveBlocked = true;
        text("save-status", error instanceof Error ? error.message : "Save could not be restored");
    }
    render();
    app.hidden = false;
}
document.addEventListener("pointerdown", () => audio.activate());
document.addEventListener("keydown", () => audio.activate());
element("help-open").addEventListener("click", () => element<HTMLDialogElement>("help-dialog").showModal());
element("quit-game").hidden = !desktopApp;
element("export-diagnostics").hidden = !desktopApp;
element("quit-game").addEventListener("click", () => { void desktopApp?.quit(); });
element("export-diagnostics").addEventListener("click", async () => {
    if (!desktopApp) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(await desktopApp.diagnostics(), null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "willow-lane-diagnostics.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
});
element("help-close").addEventListener("click", () => element<HTMLDialogElement>("help-dialog").close());
for (const id of ["music-volume", "effects-volume", "mute-audio"]) {
    const input = element<HTMLInputElement>(id);
    if (id === "mute-audio") input.checked = audio.settings.muted;
    else input.value = String((id === "music-volume" ? audio.settings.music : audio.settings.effects) * 100);
    input.addEventListener("input", () => audio.configure({
        music: Number(element<HTMLInputElement>("music-volume").value) / 100,
        effects: Number(element<HTMLInputElement>("effects-volume").value) / 100,
        muted: element<HTMLInputElement>("mute-audio").checked,
    }));
}
element("fullscreen").addEventListener("click", () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void document.documentElement.requestFullscreen().catch(() => {});
});
app.hidden = true;
void restore();
