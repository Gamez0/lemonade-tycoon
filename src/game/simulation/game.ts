import { UPGRADES, STAFF, ADS, defaultManagement } from "../content/management";
import type { Management, Upgrade } from "../content/management";
import { CUSTOMERS, ITEMS, ITEM_KEYS, WEATHER } from "../content/catalog";
import type { Item, Weather } from "../content/catalog";
import { LOCATIONS, LOCATION_IDS, isLocation } from "../content/locations";
import type { LocationId } from "../content/locations";

export interface LocationRating { readonly satisfaction: number; readonly popularity: number }
export interface BusinessDay {
    readonly location: LocationId;
    readonly from: LocationId;
    readonly traffic: number;
    readonly budget: number;
    readonly weights: readonly number[];
    readonly patienceTicks: number;
    readonly arrivalEvery: number;
    readonly serviceTicks: number;
    readonly satisfaction: number;
    readonly popularity: number;
    readonly rent: number;
    readonly moveFee: number;
    readonly paid: true;
}

export type Stock = Readonly<Record<Item, number>>;
export interface Recipe { readonly lemon: number; readonly sugar: number; readonly ice: number }
export interface Plan { readonly recipe: Recipe; readonly price: number }
export interface Daily {
    readonly capital: number;
    readonly wages: number;
    readonly advertising: number;
    readonly model: "cup" | "pitcher";
    readonly pitchersMade: number;
    readonly meltedIce: number;
    readonly visitors: number;
    readonly sold: number;
    readonly rejected: number;
    readonly priceRejected: number;
    readonly passed: number;
    readonly soldOut: number;
    readonly abandoned: number;
    readonly revenue: number;
    readonly cost: number;
    readonly purchases: number;
    readonly rent: number;
    readonly moveFee: number;
    readonly satisfactionTotal: number;
}
export interface State {
    readonly management: Management;
    readonly phase: "preparation" | "selling" | "results";
    readonly day: number;
    readonly cash: number;
    readonly openingCash: number;
    readonly stock: Stock;
    readonly pitcherCups: number;
    readonly plan: Plan;
    readonly weather: Weather;
    readonly reputation: number;
    readonly seed: number;
    readonly daily: Daily;
    readonly location: LocationId;
    readonly pendingLocation: LocationId | null;
    readonly unlocked: readonly LocationId[];
    readonly locationStats: Readonly<Record<LocationId, LocationRating>>;
    readonly lifetimeRevenue: number;
    readonly business: BusinessDay | null;
}
export interface CustomerEvent {
    readonly id: number;
    readonly kind: "bought" | "price" | "passed" | "sold-out" | "abandoned";
    readonly profile: number;
    readonly satisfaction: number | null;
}
export interface Visitor {
    readonly id: number;
    readonly profile: number;
    readonly intent: "buy" | "price" | "passed";
    readonly willingness: number;
}

const emptyDaily = (meltedIce = 0): Daily => ({ capital: 0, wages: 0, advertising: 0, model: "pitcher", pitchersMade: 0, meltedIce,
    visitors: 0, sold: 0, rejected: 0, priceRejected: 0, passed: 0, soldOut: 0, abandoned: 0,
    revenue: 0, cost: 0, purchases: 0, rent: 0, moveFee: 0, satisfactionTotal: 0 });
const PITCHER_CUPS = [10, 11, 12, 14, 16, 20, 25, 33] as const;
export const cupsPerPitcher = (recipe: Recipe): number => PITCHER_CUPS[recipe.ice];
export const pitcherCost = (recipe: Recipe): number =>
    recipe.lemon * ITEMS.lemon.cost + recipe.sugar * ITEMS.sugar.cost +
    recipe.ice * cupsPerPitcher(recipe) * ITEMS.ice.cost;
