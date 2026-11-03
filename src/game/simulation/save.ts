import { validConditions } from "../content/day-conditions";
import { defaultManagement, UPGRADES, STAFF, ADS } from "../content/management";
import { ITEM_KEYS, WEATHER, type Weather } from "../content/catalog";
import { cupsPerPitcher, unlockLocations } from "./game";
import type { State } from "./game";
import { isLocation, LOCATION_IDS, LOCATIONS, LEGACY_LOCATION_IDS, defaultLocationStats } from "../content/locations";
import type { LocationId } from "../content/locations";
import { weatherPeriod, type Three } from "./weather-periods";
import { inventoryValues, totalCost } from "./inventory-costs";
import { PRICE_RULES, pricesFor } from "../content/price-rules";
import { equipmentValue } from "./equipment-costs";

export const SAVE_KEY = "lemonade-tycoon.reboot.save";
export const BACKUP_KEY = "lemonade-tycoon.reboot.backup";
export type SaveStorage = Pick<Storage, "getItem" | "setItem">;
export interface SaveDocument {
    readonly version: 14;
    readonly state: State;
    readonly history: readonly State[];
    readonly companyId?: string;
    readonly mode?: "career" | "challenge";
}
/** A different schema is not corrupt data: never automatically replace it with a backup. */
export class UnsupportedSaveVersionError extends Error {
    constructor() { super("Unsupported save version. Keep the file as a backup."); }
}

const record = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);
const integer = (value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): value is number =>
    Number.isSafeInteger(value) && (value as number) >= min && (value as number) <= max;
const fraction = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;

const catalogWeather = (value: unknown): boolean => record(value) && WEATHER.some(weather =>
    weather.label === value.label && weather.temperature === value.temperature && weather.traffic === value.traffic);
function validPeriods(value: Record<string, unknown>): boolean {
    const forecasts = value.weatherForecast;
    if (forecasts !== undefined && (!Array.isArray(forecasts) || forecasts.length !== 3 || !forecasts.every(catalogWeather) ||
        !record(value.weather) || !["label", "temperature", "traffic"].every(key => forecasts[0][key] === (value.weather as Record<string, unknown>)[key]))) return false;
    const b = value.business;
    if (!record(b)) return true;
    if (b.periods === undefined) return forecasts === undefined && b.activePeriod === undefined;
    const p = b.periods;
    if (!Array.isArray(forecasts) || !record(p) || p.model !== "arrival-periods-v1" || b.conditions !== undefined ||
        !["purchase-first-v1", "eleven-profiles-v1"].includes(String(b.customerModel)) || !Array.isArray(p.actual) || p.actual.length !== 3 ||
        !p.actual.every(weather => record(weather) && ["Sunny", "Cloudy", "Rainy"].includes(String(weather.label)) &&
            integer(weather.temperature, 10, 40) && WEATHER.some(w => w.label === weather.label && w.traffic === weather.traffic)) ||
        !Array.isArray(p.quotas) || p.quotas.length !== 3 || !p.quotas.every(n => integer(n, 0, 500)) ||
        p.quotas.reduce((sum: number, n: number) => sum + n, 0) !== b.traffic ||
        !integer(b.traffic, 1, 500) || !integer(b.activePeriod, 0, 2)) return false;
    const boundary = weatherPeriod(p.quotas as unknown as Three<number>, value.phase === "results" ? b.traffic : 1);
    return b.activePeriod === boundary;
}

