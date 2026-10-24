import { newsForDay, locationConditions } from "./game/content/day-conditions";
import { careerDate } from "./game/simulation/calendar";
import { balanceSheet } from "./game/presentation/balance-sheet";
import { profitGraph } from "./game/presentation/profit-graph";
import { GameAudio } from "./game/presentation/audio";
import { maxSaveBytes } from "./desktop/save-limits.json";
import { UPGRADES, STAFF, ADS, STAND_NAMES } from "./game/content/management";
import type { Upgrade, Management } from "./game/content/management";
import { purchaseUpgrade, hireStaff, selectAdvertising } from "./game/simulation/game";
import Phaser from "phaser";
import { ITEMS, ITEM_KEYS, CUSTOMERS } from "./game/content/catalog";
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
    openingReadiness,
    quality,
    recipeTaste,
    results,
    satisfactionCustomers,
    setPlan,
    unitCost,
    reserveLocation,
    expectedTraffic,
    effectiveWeather,
    dayTraffic,
    isBankrupt,
} from "./game/simulation/game";
import type { CustomerEvent, State, Stock } from "./game/simulation/game";
import { beginStreetDay, finishStreetDay, tickStreet } from "./game/simulation/street-day";
import type { StreetDay } from "./game/simulation/street-day";
import { decodeSave, encodeSave as encodeDocument, readSave, writeSave as writeDocument } from "./game/simulation/save";
import { readSaveAsync, writeSaveAsync } from "./game/simulation/async-save";
import type { AsyncSaveStorage } from "./game/simulation/async-save";
import { StreetScene } from "./game/presentation/street-scene";
import { standPreview } from "./game/presentation/stand-art";
import { icon } from "./game/presentation/icons";
import { tasteReaction, tasteAdvice } from "./game/presentation/taste-feedback";
import { markup } from "./game/presentation/layout";
import { StartMenu } from "./game/presentation/start-menu";
import { CompanyBook } from "./game/simulation/company-book";
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
let companyId: string | undefined;
let gameMode: "career" | "challenge" | undefined;
function encodeSave(state: State, history: readonly State[]): string { return encodeDocument(state, history, companyId, gameMode); }
function writeSave(storage: Parameters<typeof writeDocument>[0], state: State, history: readonly State[]): void {
    writeDocument(storage, state, history, companyId, gameMode);
}
function challengeComplete(): boolean {
    return gameMode === "challenge" && (state.day > 30 || (state.day === 30 && state.phase === "results"));
}
let reactions = { bought: 0, price: 0, passed: 0, "sold-out": 0, abandoned: 0 };
let street: StreetDay | null = null;
let openingCheckpoint: State | null = null;
let history: State[] = [];
let order = emptyOrder();
let selectedSupply: Item = "lemon";
let currentPage: Page = "recipe";
let selectedLocation: LocationId = "neighborhood";
let reportPage: "daily" | "ledger" | "graph" | "balance" = "daily";
let reportDay: number | null = null;
let lastFeedback = "Your first customers are just around the corner.";
let restartArmed = false;
let fast = false;
let saveBlocked = false;
let importing = false;
let closing = false;
let pendingImport = Promise.resolve();
let pendingRestore = Promise.resolve();
let pendingCompany = Promise.resolve();
let menuOpen = true;
type DisplaySettings = { mode: "windowed" | "fullscreen"; width: number; height: number; sizes: { width: number; height: number }[]; screen: { width: number; height: number }; scale: number; warning: string };
const desktopApp = (window as Window & { desktopApp?: { quit(): Promise<void>; diagnostics(): Promise<unknown>; display(): Promise<DisplaySettings>; setDisplay(value: { mode: string; width: number; height: number }): Promise<DisplaySettings> } }).desktopApp;
const desktopSave = (window as Window & { desktopSave?: AsyncSaveStorage & { onFlush(handler: (request?: boolean) => Promise<void>): void } }).desktopSave;
const companies = new CompanyBook(desktopSave ?? {
    getItem: async key => localStorage.getItem(key),
    setItem: async (key, value) => { localStorage.setItem(key, value); },
}, maxSaveBytes);
if (desktopSave) {
    document.documentElement.classList.add("desktop");
    const fitDesktop = () => document.documentElement.style.setProperty("--desktop-ui-scale", String(Math.min(1, window.innerHeight / 820)));
    fitDesktop();
    window.addEventListener("resize", fitDesktop);
}
let saveQueue = Promise.resolve();
let savedSnapshot: string | null = null;
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = markup;
desktopSave?.onFlush(async (request = true) => {
    closing = request;
    app.inert = menuOpen || closing || importing;
    menu.root.inert = closing || importing;
    menu.render();
    app.setAttribute("aria-busy", String(app.inert));
    if (!request) { scene.refresh(); return; }
    await pendingRestore;
    await pendingImport;
    await pendingCompany;
    await saveQueue;
    if (saveBlocked) throw new Error("Existing save is protected; export your current business before closing.");
    const checkpoint = encodeSave(state.phase === "selling" ? openingCheckpoint! : state, history);
    if (checkpoint !== savedSnapshot) await queueDesktopSave(checkpoint);
});
// Closing captures the final checkpoint. Already queued UI events cannot add a
// newer purchase, plan, import or SKIP while that checkpoint reaches the disk.
for (const type of ["click", "change", "input", "keydown"]) app.addEventListener(type, event => {
    if (!closing) return;
    event.preventDefault();
    event.stopImmediatePropagation();
}, true);
function element<T extends HTMLElement = HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
}
function text(id: string, value: string): void {
    const target = element(id);
    if (target.textContent !== value) target.textContent = value;
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
function queueDesktopSave(raw: string, status = "Saved on this PC"): Promise<void> {
    const write = saveQueue.then(() => writeSaveAsync(desktopSave!, raw));
    saveQueue = write.then(() => {
        savedSnapshot = raw;
        text("save-status", status);
    }).catch(() => {
        text("save-status", "Storage unavailable · export a backup");
    });
    return write;
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
    text("message", "");
    render();
}
function rows(id: string, values: [string, string][]): void {
    const target = element(id);
    const children = target.children;
    if (children.length === values.length * 2 && values.every(([label, value], i) =>
        children[i * 2].textContent === label && children[i * 2 + 1].textContent === value)) return;
    target.replaceChildren(
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
    row.innerHTML = `<span class="bundle-label"><span id="bundle-art-${i}"></span><span id="bundle-label-${i}"></span></span><strong id="bundle-price-${i}"></strong><div class="spinner"><button data-bundle="${i}" data-delta="-1">−</button><output id="bundle-count-${i}">0</output><button data-bundle="${i}" data-delta="1">+</button></div>`;
    element("supplies").append(row);
}
function applyStreet(events: CustomerEvent[]): void {
    for (const event of events) {
        reactions[event.kind]++;
        if (events.length < 8 && event.kind === "bought") audio.effect("sale");
        lastFeedback = event.kind === "bought" ? `${tasteReaction(event.tasteComplaints, event.satisfaction)} Satisfaction: ${event.satisfaction}%.`
            : event.kind === "price" ? "Too expensive! A neighbor walked away."
            : event.kind === "sold-out" ? "Sold out! A customer left empty-handed."
            : event.kind === "abandoned" ? "The line took too long. A customer left."
            : "Just passing by. Maybe next time!";
    }
    if (state.phase === "results" && history[history.length - 1] !== state) {
        history.push(state);
        if (!challengeComplete()) state = nextDay(state);
        openingCheckpoint = null;
        currentPage = "results";
        reportPage = "daily";
        reportDay = null;
        persist();
    }
}
const scene = new StreetScene({
    state: () => state,
    street: () => street,
    paused: () => menuOpen || importing || closing,
    tick: () => {
        if (!street || importing || closing) return;
        const next = tickStreet(street);
        street = next.day;
        // Completed-day pedestrians may finish walking after preparation advances.
        // Their old snapshot must never overwrite the new day's saved state.
        if (state.phase === "selling") state = street.game;
        applyStreet(next.events);
    },
    changed: render,
});
new Phaser.Game({
    type: Phaser.CANVAS,
    // Render the 640x512 world at twice the backing resolution before fitting
    // the canvas to its displayed size. Native artwork must not be pixelated.
    width: 1280,
    height: 1024,
    parent: "game-container",
    backgroundColor: "#9bc77e",
    pixelArt: false,
    antialias: true,
    roundPixels: false,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [scene],
    audio: { noAudio: true },
    fps: { target: 20, forceSetTimeOut: true },
});
function act(action: () => State): void {
    if (importing || closing) return;
    if (challengeComplete()) { render(); text("message", "The30-day challenge is complete. Start another company from Main menu."); return; }
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
function browseLocation(step: number): void {
    selectedLocation = LOCATION_IDS[(LOCATION_IDS.indexOf(selectedLocation) + step + LOCATION_IDS.length) % LOCATION_IDS.length];
    renderRent();
    document.querySelector<HTMLButtonElement>(`[data-location="${selectedLocation}"]`)!.focus({ preventScroll: true });
}
element("rent-previous").addEventListener("click", () => browseLocation(-1));
element("rent-next").addEventListener("click", () => browseLocation(1));
document.querySelector(".location-list")!.addEventListener("keydown", event => {
    const key = (event as KeyboardEvent).key;
    if (key === "ArrowLeft" || key === "ArrowRight") { event.preventDefault(); browseLocation(key === "ArrowLeft" ? -1 : 1); }
});
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-upgrade]"))
    button.addEventListener("click", () => act(() => purchaseUpgrade(state, button.dataset.upgrade as Upgrade)));
for (const name of ["upgrades", "staff"]) {
    const catalog = element(`${name}-catalog`);
    const cards = Array.from(catalog.children) as HTMLElement[];
    const index = () => Math.max(0, Math.min(cards.length - 1, Math.round(catalog.scrollLeft / (catalog.clientWidth || 1))));
    catalog.addEventListener("scroll", () => text(`${name}-position`, `${index() + 1} / ${cards.length}`));
    for (const button of document.querySelectorAll<HTMLButtonElement>(`[data-catalog="${name}"]`))
        button.addEventListener("click", () => {
            const next = (index() + Number(button.dataset.catalogStep) + cards.length) % cards.length;
            catalog.scrollTo({ left: next * catalog.clientWidth, behavior: "instant" });
        });
}
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
element("report-day").addEventListener("change", () => {
    reportDay = Number(element<HTMLSelectElement>("report-day").value);
    render();
});
element("open").addEventListener("click", () =>
    act(() => {
        if (orderCost() > 0) {
            showPage("supplies");
            throw new Error("BUY or CANCEL your pending order before starting the day.");
        }
        const planned = readPlan();
        if (openingReadiness(planned).cups === 0) showPage("supplies");
        else if (planned.cash < openingCosts(planned).fees) showPage("rent");
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
        reactions = { bought: 0, price: 0, passed: 0, "sold-out": 0, abandoned: 0 };
        fast = false;
        scene.setSpeed(1);
        text("speed-label", "Speed: 1\u00d7");
        lastFeedback = "A new day on Willow Lane. Your customers are on their way.";
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
    reportDay = null;
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
    if (closing || importing || state.phase !== "selling" || !street) return;
    const done = finishStreetDay(street);
    street = done.day;
    state = street.game;
    applyStreet(done.events);
    scene.resetDay();
    act(() => state);
});
element("next").addEventListener("click", () => {
    if (scene.finishing) return;
    if (challengeComplete()) { showMainMenu(); return; }
    act(() => {
        state = nextDay(state);
        resetPresentation();
        lastFeedback = "A new forecast, a new chance to improve.";
        return state;
    });
});
element("restart").addEventListener("click", () => {
    if (importing || closing) return;
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
element<HTMLInputElement>("save-file").addEventListener("change", (event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || importing || closing) return;
    importing = true;
    app.inert = true;
    menu.root.inert = true;
    app.setAttribute("aria-busy", "true");
    text("save-status", "Importing save...");
    pendingImport = (async () => {
        try {
            if (file.size > maxSaveBytes) throw new Error("Save file is too large.");
            const imported = decodeSave(await file.text());
            if (desktopSave) {
                await queueDesktopSave(encodeDocument(imported.state, imported.history, companyId, imported.mode));
            } else writeDocument(localStorage, imported.state, imported.history, companyId, imported.mode);
            state = imported.state;
            gameMode = imported.mode;
            history = [...imported.history];
            saveBlocked = false;
            resetPresentation();
            currentPage = state.phase === "results" ? "results" : "recipe";
            lastFeedback = "Imported business restored.";
            render();
            text("save-status", "Imported save · saved on this device");
        } catch (error) { text("save-status", error instanceof Error ? error.message : "Import failed"); }
        finally {
            input.value = "";
            importing = false;
            app.inert = menuOpen || closing;
            menu.root.inert = closing;
            app.setAttribute("aria-busy", String(closing));
            scene.refresh();
            if (menuOpen) void readCompanies().then(() => menu.show()).catch(error => menu.show(error.message));
        }
    })();
});
function renderReport(): void {
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-report]"))
        button.setAttribute("aria-pressed", String(button.dataset.report === reportPage));
    const latest = (reportDay === null ? undefined : history.find(report => report.day === reportDay)) ?? history[history.length - 1];
    const dayPicker = element<HTMLSelectElement>("report-day");
    element("report-day-picker").hidden = reportPage !== "daily" || history.length === 0;
    if (dayPicker.options.length !== history.length) {
        dayPicker.replaceChildren(...history.map(report => new Option(`Day ${report.day}`, String(report.day))));
    }
    if (latest) dayPicker.value = String(latest.day);
    const graph = reportPage === "graph" && history.length > 0;
    element("profit-graph").hidden = !graph;
    document.querySelector<HTMLElement>(".report-content")!.hidden = graph;
    const balance = reportPage === "balance";
    document.querySelector<HTMLElement>(".report-content")!.classList.toggle("balance-report", balance);
    if (balance) {
        const book = balanceSheet(state);
        text("result-intro", `Current balance sheet: day ${state.day}. Paid supplies and equipment at cost; free ice has zero value. Net asset change includes overnight stock loss, unlike trading profit.`);
        element("report-commentary").hidden = true;
        rows("result-values", [
            ["Cash", money(book.cash)], ["Paid supplies", money(book.inventory)],
            ["Equipment at cost", money(book.equipment)], ["Total assets", money(book.assets)],
            ["Initial capital", money(book.capital)], ["Net asset change", money(book.netAssetChange)],
            ["Total equity", money(book.capital + book.netAssetChange)],
        ]);
        return;
    }
    if (graph) {
        text("result-intro", `Daily profit: latest ${Math.min(30, history.length)} completed ${history.length === 1 ? "day" : "days"}. Day numbers on the horizontal axis.`);
        element("profit-graph").innerHTML = profitGraph(history, money);
        return;
    }
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
            : `Day ${latest.day} · ${LOCATIONS[latest.location].name} · ${sold === 0 ? "No sales." : `${sold} customers served.`}`,
    );
    const satisfaction = sold === 0 ? null : Math[reports.some(report => report.business?.customerModel === "purchase-first-v1") ? "floor" : "round"](sum("satisfactionTotal") /
        reports.reduce((total, report) => total + satisfactionCustomers(report), 0));
    element("report-face").innerHTML = icon(sold === 0 ? "quiet" : satisfaction !== null && satisfaction < 70 ? "unhappy" : "happy");
    text(
        "report-verdict",
        sold === 0
            ? "A quiet day..."
            : satisfaction !== null && satisfaction >= 80
              ? "A refreshing success!"
              : "Room to improve!",
    );
    const noSalesAdvice = sum("soldOut") > 0 ? "Buy enough supplies for tomorrow."
        : sum("abandoned") > 0 ? "Improve service or help the waiting line."
        : sum("priceRejected") > 0 ? "Try a lower cup price."
        : reportPage === "daily" && latest.business?.customerModel !== "purchase-first-v1" && quality(latest.plan.recipe, effectiveWeather(latest).temperature) < 0.7
          ? "Adjust your recipe to the forecast."
          : "Try another location or advertising to reach more buyers.";
    const ratingBasis = reports.every(report => report.business?.customerModel === "purchase-first-v1")
        ? " Includes buyers and visitors lost to price, stock or waiting; passers-by are excluded."
        : " Older saved days retain their original rating basis.";
    text("report-response", (sold === 0 ? noSalesAdvice : `Overall satisfaction: ${satisfaction}%.${ratingBasis}`) +
        ` ${sum("soldOut")} visitors missed out on empty stock. ${sum("abandoned")} left the line. ` +
        `${sum("priceRejected")} found the price too high; ${sum("passed")} passed by.` +
        (reportPage === "daily" && sold > 0 && latest.business?.customerModel === "purchase-first-v1"
            ? ` ${tasteAdvice(recipeTaste(latest.plan.recipe, effectiveWeather(latest).temperature).complaints)}` : ""));

    rows("result-values", [
        ["Cups sold", String(sold)],
        ["Revenue", money(sum("revenue"))],
        ["Ingredients used", money(sum("cost"))],
        ["Profit", money(sum("revenue") - sum("cost") - sum("rent") - sum("moveFee") - sum("wages") - sum("advertising"))],
        ["Supplies bought", money(sum("purchases"))],
        ["Cash change", money(reports.reduce((total, day) => total + results(day).cashChange, 0))],
        ["Price / passed", `${sum("priceRejected")} / ${sum("passed")}`],
        ["Empty / wait", `${sum("soldOut")} / ${sum("abandoned")}`],
        ["Buyer taste", sold === 0 ? "No buyers yet" : `${Math.round(sum("satisfactionTotal") / sold)}%`],
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
    const selectedIndex = LOCATION_IDS.indexOf(selectedLocation);
    const firstVisible = Math.max(0, Math.min(LOCATION_IDS.length - 3, selectedIndex - 1));
    for (const id of LOCATION_IDS) {
        const button = document.querySelector<HTMLButtonElement>(`button[data-location="${id}"]`)!;
        const index = LOCATION_IDS.indexOf(id);
        button.hidden = index < firstVisible || index >= firstVisible + 3;
        button.setAttribute("aria-pressed", String(id === selectedLocation));
        button.disabled = state.phase !== "preparation";
        text(`location-state-${id}`, !state.unlocked.includes(id) ? "Locked" : state.pendingLocation === id ? "Reserved"
            : state.location === id ? "Current" : "Available");
        const image = element<HTMLImageElement>(`thumbnail-${id}`);
        const preview = !image.getAttribute("src") ? scene.thumbnail(id) : null;
        if (preview) { image.src = preview; image.hidden = false; }
    }
    text("rent-position", `${LOCATION_IDS.indexOf(selectedLocation) + 1} / ${LOCATION_IDS.length}`);
    const moveFee = selectedLocation === state.location ? 0 : location.moveFee;
    const legacyBusiness = state.business?.location === selectedLocation && state.business.customerModel === undefined
        ? state.business : null;
    const patience = legacyBusiness ? [legacyBusiness.patienceTicks] : CUSTOMERS.map(customer => Math.max(1,
        Math.round((location.patience + STAFF[state.management.staff].patience) * customer.patience)));
    const totalWeights = location.weights.reduce((total: number, weight) => total + weight, 0);
    const conditions = locationConditions(state.day, selectedLocation, state.weather);
    text("rent-description", location.description + (selectedLocation === "mall" ? " Indoors:20\u00b0C; sheltered from rain." :
        state.weather.label === "Rainy" ? " Rain reduces outdoor foot traffic today." : "") +
        (conditions.newsFactor !== 1 ? ` Today's news changes visitors by ${Math.round((conditions.newsFactor - 1) * 100)}%.` : ""));
    rows("rent-details", [
        ["Daily rent / moving", `${money(location.rent)} / ${money(moveFee)}`],
        ["Visitors / budget", `${expectedTraffic({ ...state, business: null }, selectedLocation)} / ${Math.round(location.budget * 100)}%`],
        ["Wait range / arrivals", `${(Math.min(...patience) / 10).toFixed(1)}–${(Math.max(...patience) / 10).toFixed(1)}s / ${(location.arrival / 10).toFixed(1)}s`],
        ["Temperature / cooling", `${conditions.temperature}\u00b0C / ${recipeTaste(state.plan.recipe, conditions.temperature).preferredIce} ice per cup`],
        ["Office workers", `${Math.round(location.weights[1] / totalWeights * 100)}% · shortest wait`],
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
    const ended = challengeComplete();
    if (ended) currentPage = "results";
    const report = results(state),
        prep = state.phase === "preparation" && !ended,
        selling = state.phase === "selling",
        closed = state.phase === "results" || ended;
    app.dataset.mode = gameMode ?? "career";
    const date = careerDate(state.day);
    text("year", String(date.year));
    text("month", String(date.month));
    text("day", String(date.day).padStart(2, "0"));
    element("career-date").title = `Business day ${state.day}`;
    text("cash", money(state.cash));
    text("weather", effectiveWeather(state).temperature + "°C");
    const weatherArt = element("weather-art");
    if (weatherArt.dataset.weather !== state.weather.label) {
        weatherArt.innerHTML = icon(
            state.weather.label === "Sunny" ? "sunny" : state.weather.label === "Cloudy" ? "cloudy" : "rainy",
        );
        weatherArt.dataset.weather = state.weather.label;
    }
    element("weather-art").setAttribute("aria-label", state.weather.label);
    element("weather-art").setAttribute("role", "img");
    text("weather-label", selling ? "Current weather" : closed ? "Today's weather" : "Weather forecast");
    const climateLocation = prep ? state.pendingLocation ?? state.location : state.location;
    text("weather-advice", climateLocation === "mall" && (!state.business || state.business.conditions)
        ? `${state.weather.label} outside · indoors 20\u00b0C`
        : state.business && !state.business.conditions
            ? `${state.weather.label} · saved opening weather`
            : `${state.weather.label} · ${prep ? "steady all day" : LOCATIONS[state.location].street}`);
    app.dataset.weather = state.weather.label.toLowerCase();
    text(
        "forecast-news",
        state.day === 1
            ? "A new lemonade stand opens on Willow Lane!"
            : `${newsForDay(state.day).headline} ${expectedTraffic(state)} visitors expected at ${LOCATIONS[state.pendingLocation ?? state.location].street}.`,
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
    text("next-day-label", ended ? "Return to menu" : `Prepare day ${state.day + 1}`);
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
    app.dataset.view = currentPage;
    audio.setPhase(state.phase);
    for (const id of ["recipe-controls", "price-controls", "supply-controls"])
        element<HTMLFieldSetElement>(id).disabled = !prep || (id !== "supply-controls" && Boolean(state.business));
    for (const key of ITEM_KEYS) {
        text(`stock-${key}`, `${state.stock[key]} in stock`);
        text(`inventory-${key}`, String(state.stock[key]));
    }
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-supply]"))
        button.setAttribute("aria-pressed", String(button.dataset.supply === selectedSupply));
    bundleSizes.forEach((size, i) => {
        const quantity = size * ITEMS[selectedSupply].bundle;
        const art = element(`bundle-art-${i}`);
        if (art.dataset.item !== selectedSupply) {
            art.innerHTML = icon(selectedSupply);
            art.dataset.item = selectedSupply;
        }
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
    const readiness = openingReadiness(state);
    const missingSupplies = ITEM_KEYS.filter((item) => readiness.missing[item] > 0)
        .map((item) => `${readiness.missing[item]} ${ITEMS[item].name.toLowerCase()}`).join(", ");
    text("capacity", `${prep ? readiness.cups : capacity(state)} cups`);
    element("supply-warning").hidden = !prep || readiness.cups > 0;
    text("supply-warning", `Need ${missingSupplies} to open. Buy supplies or adjust your recipe.`);
    if (prep && readiness.cups === 0) element("open").setAttribute("aria-describedby", "supply-warning");
    else element("open").removeAttribute("aria-describedby");
    text("unit-cost", money(unitCost(state.plan.recipe, state.freeIce + openingCosts(state).ice)));
    const legacyPaidDay = state.business !== null && state.business.customerModel !== "purchase-first-v1";
    text("ice-basis", legacyPaidDay ? "Ice reserved at opening" : "Per sold cup");
    text("pitcher-yield", `${cupsPerPitcher(state.plan.recipe)} cups per pitcher; ` + (legacyPaidDay
        ? `${state.plan.recipe.ice * cupsPerPitcher(state.plan.recipe)} ice reserved per pitcher for this saved day.`
        : `${state.plan.recipe.ice} ice used per sold cup.`));
    text("pitcher-cups", `${state.pitcherCups} cups`);
    text("setting-pitchers", String(state.daily.pitchersMade));
    text(
        "recipe-hint",
        (legacyPaidDay ? "This saved day keeps its original recipe and customer rules." :
            `Taste score: ${Math.round(quality(state.plan.recipe, effectiveWeather(state).temperature) * 100)}%. Cooling needs ${recipeTaste(state.plan.recipe, effectiveWeather(state).temperature).preferredIce} ice per cup. Extra ice needs balanced lemon and sugar.`) +
            (state.daily.meltedIce ? ` ${state.daily.meltedIce} ice melted overnight.` : ""),
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
    text("world-status", prep ? readiness.cups === 0 ? "Supplies needed" : "Ready to open"
        : selling ? `Open · ${street?.waiting.length ?? 0} waiting` : "Closed for today");
    text("progress-text", prep ? LOCATIONS[state.location].street : `${state.daily.visitors} / ${dayTraffic(state)} visitors`);
    element<HTMLProgressElement>("day-progress").value = state.daily.visitors / dayTraffic(state);
    text("setting-location", LOCATIONS[state.location].name);
    text("setting-rent", `${money(state.daily.rent)} / ${money(state.daily.moveFee)}`);
    text("setting-price", money(state.plan.price));
    text("setting-equipment", Object.entries(UPGRADES)
        .filter(([id]) => state.management.upgrades[id as Upgrade] > 0)
        .map(([id, item]) => id === "stand" ? STAND_NAMES[state.management.upgrades.stand]
            : `${item.name} ${state.management.upgrades[id as Upgrade]}/${item.prices.length}`).join(" · ") || "No upgrades");
    text("setting-management", `${STAFF[state.management.staff].name} / ${ADS[state.management.advertising].name}`);
    text("setting-capacity", capacity(state) + " cups");
    for (const item of ["lemon", "sugar", "ice"] as const) text("setting-" + item, String(state.plan.recipe[item]));
    const target = state.pendingLocation ?? state.location;
    const due = openingBill();
    text("management-bill", `Opening bill ${money(due)} | Wages ${money(STAFF[state.management.staff].wage)} | Ads ${money(ADS[state.management.advertising].cost)}`);
    const bankrupt = isBankrupt(state);
    element("business-warning").hidden = !prep || (!bankrupt && state.cash >= due && !state.pendingLocation);
    text("business-warning", bankrupt ? (state.business
        ? "Not enough cash or stock to resume today's paid recipe. Export your save or confirm New business to restart."
        : "Not enough cash or stock for a paper cup, even with a zero-ingredient recipe. Export your save or confirm New business to restart.")
        : state.cash < due ? "Opening costs exceed cash. Reduce ads, dismiss staff or use Rent to return to the free Neighborhood."
        : `Reserved: ${LOCATIONS[target].name}. ${money(due)} will be charged at Start day.`);
    for (const [id, item] of Object.entries(UPGRADES)) {
        const level = state.management.upgrades[id as Upgrade];
        text(`upgrade-effect-${id}`, `Level ${level}/${item.prices.length} | ${level < item.prices.length ? item.effects[level] : item.effects[item.effects.length - 1]}`);
        if (id === "stand") {
            text("upgrade-title-stand", STAND_NAMES[level]);
            const picture = element("upgrade-art-stand");
            if (picture.dataset.level !== String(level)) {
                picture.innerHTML = standPreview(level);
                picture.dataset.level = String(level);
            }
        }
        const button = document.querySelector<HTMLButtonElement>(`[data-upgrade="${id}"]`)!;
        button.textContent = level < item.prices.length ? `BUY ${money(item.prices[level])}` : "MAX LEVEL";
        button.disabled = !prep || Boolean(state.business) || level === item.prices.length || state.cash < item.prices[level];
    }
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-staff], [data-advertising]")) {
        button.disabled = !prep || Boolean(state.business);
        button.setAttribute("aria-pressed", String(button.dataset.staff === state.management.staff || button.dataset.advertising === state.management.advertising));
        if (button.dataset.staff) button.textContent = button.dataset.staff === state.management.staff
            ? "CURRENT" : button.dataset.staff === "none" ? "WORK ALONE" : "HIRE";
    }
    if (prep) renderRent();
    if (!selling) renderReport();
    if (ended) text("goal", "30-day challenge complete.");
    scene.refresh();
    if (menuOpen) menu.render();
}
async function restore(): Promise<void> {
    try {
        const loaded = desktopSave ? await readSaveAsync(desktopSave) : readSave(localStorage);
        if (loaded.document) {
            state = loaded.document.state;
            history = [...loaded.document.history];
            companyId = loaded.document.companyId;
            gameMode = loaded.document.mode;
            const original = encodeSave(state, history);
            const owned = decodeSave(await companies.load(original, loaded.recovered));
            state = owned.state; history = [...owned.history]; companyId = owned.companyId; gameMode = owned.mode;
            saveBlocked = false;
            if (desktopSave && !loaded.recovered) savedSnapshot = original;
            resetPresentation();
            currentPage = state.phase === "results" ? "results" : "recipe";
            lastFeedback = loaded.recovered ? "Recovered from the previous valid save." : "Business restored from this device.";
            if (loaded.recovered || original !== encodeSave(state, history)) {
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
function renderDisplay(settings: DisplaySettings): void {
    const mode = element<HTMLSelectElement>("display-mode");
    mode.value = settings.mode;
    const size = element<HTMLSelectElement>("display-size");
    size.replaceChildren(...settings.sizes.map(({ width, height }) => new Option(`${width} × ${height}`, `${width}x${height}`)));
    size.value = `${settings.width}x${settings.height}`;
    size.disabled = settings.mode === "fullscreen";
    text("display-info", `Window sizes use Windows scaling (${Math.round(settings.scale * 100)}%). Fullscreen fills this screen.`);
    text("display-status", settings.warning);
}
element("display-settings").hidden = !desktopApp;
if (desktopApp) text("help-open", "Help / Settings");
element("help-open").addEventListener("click", () => {
    element<HTMLDialogElement>("help-dialog").showModal();
    if (desktopApp) void desktopApp.display().then(renderDisplay).catch(() => text("display-status", "Display settings unavailable."));
});
element("display-mode").addEventListener("change", () => {
    element<HTMLSelectElement>("display-size").disabled = element<HTMLSelectElement>("display-mode").value === "fullscreen";
});
element("display-apply").addEventListener("click", async () => {
    if (!desktopApp) return;
    const button = element<HTMLButtonElement>("display-apply");
    button.disabled = true;
    try {
        const [width, height] = element<HTMLSelectElement>("display-size").value.split("x").map(Number);
        const settings = await desktopApp.setDisplay({ mode: element<HTMLSelectElement>("display-mode").value, width, height });
        renderDisplay(settings);
        text("display-status", settings.warning || "Applied. Restored on your next launch.");
    } catch { text("display-status", "Display could not be changed. Reopen settings and choose a size that fits this screen."); }
    finally { button.disabled = false; }
});
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
    if (desktopApp) {
        void desktopApp.display().then(settings => desktopApp.setDisplay({ ...settings, mode: settings.mode === "fullscreen" ? "windowed" : "fullscreen" })).then(renderDisplay).catch(() => text("display-status", "Display could not be changed."));
        return;
    }
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void document.documentElement.requestFullscreen().catch(() => {});
});
function currentCompanySave(): string {
    return encodeSave(state.phase === "selling" ? openingCheckpoint! : state, history);
}
function enterCompany(inspect = false): void {
    if ((companies.blocked && !inspect) || closing || importing) return;
    if (inspect) saveBlocked = true;
    menuOpen = false;
    menu.hide();
    app.inert = false;
    scene.refresh();
}
async function readCompanies(): Promise<void> {
    await saveQueue;
    await companies.load(currentCompanySave());
}
const menu = new StartMenu({
    companies: () => companies.companies,
    active: () => companies.active,
    blocked: () => companies.blocked || saveBlocked || closing || importing,
    ready: () => scene.thumbnail("neighborhood") !== null,
    enter: enterCompany,
    select: (index, company) => {
        if (closing || importing) return Promise.reject(Error("Wait for the current save to finish."));
        const operation = (async () => {
            await saveQueue;
            const next = company ? { name: company.name, raw: encodeDocument(newGame(), [], crypto.randomUUID(), company.mode) } : null;
            await companies.select(index, currentCompanySave(), next, async raw => {
                if (desktopSave) await queueDesktopSave(raw);
                else { const doc = decodeSave(raw); writeDocument(localStorage, doc.state, doc.history, doc.companyId, doc.mode); }
            }, raw => {
                const document = decodeSave(raw);
                state = document.state; history = [...document.history];
                companyId = document.companyId;
                gameMode = document.mode;
                saveBlocked = false;
                resetPresentation();
                currentPage = state.phase === "results" ? "results" : "recipe";
                lastFeedback = "Company restored.";
                render();
            });
        })();
        // Close waits for a company switch, including journal cleanup.
        pendingCompany = operation.catch(() => {});
        return operation;
    },
    help: () => element("help-open").click(),
    options: () => { element("help-open").click(); element("display-settings").scrollIntoView({ block: "start" }); },
    quit: () => { if (desktopApp) void desktopApp.quit(); else window.close(); },
    retry: () => {
        if (closing || importing) return Promise.reject(Error("Wait for the current save to finish."));
        const operation = (async () => {
            await restore();
            if (saveBlocked) throw Error(element("save-status").textContent || "Save could not be restored.");
            await readCompanies();
        })();
        pendingCompany = operation.catch(() => {});
        return operation;
    },
    import: () => element<HTMLInputElement>("save-file").click(),
});
const menuButton = document.createElement("button");
menuButton.id = "main-menu"; menuButton.className = "text-button"; menuButton.textContent = "Main menu";
element("help-open").before(menuButton);
function showMainMenu(): void {
    if (closing || importing) return;
    menuOpen = true; app.inert = true; scene.refresh();
    pendingCompany = readCompanies().then(() => menu.show()).catch(error => menu.show(error.message));
}
menuButton.onclick = showMainMenu;
app.hidden = true;
app.inert = true;
pendingRestore = restore().then(async () => {
    try { await readCompanies(); menu.show(saveBlocked ? "Existing save is protected. Import a compatible backup." : ""); }
    catch (error) { menu.show(error instanceof Error ? error.message : "Company list could not be restored."); }
});