const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
function integer(n: number, min: number, max: number, label: string): void {
    if (!Number.isSafeInteger(n) || n < min || n > max) throw new Error(`${label} must be ${min}–${max}.`);
}
function phase(state: State, expected: State["phase"]): void {
    if (state.phase !== expected) throw new Error(`This action requires ${expected}.`);
}
function random(seed: number): { seed: number; value: number } {
    const next = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return { seed: next, value: next / 4294967296 };
}
function forecast(seed: number): { seed: number; weather: Weather } {
    const roll = random(seed);
    return { seed: roll.seed, weather: WEATHER[Math.floor(roll.value * WEATHER.length)] };
}
export function newGame(seed = 2026): State {
    integer(seed, 0, 4294967295, "Seed");
    return { management: defaultManagement(), phase: "preparation", day: 1, cash: 4000, openingCash: 4000,
        stock: { lemon: 0, sugar: 0, ice: 0, cup: 0 }, pitcherCups: 0,
        plan: { recipe: { lemon: 2, sugar: 1, ice: 2 }, price: 150 },
        location: "neighborhood", pendingLocation: null, unlocked: ["neighborhood"],
        locationStats: { neighborhood: { satisfaction: 0.5, popularity: 0.5 },
            park: { satisfaction: 0.5, popularity: 0.5 }, downtown: { satisfaction: 0.5, popularity: 0.5 } },
        lifetimeRevenue: 0, business: null,
        reputation: 0.5, daily: emptyDaily(), ...forecast(seed) };
}
export function setPlan(state: State, plan: Plan): State {
    phase(state, "preparation");
    integer(plan.price, 25, 500, "Price (cents)");
    integer(plan.recipe.lemon, 1, 6, "Lemon");
    integer(plan.recipe.sugar, 1, 4, "Sugar");
    integer(plan.recipe.ice, 0, 7, "Ice");
    return { ...state, plan: { price: plan.price, recipe: { ...plan.recipe } } };
}
export function buy(state: State, item: Item, quantity: number): State {
    phase(state, "preparation");
    if (!ITEM_KEYS.includes(item)) throw new Error("Unknown supply.");
    integer(quantity, 1, 999, "Quantity");
    if (state.stock[item] + quantity > 999) throw new Error("Storage limit is 999 per ingredient.");
    const cost = ITEMS[item].cost * quantity;
    if (cost > state.cash) throw new Error("Not enough cash for these supplies.");
    return { ...state, cash: state.cash - cost, stock: { ...state.stock, [item]: state.stock[item] + quantity },
        daily: { ...state.daily, purchases: state.daily.purchases + cost } };
}
/** Checkout is all-or-nothing: immutable intermediate states never escape on failure. */
export function buyOrder(state: State, order: Stock): State {
    phase(state, "preparation");
    for (const item of ITEM_KEYS) integer(order[item], 0, 999, "Order quantity");
    if (ITEM_KEYS.every(item => order[item] === 0)) throw new Error("Choose supplies before buying.");
    return ITEM_KEYS.reduce((next, item) => order[item] === 0 ? next : buy(next, item, order[item]), state);
}

