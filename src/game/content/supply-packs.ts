import { ITEMS, type Item } from "./catalog";

export interface SupplyPack { readonly quantity: number; readonly price: number }
// Confirmed original ice/cup quotes. Other product packs remain unchanged.
const BULK_PACKS = {
    ice: [{ quantity: 50, price: 100 }, { quantity: 200, price: 300 }, { quantity: 500, price: 500 }],
    cup: [{ quantity: 75, price: 100 }, { quantity: 225, price: 235 }, { quantity: 400, price: 375 }],
} as const;
export function supplyPacks(item: Item, bulk: boolean): readonly SupplyPack[] {
    if (bulk && (item === "ice" || item === "cup")) return BULK_PACKS[item];
    return [1, 2, 5].map(size => ({ quantity: size * ITEMS[item].bundle,
        price: size * ITEMS[item].bundle * ITEMS[item].cost }));
}
/** Cheapest legal quoted order that covers a shortfall within current storage. */
export function minimumPackCost(item: Item, needed: number, room: number): number {
    if (needed === 0) return 0;
    const costs = Array<number>(room + 1).fill(Infinity);
    costs[0] = 0;
    for (const pack of supplyPacks(item, true)) for (let quantity = pack.quantity; quantity <= room; quantity++)
        costs[quantity] = Math.min(costs[quantity], costs[quantity - pack.quantity] + pack.price);
    return Math.min(...costs.slice(needed));
}
