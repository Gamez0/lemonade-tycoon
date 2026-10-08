import { ITEMS, ITEM_KEYS, WEATHER } from "../content/catalog";
import { cupsPerPitcher, pitcherCost, unlockLocations } from "./game";
import type { State } from "./game";
import { isLocation, LOCATION_IDS, LOCATIONS } from "../content/locations";
import type { LocationId } from "../content/locations";

export const SAVE_KEY = "lemonade-tycoon.reboot.save";
export const BACKUP_KEY = "lemonade-tycoon.reboot.backup";
export type SaveStorage = Pick<Storage, "getItem" | "setItem">;
export interface SaveDocument {
    readonly version: 3;
    readonly state: State;
    readonly history: readonly State[];
}

const record = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);
const integer = (value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): value is number =>
    Number.isSafeInteger(value) && (value as number) >= min && (value as number) <= max;
const fraction = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;

function validLocations(value: Record<string, unknown>): boolean {
    if (!isLocation(value.location) || !integer(value.lifetimeRevenue) ||
        !Array.isArray(value.unlocked) || !value.unlocked.every(isLocation) ||
        new Set(value.unlocked).size !== value.unlocked.length || !value.unlocked.includes("neighborhood") ||
        !value.unlocked.includes(value.location) ||
        (value.pendingLocation !== null && (!isLocation(value.pendingLocation) ||
            !value.unlocked.includes(value.pendingLocation) || value.pendingLocation === value.location)) ||
        !record(value.locationStats) || !LOCATION_IDS.every(id => {
            const rating = (value.locationStats as Record<string, unknown>)[id];
            return record(rating) && fraction(rating.satisfaction) && fraction(rating.popularity);
        }) || !record(value.daily)) return false;
    if ((value.locationStats[value.location] as Record<string, unknown>).satisfaction !== value.reputation) return false;
    const daily = value.daily;
    if (!integer(daily.rent, 0, 1_000_000) || !integer(daily.moveFee, 0, 1_000_000)) return false;
    if (value.business === null) return value.phase === "preparation" && daily.rent === 0 && daily.moveFee === 0;
    const b = value.business;
    if (!record(b) || b.location !== value.location || !isLocation(b.from) || !value.unlocked.includes(b.from) ||
        value.pendingLocation !== null || b.paid !== true || !integer(b.traffic, 1, 500) ||
        typeof b.budget !== "number" || !Number.isFinite(b.budget) || b.budget < 0.1 || b.budget > 5 ||
        !Array.isArray(b.weights) || b.weights.length !== 3 || !b.weights.every(w => integer(w, 1, 100)) ||
        !integer(b.patienceTicks, 1, 120) || !integer(b.arrivalEvery, 1, 120) || !integer(b.serviceTicks, 1, 120) ||
        !fraction(b.satisfaction) || !fraction(b.popularity) || b.rent !== daily.rent || b.moveFee !== daily.moveFee ||
        (b.from === b.location && b.moveFee !== 0) ||
        (b.location === "neighborhood" && (b.rent !== 0 || b.moveFee !== 0))) return false;
    if (value.phase === "preparation") {
        const rating = value.locationStats[value.location] as Record<string, unknown>;
        if (b.satisfaction !== rating.satisfaction || b.popularity !== rating.popularity) return false;
    }
    return true;
}

function validState(value: unknown, legacy = false, preM5 = false): value is State {
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
    if (!preM5 && !validLocations(value)) return false;
    const traffic = !preM5 && record(value.business) ? value.business.traffic as number : forecast.traffic as number;
    if ((daily.visitors as number) > traffic || (daily.sold as number) > (daily.visitors as number) ||
        daily.rejected !== (daily.priceRejected as number) + (daily.passed as number) ||
        daily.visitors !== (daily.sold as number) + (daily.rejected as number) +
            (daily.soldOut as number) + (daily.abandoned as number) ||
        (value.phase === "results" && daily.visitors !== traffic) ||
        (value.phase === "preparation" && (daily.visitors !== 0 || daily.cost !== 0 ||
            (!legacy && (daily.pitchersMade !== 0 || daily.model !== "pitcher"))))) return false;
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
        value.cash !== (value.openingCash as number) + (daily.revenue as number) - (daily.purchases as number) -
            (preM5 ? 0 : daily.rent as number) - (preM5 ? 0 : daily.moveFee as number)) return false;
    return true;
}

