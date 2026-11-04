import type { Item } from "./catalog";
import { LEGACY_PRICES, type PriceRule } from "./price-rules";

export interface SupplyPack { readonly quantity: number; readonly price: number }
// Confirmed original ice/cup quotes. Other product packs remain unchanged.
export function supplyPacks(item: Item, bulk: boolean, rule: PriceRule = LEGACY_PRICES): readonly SupplyPack[] {
    if (bulk && (item === "ice" || item === "cup")) return rule.bulk[item];
    return [1, 2, 5].map(size => ({ quantity: size * rule.bundles[item],
        price: size * rule.bundles[item] * rule.unitCosts[item] }));
}
/** Cheapest legal quoted order that covers a shortfall within current storage. */
export function minimumPackCost(item: Item, needed: number, room: number, rule: PriceRule = LEGACY_PRICES): number {
    if (needed === 0) return 0;
    const costs = Array<number>(room + 1).fill(Infinity);
    costs[0] = 0;
    for (const pack of supplyPacks(item, true, rule)) for (let quantity = pack.quantity; quantity <= room; quantity++)
        costs[quantity] = Math.min(costs[quantity], costs[quantity - pack.quantity] + pack.price);
    return Math.min(...costs.slice(needed));
}
