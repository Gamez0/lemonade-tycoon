import { ITEMS, ITEM_KEYS, WEATHER } from "../content/catalog";
import { cupsPerPitcher, pitcherCost } from "./game";
import type { State } from "./game";

export const SAVE_KEY = "lemonade-tycoon.reboot.save";
export const BACKUP_KEY = "lemonade-tycoon.reboot.backup";
export type SaveStorage = Pick<Storage, "getItem" | "setItem">;
export interface SaveDocument {
    readonly version: 2;
    readonly state: State;
    readonly history: readonly State[];
}

const record = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);
const integer = (value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): value is number =>
    Number.isSafeInteger(value) && (value as number) >= min && (value as number) <= max;
const fraction = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;

function validState(value: unknown, legacy = false): value is State {
    if (!record(value) || !["preparation", "results"].includes(String(value.phase)) ||
        !integer(value.day, 1) || !integer(value.cash) || !integer(value.openingCash) ||
        !integer(value.seed, 0, 4294967295) || !fraction(value.reputation) ||
        !record(value.stock) || !record(value.plan) || !record(value.daily) || !record(value.weather)) return false;
    const stock = value.stock;
    if (!ITEM_KEYS.every(item => integer(stock[item], 0, 999))) return false;
    const plan = value.plan;
    if (!integer(plan.price, 25, 500) || !record(plan.recipe) ||
        !integer(plan.recipe.lemon, 1, 6) || !integer(plan.recipe.sugar, 1, 4) ||
        !integer(plan.recipe.ice, 0, legacy ? 6 : 7)) return false;
    const forecast = value.weather;
    if (!WEATHER.some(weather => weather.label === forecast.label &&
        weather.temperature === forecast.temperature && weather.traffic === forecast.traffic)) return false;
    const daily = value.daily;
    if (!legacy && (!integer(value.pitcherCups, 0, 33) ||
        !integer(daily.pitchersMade) || !integer(daily.meltedIce, 0, 999) ||
        !["cup", "pitcher"].includes(String(daily.model)) ||
        ((value.phase === "preparation" || value.phase === "results") && value.pitcherCups !== 0))) return false;
    for (const key of ["visitors", "sold", "rejected", "priceRejected", "passed", "soldOut",
        "abandoned", "revenue", "cost", "purchases", "satisfactionTotal"])
        if (!integer(daily[key])) return false;
    const traffic = forecast.traffic as number;
    if ((daily.visitors as number) > traffic || (daily.sold as number) > (daily.visitors as number) ||
        daily.rejected !== (daily.priceRejected as number) + (daily.passed as number) ||
        daily.visitors !== (daily.sold as number) + (daily.rejected as number) +
            (daily.soldOut as number) + (daily.abandoned as number) ||
        (value.phase === "results" && daily.visitors !== traffic) ||
        (value.phase === "preparation" && daily.visitors !== 0)) return false;
    const recipe = plan.recipe as unknown as State["plan"]["recipe"];
    const oldCost = recipe.lemon * ITEMS.lemon.cost + recipe.sugar * ITEMS.sugar.cost +
        recipe.ice * ITEMS.ice.cost + ITEMS.cup.cost;
    const expectedCost = legacy || daily.model === "cup" ? (daily.sold as number) * oldCost
        : (daily.pitchersMade as number) * pitcherCost(recipe) + (daily.sold as number) * ITEMS.cup.cost;
    if (daily.revenue !== (daily.sold as number) * (plan.price as number) ||
        daily.cost !== expectedCost ||
        (!legacy && daily.model === "pitcher" && (daily.sold as number) >
            (daily.pitchersMade as number) * cupsPerPitcher(recipe)) ||
        (!legacy && daily.model === "cup" && daily.pitchersMade !== 0) ||
        (daily.satisfactionTotal as number) > (daily.sold as number) * 100 ||
        value.cash !== (value.openingCash as number) + (daily.revenue as number) - (daily.purchases as number)) return false;
    return true;
}

export function decodeSave(raw: string): SaveDocument {
    let input: unknown;
    try { input = JSON.parse(raw); } catch { throw new Error("Save file is not valid JSON."); }
    if (!record(input) || ![0, 1, 2].includes(input.version as number))
        throw new Error("Unsupported save version. Keep the file as a backup.");
    const legacy = input.version !== 2;
    if (!Array.isArray(input.history) ||
        !input.history.every(day => validState(day, legacy)) || input.history.some(day => day.phase !== "results"))
        throw new Error("Save data is damaged or incomplete.");
    if (!validState(input.state, legacy)) throw new Error("Save data is damaged or incomplete.");
    const migrate = (day: State): State => legacy ? { ...day, pitcherCups: 0,
        daily: { ...day.daily, model: day.phase === "results" ? "cup" : "pitcher", pitchersMade: 0, meltedIce: 0 } } : day;
    const state = migrate(input.state);
    const history = (input.history as State[]).map(migrate);
    if (history.length > state.day || history.some((day, index) => day.day !== index + 1) ||
        (state.phase === "results" && (history.length !== state.day || history[history.length - 1]?.day !== state.day)) ||
        (state.phase === "preparation" && history.length !== state.day - 1) ||
        history.some((day, index) => index > 0 && day.openingCash !== history[index - 1].cash) ||
        (history.length > 0 && state.phase === "preparation" && state.openingCash !== history[history.length - 1].cash))
        throw new Error("Save history does not match the current day.");
    if (state.phase === "results") {
        const latest = history[history.length - 1];
        const equal = (a: unknown, b: unknown): boolean => {
            if (record(a) && record(b)) return Object.keys(a).length === Object.keys(b).length &&
                Object.keys(a).every(key => equal(a[key], b[key]));
            return a === b;
        };
        if (!equal(state, latest)) throw new Error("Save history does not match the current results.");
    }
    return { version: 2, state, history };
}

export function encodeSave(state: State, history: readonly State[]): string {
    if (state.phase === "selling") throw new Error("Save a checkpoint before opening the stand.");
    return JSON.stringify(decodeSave(JSON.stringify({ version: 2, state, history })));
}

export function writeSave(storage: SaveStorage, state: State, history: readonly State[]): void {
    const next = encodeSave(state, history);
    const previous = storage.getItem(SAVE_KEY);
    if (previous) {
        try { decodeSave(previous); storage.setItem(BACKUP_KEY, previous); } catch { /* Preserve older backup. */ }
    }
    storage.setItem(SAVE_KEY, next);
}

export function readSave(storage: SaveStorage): { document: SaveDocument | null; recovered: boolean } {
    const primary = storage.getItem(SAVE_KEY);
    if (primary === null) {
        const backup = storage.getItem(BACKUP_KEY);
        return backup === null ? { document: null, recovered: false }
            : { document: decodeSave(backup), recovered: true };
    }
    try { return { document: decodeSave(primary), recovered: false }; }
    catch (error) {
        const backup = storage.getItem(BACKUP_KEY);
        if (backup) {
            try { return { document: decodeSave(backup), recovered: true }; } catch { /* Report primary failure. */ }
        }
        throw error;
    }
}