export function decodeSave(raw: string): SaveDocument {
    let input: unknown;
    try { input = JSON.parse(raw); } catch { throw new Error("Save file is not valid JSON."); }
    if (!record(input) || ![0, 1, 2, 3].includes(input.version as number))
        throw new Error("Unsupported save version. Keep the file as a backup.");
    const legacy = input.version === 0 || input.version === 1;
    const preM5 = input.version !== 3;
    if (!Array.isArray(input.history) ||
        !input.history.every(day => validState(day, legacy, preM5)) || input.history.some(day => day.phase !== "results"))
        throw new Error("Save data is damaged or incomplete.");
    if (!validState(input.state, legacy, preM5)) throw new Error("Save data is damaged or incomplete.");
    let revenue = 0;
    let unlocked: readonly LocationId[] = ["neighborhood"];
    const migrate = (day: State, lifetimeRevenue: number): State => {
        if (!preM5) return day;
        unlocked = unlockLocations(unlocked, day.phase === "results" ? day.day : day.day - 1, lifetimeRevenue, day.reputation);
        return { ...day, pitcherCups: 0, location: "neighborhood", pendingLocation: null, unlocked, lifetimeRevenue,
            locationStats: { neighborhood: { satisfaction: day.reputation, popularity: 0.5 },
                park: { satisfaction: 0.5, popularity: 0.5 }, downtown: { satisfaction: 0.5, popularity: 0.5 } },
            business: day.phase === "results" ? { location: "neighborhood", from: "neighborhood", paid: true,
                rent: 0, moveFee: 0, traffic: day.weather.traffic, budget: 1, weights: [1, 1, 1],
                patienceTicks: 18, arrivalEvery: 5, serviceTicks: 8, satisfaction: day.reputation, popularity: 0.5 } : null,
            daily: { ...day.daily, rent: 0, moveFee: 0,
                ...(legacy ? { model: day.phase === "results" ? "cup" : "pitcher", pitchersMade: 0, meltedIce: 0 } : {}) } };
    };
    const history = (input.history as State[]).map(day => {
        revenue += day.daily.revenue;
        return migrate(day, revenue);
    });
    const state = migrate(input.state, revenue);
    if (history.length > state.day || history.some((day, index) => day.day !== index + 1) ||
        (state.phase === "results" && (history.length !== state.day || history[history.length - 1]?.day !== state.day)) ||
        (state.phase === "preparation" && history.length !== state.day - 1) ||
        history.some((day, index) => index > 0 && day.openingCash !== history[index - 1].cash) ||
        (history.length > 0 && state.phase === "preparation" && state.openingCash !== history[history.length - 1].cash))
        throw new Error("Save history does not match the current day.");
    if (state.phase === "results") {
        const latest = history[history.length - 1];
        const equal = (a: unknown, b: unknown): boolean => {
            if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => equal(v, b[i]));
            if (record(a) && record(b)) return Object.keys(a).length === Object.keys(b).length &&
                Object.keys(a).every(key => equal(a[key], b[key]));
            return a === b;
        };
        if (!equal(state, latest)) throw new Error("Save history does not match the current results.");
    }
    let totalRevenue = 0;
    if (history.some(day => { totalRevenue += day.daily.revenue; return day.lifetimeRevenue !== totalRevenue; }) ||
        state.lifetimeRevenue !== totalRevenue || !validState(state) || !history.every(day => validState(day)) ||
        history.some((day, index) => index > 0 && history[index - 1].unlocked.some(id => !day.unlocked.includes(id))) ||
        (history.length > 0 && history[history.length - 1].unlocked.some(id => !state.unlocked.includes(id))))
        throw new Error("Save progression does not match the ledger.");
    let earned: readonly LocationId[] = ["neighborhood"];
    for (const day of history) {
        if (day.unlocked.some(id => !earned.includes(id) && (day.day < LOCATIONS[id].days ||
            day.lifetimeRevenue < LOCATIONS[id].revenue || day.reputation < LOCATIONS[id].satisfaction)))
            throw new Error("Save unlocks do not match completed business.");
        earned = day.unlocked;
    }
    if (history.some((day, index) => day.business?.from !== (history[index - 1]?.location ?? "neighborhood")))
        throw new Error("Save location contracts do not match the ledger.");
    if (state.unlocked.some(id => !earned.includes(id) && (state.day - Number(state.phase === "preparation") < LOCATIONS[id].days ||
        state.lifetimeRevenue < LOCATIONS[id].revenue || state.reputation < LOCATIONS[id].satisfaction)))
        throw new Error("Save unlocks do not match completed business.");
    const previousLocation = history[state.day - 2]?.location ?? "neighborhood";
    if (state.phase === "preparation" && (state.business ? state.business.from : state.location) !== previousLocation)
        throw new Error("Save location does not match the opening checkpoint.");
    return { version: 3, state, history };
}

export function encodeSave(state: State, history: readonly State[]): string {
    if (state.phase === "selling") throw new Error("Save a checkpoint before opening the stand.");
    return JSON.stringify(decodeSave(JSON.stringify({ version: 3, state, history })));
}

export function writeSave(storage: SaveStorage, state: State, history: readonly State[]): void {
    const next = encodeSave(state, history);
    const previous = storage.getItem(SAVE_KEY);
    if (previous) {
        let valid = false;
        try { decodeSave(previous); valid = true; } catch { /* Preserve older backup. */ }
        if (valid) storage.setItem(BACKUP_KEY, previous);
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