export function unitCost(recipe: Recipe): number {
    return pitcherCost(recipe) / cupsPerPitcher(recipe) + ITEMS.cup.cost;
}
export function capacity(state: State): number {
    const { stock, plan: { recipe } } = state;
    const newPitchers = Math.min(Math.floor(stock.lemon / recipe.lemon), Math.floor(stock.sugar / recipe.sugar),
        recipe.ice === 0 ? Infinity : Math.floor(stock.ice / (recipe.ice * cupsPerPitcher(recipe))));
    return Math.min(stock.cup, state.pitcherCups + newPitchers * cupsPerPitcher(recipe));
}
export function quality(recipe: Recipe, temperature: number): number {
    const balance = Math.abs(recipe.lemon / recipe.sugar - 2) * 0.2;
    const preferredIce = temperature >= 30 ? 4 : temperature >= 25 ? 3 : temperature >= 21 ? 2 : 1;
    return clamp(1 - balance - Math.abs(recipe.ice - preferredIce) * 0.12);
}
export function demand(plan: Plan, weather: Weather, reputation: number, profile: number, variation: number): {
    willingness: number; probability: number;
} {
    const taste = quality(plan.recipe, weather.temperature);
    const willingness = Math.round((115 + (weather.temperature - 18) * 5 + taste * 75 + reputation * 40)
        * CUSTOMERS[profile].budget * (0.85 + variation * 0.3));
    const probability = clamp(0.25 + taste * 0.35 + reputation * 0.2 + (weather.temperature - 18) * 0.008
        - plan.price / 1000 - (weather.label === "Rainy" ? 0.08 : 0), 0.03, 0.95);
    return { willingness, probability };
}
export function openDay(state: State): State {
    phase(state, "preparation");
    // A restored, already-paid opening checkpoint replays the same day without another fee.
    if (state.business) {
        if (capacity(state) === 0) throw new Error("Buy enough supplies for one pitcher and a cup before opening.");
        return { ...state, phase: "selling" };
    }
    const id = state.pendingLocation ?? state.location;
    const location = LOCATIONS[id], rating = state.locationStats[id];
    const moveFee = id === state.location ? 0 : location.moveFee;
    const staff = STAFF[state.management.staff], advertising = ADS[state.management.advertising];
    const ice = Math.min(999 - state.stock.ice, state.management.upgrades.iceMaker * 60);
    if (capacity({ ...state, stock: { ...state.stock, ice: state.stock.ice + ice } }) === 0)
        throw new Error("Buy enough supplies for one pitcher and a cup before opening.");
    const production = ice * ITEMS.ice.cost;
    const fees = location.rent + moveFee + staff.wage + advertising.cost + production;
    if (state.cash < fees)
        throw new Error("Not enough cash for opening costs. Reduce advertising, dismiss staff or return to the free Neighborhood.");
    const business: BusinessDay = { location: id, from: state.location,
        traffic: Math.round(state.weather.traffic * location.traffic * (0.8 + 0.4 * rating.popularity) * advertising.traffic),
        budget: location.budget, weights: [...location.weights], patienceTicks: location.patience + staff.patience,
        arrivalEvery: Math.max(1, Math.round(location.arrival / advertising.traffic)), serviceTicks: 8 - state.management.upgrades.blender - staff.speed, satisfaction: rating.satisfaction,
        popularity: rating.popularity, rent: location.rent, moveFee, paid: true };
    return { ...state, phase: "selling", location: id, pendingLocation: null, business,
        reputation: rating.satisfaction, cash: state.cash - fees, stock: { ...state.stock, ice: state.stock.ice + ice },
        daily: { ...state.daily, rent: location.rent, moveFee, wages: staff.wage, advertising: advertising.cost, purchases: state.daily.purchases + production } };
}
export function reserveLocation(state: State, id: LocationId | null): State {
    phase(state, "preparation");
    if (state.business) throw new Error("Today's location is already paid. Change locations after this day.");
    if (id !== null && (!isLocation(id) || !state.unlocked.includes(id))) throw new Error("This location is locked.");
    return { ...state, pendingLocation: id === state.location ? null : id };
}
export function expectedTraffic(state: State, id = state.pendingLocation ?? state.location): number {
    return state.business?.traffic ?? Math.round(state.weather.traffic * LOCATIONS[id].traffic *
        (0.8 + 0.4 * state.locationStats[id].popularity) * ADS[state.management.advertising].traffic);
}
export const dayTraffic = (state: State): number => state.business?.traffic ?? state.weather.traffic;
export function unlockLocations(unlocked: readonly LocationId[], days: number, revenue: number, satisfaction: number): readonly LocationId[] {
    return LOCATION_IDS.filter(id => unlocked.includes(id) || (days >= LOCATIONS[id].days &&
        revenue >= LOCATIONS[id].revenue && satisfaction >= LOCATIONS[id].satisfaction));
}
/** Minimum legal one-pitcher purchase; no automatic reset or sale of leftover inventory. */
export function isBankrupt(state: State): boolean {
    if (state.phase !== "preparation") return false;
    // The cheapest legal recipe is 1 lemon / 1 sugar / no ice and one cup.
    const needed = Math.max(0, 1 - state.stock.lemon) * ITEMS.lemon.cost +
        Math.max(0, 1 - state.stock.sugar) * ITEMS.sugar.cost + Math.max(0, 1 - state.stock.cup) * ITEMS.cup.cost;
    return state.cash < needed;
}
export function drawVisitor(state: State, id: number): { state: State; visitor: Visitor } {
    phase(state, "selling");
    const a = random(state.seed), b = random(a.seed), c = random(b.seed);
    const weights = state.business!.weights;
    let profile = 0, roll = a.value * weights.reduce((total, weight) => total + weight, 0);
    while (profile < weights.length - 1 && roll >= weights[profile]) roll -= weights[profile++];
    const decision = demand(state.plan, state.weather, state.business!.satisfaction, profile, b.value);
    const willingness = Math.round(decision.willingness * state.business!.budget);
    const intent: Visitor["intent"] = state.plan.price > willingness ? "price"
        : c.value >= decision.probability ? "passed" : "buy";
    return { state: { ...state, seed: c.seed }, visitor: { id, profile, intent, willingness } };
}
export function settleVisitor(state: State, visitor: Visitor, outcome?: "abandoned"): { state: State; event: CustomerEvent } {
    phase(state, "selling");
    const kind: CustomerEvent["kind"] = outcome ?? (visitor.intent !== "buy" ? visitor.intent
        : capacity(state) === 0 ? "sold-out" : "bought");
    const sold = kind === "bought";
    const satisfaction = sold ? Math.round(clamp(quality(state.plan.recipe, state.weather.temperature) * 0.8
        + clamp(1 - state.plan.price / (visitor.willingness * 1.4)) * 0.2) * 100) : null;
    const makePitcher = sold && state.pitcherCups === 0;
    const recipe = state.plan.recipe;
    const stock: Stock = sold ? {
        lemon: state.stock.lemon - (makePitcher ? recipe.lemon : 0),
        sugar: state.stock.sugar - (makePitcher ? recipe.sugar : 0),
        ice: state.stock.ice - (makePitcher ? recipe.ice * cupsPerPitcher(recipe) : 0), cup: state.stock.cup - 1,
    } : state.stock;
    const daily: Daily = { ...state.daily, visitors: state.daily.visitors + 1,
        sold: state.daily.sold + Number(sold), rejected: state.daily.rejected + Number(kind === "price" || kind === "passed"),
        priceRejected: state.daily.priceRejected + Number(kind === "price"),
        passed: state.daily.passed + Number(kind === "passed"),
        soldOut: state.daily.soldOut + Number(kind === "sold-out"),
        abandoned: state.daily.abandoned + Number(kind === "abandoned"),
        revenue: state.daily.revenue + (sold ? state.plan.price : 0),
        cost: state.daily.cost + (makePitcher ? pitcherCost(recipe) : 0) + (sold ? ITEMS.cup.cost : 0),
        pitchersMade: state.daily.pitchersMade + Number(makePitcher),
        satisfactionTotal: state.daily.satisfactionTotal + (satisfaction ?? 0) };
    const finished = daily.visitors >= dayTraffic(state);
    const oldRating = state.locationStats[state.location];
    const satisfactionRating = finished && daily.sold > 0 ?
        clamp(oldRating.satisfaction * 0.65 + daily.satisfactionTotal / daily.sold / 100 * 0.35) : oldRating.satisfaction;
    const locationStats = finished && daily.sold > 0 ? { ...state.locationStats,
        [state.location]: { satisfaction: satisfactionRating, popularity: oldRating.popularity * 0.8 + satisfactionRating * 0.2 } } : state.locationStats;
    const lifetimeRevenue = state.lifetimeRevenue + (finished ? daily.revenue : 0);
    return { state: { ...state, stock, daily, cash: state.cash + (sold ? state.plan.price : 0),
        pitcherCups: finished ? 0 : state.pitcherCups + (makePitcher ? cupsPerPitcher(recipe) : 0) - Number(sold),
        phase: finished ? "results" : "selling",
        reputation: satisfactionRating, locationStats, lifetimeRevenue,
        unlocked: finished ? unlockLocations(state.unlocked, state.day, lifetimeRevenue, satisfactionRating) : state.unlocked },
        event: { id: visitor.id, kind, profile: visitor.profile, satisfaction } };
}
export function stepCustomer(state: State): { state: State; event: CustomerEvent } {
    const draw = drawVisitor(state, state.daily.visitors + 1);
    return settleVisitor(draw.state, draw.visitor);
}
export function nextDay(state: State): State {
    phase(state, "results");
    return { ...state, phase: "preparation", day: state.day + 1, openingCash: state.cash,
        stock: { ...state.stock, ice: Math.floor(state.stock.ice * state.management.upgrades.refrigerator / 2) }, pitcherCups: 0,
        business: null, pendingLocation: null,
        daily: emptyDaily(state.stock.ice - Math.floor(state.stock.ice * state.management.upgrades.refrigerator / 2)), ...forecast(state.seed) };
}
export function results(state: State): { profit: number; cashChange: number; satisfaction: number | null } {
    return { profit: state.daily.revenue - state.daily.cost - state.daily.rent - state.daily.moveFee - state.daily.wages - state.daily.advertising,
        cashChange: state.cash - state.openingCash,
        satisfaction: state.daily.sold === 0 ? null : Math.round(state.daily.satisfactionTotal / state.daily.sold) };
}