function validLocations(value: Record<string, unknown>, preTenLocations = false): boolean {
    const ids: readonly LocationId[] = preTenLocations ? LEGACY_LOCATION_IDS : LOCATION_IDS;
    const allowed = (id: unknown): id is LocationId => isLocation(id) && ids.includes(id);
    if (preTenLocations && record(value.locationStats) && LOCATION_IDS.some(id => {
        if (allowed(id)) return false;
        const rating = (value.locationStats as Record<string, unknown>)[id];
        return rating !== undefined && (!record(rating) || rating.satisfaction !== 0.5 || rating.popularity !== 0.5);
    })) return false;
    if (!allowed(value.location) || !integer(value.lifetimeRevenue) ||
        !Array.isArray(value.unlocked) || !value.unlocked.every(allowed) ||
        new Set(value.unlocked).size !== value.unlocked.length || !value.unlocked.includes("neighborhood") ||
        !value.unlocked.includes(value.location) ||
        (value.pendingLocation !== null && (!allowed(value.pendingLocation) ||
            !value.unlocked.includes(value.pendingLocation) || value.pendingLocation === value.location)) ||
        !record(value.locationStats) || !ids.every(id => {
            const rating = (value.locationStats as Record<string, unknown>)[id];
            return record(rating) && fraction(rating.satisfaction) && fraction(rating.popularity);
        }) || !record(value.daily)) return false;
    if ((value.locationStats[value.location] as Record<string, unknown>).satisfaction !== value.reputation) return false;
    const daily = value.daily;
    if (!integer(daily.rent, 0, 1_000_000) || !integer(daily.moveFee, 0, 1_000_000)) return false;
    if (value.business === null) return value.phase === "preparation" && daily.rent === 0 && daily.moveFee === 0;
    const b = value.business;
    if (record(b) && b.conditions !== undefined && !validConditions(b.conditions, value.location as LocationId, value.weather as unknown as Weather)) return false;
    if (!record(b) || (b.customerModel !== undefined && !["purchase-first-v1", "eleven-profiles-v1"].includes(String(b.customerModel))) ||
        (value.inventoryCosts === undefined ? b.inventoryModel !== undefined : b.inventoryModel !== "weighted-packs-v1") ||
        b.location !== value.location || !allowed(b.from) || !value.unlocked.includes(b.from) ||
        value.pendingLocation !== null || b.paid !== true || !integer(b.traffic, 1, 500) ||
        typeof b.budget !== "number" || !Number.isFinite(b.budget) || b.budget < 0.1 || b.budget > 5 ||
        !Array.isArray(b.weights) || (b.customerModel === "eleven-profiles-v1"
            ? b.weights.length !== 11 || !b.weights.every(w => integer(w, 0, 100)) || b.weights.reduce((sum: number, w: number) => sum + w, 0) !== 100
            : b.weights.length !== 3 || !b.weights.every(w => integer(w, 1, 100))) ||
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

function validEconomy(value: Record<string, unknown>): boolean {
    if (value.economy === undefined) return true;
    const economy = value.economy;
    if (!record(economy) || typeof economy.rule !== "string" || !Object.prototype.hasOwnProperty.call(PRICE_RULES, economy.rule) ||
        !record(economy.equipment) || !record(value.management) || !record(value.management.upgrades)) return false;
    const rule = pricesFor(value as unknown as State);
    return Object.keys(economy.equipment).length === Object.keys(UPGRADES).length &&
        Object.keys(UPGRADES).every(id => {
            const costs = (economy.equipment as Record<string, unknown>)[id];
            const level = ((value.management as Record<string, unknown>).upgrades as Record<string, unknown>)[id];
            const quotes = rule.upgrades[id as keyof typeof UPGRADES];
            return Array.isArray(costs) && integer(level, 0, quotes.length) && costs.length === level &&
                costs.every((cost, index) => integer(cost) && cost === quotes[index]);
        });
}
function validState(value: unknown, legacy = false, preM5 = false, preM6 = false, preFreeIce = false, preEagerPitcher = false, preCustomerModel = false, preStand = false, preTenLocations = false): value is State {
    if (!record(value) || !["preparation", "results"].includes(String(value.phase)) ||
        !integer(value.day, 1) || !integer(value.cash) || !integer(value.openingCash) ||
        !integer(value.seed, 0, 4294967295) || !fraction(value.reputation) ||
        !record(value.stock) || !record(value.plan) || !record(value.daily) || !record(value.weather) || !validPeriods(value) || !validEconomy(value) ||
        (value.customerProfileModel !== undefined && value.customerProfileModel !== "eleven-profiles-v1") ||
        (record(value.business) && ((value.business.customerModel === "eleven-profiles-v1") !== (value.customerProfileModel === "eleven-profiles-v1")))) return false;
    if (!preM6 && (!record(value.management) || !record(value.management.upgrades) ||
        !Object.entries(UPGRADES).every(([id, item]) => {
            const level = (value.management as { upgrades: Record<string, unknown> }).upgrades[id];
            return preStand && id === "stand" ? level === undefined || level === 0 : integer(level, 0, item.prices.length);
        }) ||
        !Object.prototype.hasOwnProperty.call(STAFF, String(value.management.staff)) || !Object.prototype.hasOwnProperty.call(ADS, String(value.management.advertising)) ||
        !integer(value.daily.capital) || !integer(value.daily.wages) || !integer(value.daily.advertising))) return false;
    if (!preM6) {
        const management = value.management as unknown as State["management"];
        const rule = pricesFor(value as unknown as State);
        const daily = value.daily;
        if (value.business === null ? daily.wages !== 0 || daily.advertising !== 0
            : daily.wages !== rule.wages[management.staff] || daily.advertising !== rule.advertising[management.advertising]) return false;
    }
    const stock = value.stock;
    if (!ITEM_KEYS.every(item => integer(stock[item], 0, 999))) return false;
    if (!preFreeIce && (!integer(value.freeIce, 0, stock.ice as number) || !integer(value.daily.freeIceUsed))) return false;
    const plan = value.plan;
    const oldRecipe = preCustomerModel || (record(value.business) && value.business.customerModel === undefined);
    if (preCustomerModel && record(value.business) && value.business.customerModel !== undefined) return false;
    if (!integer(plan.price, 25, 500) || !record(plan.recipe) ||
        !integer(plan.recipe.lemon, oldRecipe ? 1 : 0, oldRecipe ? 6 : 20) ||
        !integer(plan.recipe.sugar, oldRecipe ? 1 : 0, oldRecipe ? 4 : 10) ||
        !integer(plan.recipe.ice, 0, legacy ? 6 : 7)) return false;
    const forecast = value.weather;
    if (!WEATHER.some(weather => weather.label === forecast.label &&
        weather.temperature === forecast.temperature && weather.traffic === forecast.traffic)) return false;
    const daily = value.daily;
    const preparedOpening = !preEagerPitcher && value.phase === "preparation" && record(value.business) &&
        daily.pitchersMade === 1 && value.pitcherCups === cupsPerPitcher(plan.recipe as unknown as State["plan"]["recipe"]);
    if (!legacy && (!integer(value.pitcherCups, 0, 33) ||
        !integer(daily.pitchersMade) || !integer(daily.meltedIce, 0, 999) ||
        !["cup", "pitcher"].includes(String(daily.model)) ||
        ((value.phase === "results" || (value.phase === "preparation" && !preparedOpening)) && value.pitcherCups !== 0))) return false;
    for (const key of ["visitors", "sold", "rejected", "priceRejected", "passed", "soldOut",
        "abandoned", "revenue", "cost", "purchases", "satisfactionTotal"])
        if (!integer(daily[key])) return false;
    if (!preM5 && !validLocations(value, preTenLocations)) return false;
    const traffic = !preM5 && record(value.business) ? value.business.traffic as number : forecast.traffic as number;
    if ((daily.visitors as number) > traffic || (daily.sold as number) > (daily.visitors as number) ||
        daily.rejected !== (daily.priceRejected as number) + (daily.passed as number) ||
        daily.visitors !== (daily.sold as number) + (daily.rejected as number) +
            (daily.soldOut as number) + (daily.abandoned as number) ||
        (value.phase === "results" && daily.visitors !== traffic) ||
        (value.phase === "preparation" && (daily.visitors !== 0 || (!preparedOpening && daily.cost !== 0) ||
            (!legacy && ((!preparedOpening && daily.pitchersMade !== 0) || daily.model !== "pitcher"))))) return false;
    const recipe = plan.recipe as unknown as State["plan"]["recipe"];
    const unitCosts = pricesFor(value as unknown as State).unitCosts;
    const oldCost = recipe.lemon * unitCosts.lemon + recipe.sugar * unitCosts.sugar +
        recipe.ice * unitCosts.ice + unitCosts.cup;
    const freeIceUsed = preFreeIce ? 0 : daily.freeIceUsed as number;
    const perCupIce = record(value.business) && value.business.customerModel !== undefined;
    const usedIce = perCupIce ? (daily.sold as number) * recipe.ice
        : (daily.pitchersMade as number) * recipe.ice * cupsPerPitcher(recipe);
    if (!preFreeIce && (freeIceUsed > usedIce ||
        (daily.model === "cup" && freeIceUsed !== 0) || (value.phase === "preparation" && !preparedOpening && freeIceUsed !== 0))) return false;
    const expectedCost = legacy || daily.model === "cup" ? (daily.sold as number) * oldCost
        : (daily.pitchersMade as number) * (recipe.lemon * unitCosts.lemon + recipe.sugar * unitCosts.sugar)
            + usedIce * unitCosts.ice + (daily.sold as number) * unitCosts.cup - freeIceUsed * unitCosts.ice;
    if (daily.revenue !== (daily.sold as number) * (plan.price as number) ||
        (value.inventoryCosts === undefined ? daily.cost !== expectedCost
            : !validInventoryCosts(value) || (daily.cost as number) > expectedCost) ||
        (!legacy && daily.model === "pitcher" && (daily.sold as number) >
            (daily.pitchersMade as number) * cupsPerPitcher(recipe)) ||
        (!legacy && daily.model === "cup" && daily.pitchersMade !== 0) ||
        (daily.satisfactionTotal as number) > (daily.sold as number) * 100 ||
        value.cash !== (value.openingCash as number) + (daily.revenue as number) - (daily.purchases as number) -
            (preM5 ? 0 : daily.rent as number) - (preM5 ? 0 : daily.moveFee as number) - (preM6 ? 0 : daily.capital as number) -
            (preM6 ? 0 : daily.wages as number) - (preM6 ? 0 : daily.advertising as number)) return false;
    return true;
}

function validInventoryCosts(state: Record<string, unknown>): boolean {
    const costs = state.inventoryCosts;
    if (!record(costs) || !record(costs.values) || !integer(costs.opening) || !record(state.stock) || !record(state.daily)) return false;
    const stock = state.stock, values = costs.values;
    if (!ITEM_KEYS.every(item => {
        const quantity = (stock[item] as number) - (item === "ice" ? state.freeIce as number : 0);
        return integer(values[item], 0, quantity * pricesFor(state as unknown as State).unitCosts[item]) && (quantity !== 0 || values[item] === 0);
    })) return false;
    return totalCost(values as unknown as State["stock"]) + (state.daily.cost as number)
        === (costs.opening as number) + (state.daily.purchases as number);
}

export function decodeSave(raw: string): SaveDocument {
    let input: unknown;
    try { input = JSON.parse(raw); } catch { throw new Error("Save file is not valid JSON."); }
    if (!record(input) || ![0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].includes(input.version as number)) {
        if (record(input) && integer(input.version) && input.version > 14) throw new UnsupportedSaveVersionError();
        throw new Error("Unsupported save version. Keep the file as a backup.");
    }
    if ((input.version as number) < 14 && [input.state, ...(Array.isArray(input.history) ? input.history : [])].some(day =>
        record(day) && day.economy !== undefined)) throw new Error("Save data is damaged: invalid legacy price rules.");
    if ((input.version as number) < 13 && [input.state, ...(Array.isArray(input.history) ? input.history : [])].some(day =>
        record(day) && (day.inventoryCosts !== undefined || (record(day.business) && day.business.inventoryModel !== undefined))))
        throw new Error("Save data is damaged: invalid legacy inventory costs.");
    if ((input.version as number) < 12 && [input.state, ...(Array.isArray(input.history) ? input.history : [])].some(day =>
        record(day) && (day.customerProfileModel !== undefined || (record(day.business) && day.business.customerModel === "eleven-profiles-v1"))))
        throw new Error("Save data is damaged: invalid legacy customer profiles.");
    if ((input.version as number) < 11 && [input.state, ...(Array.isArray(input.history) ? input.history : [])].some(day =>
        record(day) && (day.weatherForecast !== undefined || (record(day.business) &&
            (day.business.periods !== undefined || day.business.activePeriod !== undefined)))))
        throw new Error("Save data is damaged: invalid legacy weather periods.");
    if ((input.version as number) < 10 && [input.state, ...(Array.isArray(input.history) ? input.history : [])].some(day =>
        record(day) && record(day.business) && day.business.conditions !== undefined)) throw new Error("Save data is damaged: invalid legacy weather model.");
    const legacy = input.version === 0 || input.version === 1;
    const preM5 = (input.version as number) < 3;
    const preM6 = (input.version as number) < 4;
    const preFreeIce = (input.version as number) < 5;
    const preEagerPitcher = (input.version as number) < 6;
    const preCustomerModel = (input.version as number) < 7;
    const preStand = (input.version as number) < 8;
    const preTenLocations = (input.version as number) < 9;
    if (input.companyId !== undefined && (typeof input.companyId !== "string" || !/^[a-zA-Z0-9-]{1,80}$/.test(input.companyId)))
        throw new Error("Invalid company identity.");
    if (input.mode !== undefined && input.mode !== "career" && input.mode !== "challenge") throw new Error("Invalid game mode.");
    if (!Array.isArray(input.history) ||
        !input.history.every(day => validState(day, legacy, preM5, preM6, preFreeIce, preEagerPitcher, preCustomerModel, preStand, preTenLocations)) || input.history.some(day => day.phase !== "results"))
        throw new Error("Save data is damaged or incomplete.");
    if (!validState(input.state, legacy, preM5, preM6, preFreeIce, preEagerPitcher, preCustomerModel, preStand, preTenLocations)) throw new Error("Save data is damaged or incomplete.");
    let revenue = 0;
    let unlocked: readonly LocationId[] = ["neighborhood"];
    const migrate = (day: State, lifetimeRevenue: number): State => {
        if (preFreeIce) day = { ...day, freeIce: 0, daily: { ...day.daily, freeIceUsed: 0 } };
        if (preM6) day = { ...day, management: defaultManagement(), daily: { ...day.daily, capital: 0, wages: 0, advertising: 0 } };
        if (preStand && !preM6) day = { ...day, management: { ...day.management, upgrades: { ...day.management.upgrades, stand: 0 } } };
        if (preTenLocations && !preM5) day = { ...day, locationStats: { ...defaultLocationStats(), ...day.locationStats } };
        if (!preM5) return day;
        unlocked = unlockLocations(unlocked, day.phase === "results" ? day.day : day.day - 1, lifetimeRevenue, day.reputation)
            .filter(id => !preTenLocations || (LEGACY_LOCATION_IDS as readonly LocationId[]).includes(id));
        return { ...day, pitcherCups: 0, location: "neighborhood", pendingLocation: null, unlocked, lifetimeRevenue,
            locationStats: { ...defaultLocationStats(), neighborhood: { satisfaction: day.reputation, popularity: 0.5 } },
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
    const inventoryTransition = (before: State, after: State): boolean => {
        if (!after.inventoryCosts) return !before.inventoryCosts;
        const values = inventoryValues(before);
        const paidIce = before.stock.ice - before.freeIce;
        const retainedIce = Math.floor(before.stock.ice * before.management.upgrades.refrigerator / 2)
            - Math.floor(before.freeIce * before.management.upgrades.refrigerator / 2);
        const retainedValue = paidIce === 0 ? 0 : Math.round(values.ice * retainedIce / paidIce);
        return after.inventoryCosts.opening === totalCost(values) - values.ice + retainedValue;
    };
    if (history.some((day, index) => index > 0 && !inventoryTransition(history[index - 1], day)) ||
        (history.length > 0 && state.phase === "preparation" && !inventoryTransition(history[history.length - 1], state)))
        throw new Error("Save inventory costs do not match the ledger.");
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
    const snapshots = [...history, ...(state.phase === "preparation" ? [state] : [])];
    if (snapshots.some(day => day.economy?.rule !== state.economy?.rule) ||
        snapshots.some((day, index) => day.economy && index > 0 && Object.keys(UPGRADES).some(id =>
            day.management.upgrades[id as keyof typeof UPGRADES] < snapshots[index - 1].management.upgrades[id as keyof typeof UPGRADES])))
        throw new Error("Save company price rules do not match the ledger.");
    let capital = 0;
    const paidEquipment = (day: State): boolean => {
        capital += day.daily.capital;
        return capital === equipmentValue(day);
    };
    if (!history.every(paidEquipment) || (state.phase === "preparation" && !paidEquipment(state)))
        throw new Error("Save equipment purchases do not match the ledger.");
    return { version: 14, state, history, ...(input.companyId === undefined ? {} : { companyId: input.companyId as string }),
        ...(input.mode === undefined ? {} : { mode: input.mode as "career" | "challenge" }) };
}

export function encodeSave(state: State, history: readonly State[], companyId?: string, mode?: "career" | "challenge"): string {
    if (state.phase === "selling") throw new Error("Save a checkpoint before opening the stand.");
    return JSON.stringify(decodeSave(JSON.stringify({ version: 14, state, history, companyId, mode })));
}

export function writeSave(storage: SaveStorage, state: State, history: readonly State[], companyId?: string, mode?: "career" | "challenge"): void {
    const next = encodeSave(state, history, companyId, mode);
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
        if (error instanceof UnsupportedSaveVersionError) throw error;
        const backup = storage.getItem(BACKUP_KEY);
        if (backup) {
            try { return { document: decodeSave(backup), recovered: true }; } catch { /* Report primary failure. */ }
        }
        throw error;
    }
}
