import { CUSTOMERS, ITEMS, ITEM_KEYS, WEATHER } from "../content/catalog";
import type { Item, Weather } from "../content/catalog";

export type Stock = Readonly<Record<Item, number>>;
export interface Recipe { readonly lemon: number; readonly sugar: number; readonly ice: number }
export interface Plan { readonly recipe: Recipe; readonly price: number }
export interface Daily {
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
    readonly satisfactionTotal: number;
}
export interface State {
    readonly phase: "preparation" | "selling" | "results";
    readonly day: number;
    readonly cash: number;
    readonly openingCash: number;
    readonly stock: Stock;
    readonly plan: Plan;
    readonly weather: Weather;
    readonly reputation: number;
    readonly seed: number;
    readonly daily: Daily;
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

const emptyDaily = (): Daily => ({ visitors: 0, sold: 0, rejected: 0, priceRejected: 0, passed: 0, soldOut: 0, abandoned: 0,
    revenue: 0, cost: 0, purchases: 0, satisfactionTotal: 0 });
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
    return { phase: "preparation", day: 1, cash: 4000, openingCash: 4000,
        stock: { lemon: 0, sugar: 0, ice: 0, cup: 0 },
        plan: { recipe: { lemon: 2, sugar: 1, ice: 2 }, price: 150 },
        reputation: 0.5, daily: emptyDaily(), ...forecast(seed) };
}
export function setPlan(state: State, plan: Plan): State {
    phase(state, "preparation");
    integer(plan.price, 25, 500, "Price (cents)");
    integer(plan.recipe.lemon, 1, 6, "Lemon");
    integer(plan.recipe.sugar, 1, 4, "Sugar");
    integer(plan.recipe.ice, 0, 6, "Ice");
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
    return recipe.lemon * ITEMS.lemon.cost + recipe.sugar * ITEMS.sugar.cost + recipe.ice * ITEMS.ice.cost + ITEMS.cup.cost;
}
export function capacity(state: State): number {
    const { stock, plan: { recipe } } = state;
    return Math.min(stock.cup, Math.floor(stock.lemon / recipe.lemon), Math.floor(stock.sugar / recipe.sugar),
        recipe.ice === 0 ? Infinity : Math.floor(stock.ice / recipe.ice));
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
    if (capacity(state) === 0) throw new Error("Buy enough supplies for at least one cup before opening.");
    return { ...state, phase: "selling" };
}
export function drawVisitor(state: State, id: number): { state: State; visitor: Visitor } {
    phase(state, "selling");
    const a = random(state.seed), b = random(a.seed), c = random(b.seed);
    const profile = Math.floor(a.value * CUSTOMERS.length);
    const decision = demand(state.plan, state.weather, state.reputation, profile, b.value);
    const intent: Visitor["intent"] = state.plan.price > decision.willingness ? "price"
        : c.value >= decision.probability ? "passed" : "buy";
    return { state: { ...state, seed: c.seed }, visitor: { id, profile, intent, willingness: decision.willingness } };
}
export function settleVisitor(state: State, visitor: Visitor, outcome?: "abandoned"): { state: State; event: CustomerEvent } {
    phase(state, "selling");
    const kind: CustomerEvent["kind"] = outcome ?? (visitor.intent !== "buy" ? visitor.intent
        : capacity(state) === 0 ? "sold-out" : "bought");
    const sold = kind === "bought";
    const satisfaction = sold ? Math.round(clamp(quality(state.plan.recipe, state.weather.temperature) * 0.8
        + clamp(1 - state.plan.price / (visitor.willingness * 1.4)) * 0.2) * 100) : null;
    const stock: Stock = sold ? {
        lemon: state.stock.lemon - state.plan.recipe.lemon,
        sugar: state.stock.sugar - state.plan.recipe.sugar,
        ice: state.stock.ice - state.plan.recipe.ice, cup: state.stock.cup - 1,
    } : state.stock;
    const daily: Daily = { ...state.daily, visitors: state.daily.visitors + 1,
        sold: state.daily.sold + Number(sold), rejected: state.daily.rejected + Number(kind === "price" || kind === "passed"),
        priceRejected: state.daily.priceRejected + Number(kind === "price"),
        passed: state.daily.passed + Number(kind === "passed"),
        soldOut: state.daily.soldOut + Number(kind === "sold-out"),
        abandoned: state.daily.abandoned + Number(kind === "abandoned"),
        revenue: state.daily.revenue + (sold ? state.plan.price : 0), cost: state.daily.cost + (sold ? unitCost(state.plan.recipe) : 0),
        satisfactionTotal: state.daily.satisfactionTotal + (satisfaction ?? 0) };
    const finished = daily.visitors >= state.weather.traffic;
    return { state: { ...state, stock, daily, cash: state.cash + (sold ? state.plan.price : 0),
        phase: finished ? "results" : "selling",
        reputation: finished && daily.sold > 0 ? clamp(state.reputation * 0.65 + daily.satisfactionTotal / daily.sold / 100 * 0.35) : state.reputation },
        event: { id: visitor.id, kind, profile: visitor.profile, satisfaction } };
}
export function stepCustomer(state: State): { state: State; event: CustomerEvent } {
    const draw = drawVisitor(state, state.daily.visitors + 1);
    return settleVisitor(draw.state, draw.visitor);
}
export function nextDay(state: State): State {
    phase(state, "results");
    return { ...state, phase: "preparation", day: state.day + 1, openingCash: state.cash,
        daily: emptyDaily(), ...forecast(state.seed) };
}
export function results(state: State): { profit: number; cashChange: number; satisfaction: number | null } {
    return { profit: state.daily.revenue - state.daily.cost,
        cashChange: state.cash - state.openingCash,
        satisfaction: state.daily.sold === 0 ? null : Math.round(state.daily.satisfactionTotal / state.daily.sold) };
}