function editableManagement(state: State): void {
    phase(state, "preparation");
    if (state.business) throw new Error("Management is fixed for this paid opening. Change it tomorrow.");
}
export function purchaseUpgrade(state: State, id: Upgrade): State {
    editableManagement(state);
    const item = UPGRADES[id];
    if (!Object.prototype.hasOwnProperty.call(UPGRADES, id)) throw new Error("Unknown upgrade.");
    const level = state.management.upgrades[id];
    if (level >= 2) throw new Error("This equipment is fully upgraded.");
    const price = item.prices[level];
    if (state.cash < price) throw new Error("Not enough cash for this upgrade.");
    return { ...state, cash: state.cash - price,
        daily: { ...state.daily, capital: state.daily.capital + price },
        management: { ...state.management, upgrades: { ...state.management.upgrades, [id]: level + 1 } } };
}
export function hireStaff(state: State, id: Management["staff"]): State {
    editableManagement(state);
    if (!Object.prototype.hasOwnProperty.call(STAFF, id)) throw new Error("Unknown staff candidate.");
    return { ...state, management: { ...state.management, staff: id } };
}
export function selectAdvertising(state: State, id: Management["advertising"]): State {
    editableManagement(state);
    if (!Object.prototype.hasOwnProperty.call(ADS, id)) throw new Error("Unknown advertising.");
    return { ...state, management: { ...state.management, advertising: id } };
}
