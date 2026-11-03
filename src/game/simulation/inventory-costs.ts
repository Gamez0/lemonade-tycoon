import { ITEMS, ITEM_KEYS, type Item } from "../content/catalog";
import type { State, Stock } from "./game";

export interface InventoryCosts { readonly values: Stock; readonly opening: number }
export const totalCost = (values: Stock): number => ITEM_KEYS.reduce((sum, item) => sum + values[item], 0);
export const paidQuantity = (state: State, item: Item): number => state.stock[item] - (item === "ice" ? state.freeIce : 0);
export function inventoryValues(state: State): Stock {
    return state.inventoryCosts?.values ?? { lemon: state.stock.lemon * ITEMS.lemon.cost,
        sugar: state.stock.sugar * ITEMS.sugar.cost, ice: paidQuantity(state, "ice") * ITEMS.ice.cost,
        cup: state.stock.cup * ITEMS.cup.cost };
}
/** Adopt at an unpaid boundary, never while decoding/replaying an old paid day. */
export function withInventoryCosts(state: State): State {
    if (state.phase !== "preparation" || state.business || state.inventoryCosts) return state;
    const values = inventoryValues(state);
    // Some older accepted documents lack enough stock to reconcile today's buys.
    // Keep their old rules until tomorrow rather than invent a negative cost basis.
    if (totalCost(values) < state.daily.purchases) return state;
    return { ...state, inventoryCosts: { values, opening: totalCost(values) - state.daily.purchases } };
}
export function allocatedCost(state: State, item: Item, quantity: number): number {
    if (!state.inventoryCosts) return quantity * ITEMS[item].cost;
    if (quantity === 0) return 0;
    return Math.round(state.inventoryCosts.values[item] * quantity / paidQuantity(state, item));
}
export function consumeCosts(state: State, quantities: Stock): { inventoryCosts: InventoryCosts | undefined; cost: number } {
    const values = inventoryValues(state), consumed = { ...values };
    let cost = 0;
    for (const item of ITEM_KEYS) {
        const amount = allocatedCost(state, item, quantities[item]);
        cost += amount;
        consumed[item] -= amount;
    }
    return { inventoryCosts: state.inventoryCosts ? { ...state.inventoryCosts, values: consumed } : undefined, cost };
}
