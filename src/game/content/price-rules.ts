import type { Item } from "./catalog";
import type { Management, Upgrade } from "./management";
import type { LocationId } from "./locations";

export interface PriceRule {
    readonly upgrades: Readonly<Record<Upgrade, readonly number[]>>;
    readonly wages: Readonly<Record<Management["staff"], number>>;
    readonly advertising: Readonly<Record<Management["advertising"], number>>;
    readonly locations: Readonly<Record<LocationId, { readonly rent: number; readonly moveFee: number }>>;
    readonly unitCosts: Readonly<Record<Item, number>>;
    readonly bundles: Readonly<Record<Item, number>>;
    readonly bulk: Readonly<Record<"ice" | "cup", readonly { readonly quantity: number; readonly price: number }[]>>;
}
function freeze<T>(value: T): T {
    if (value && typeof value === "object") {
        for (const child of Object.values(value)) freeze(child);
        Object.freeze(value);
    }
    return value;
}
/** Historical contract. Add a new rule for new companies; never edit this table. */
export const LEGACY_PRICES: PriceRule = freeze({
    upgrades: { refrigerator: [900, 1700], iceMaker: [1200, 2200], blender: [1400, 2600], stand: [44999, 99999, 999999] },
    wages: { none: 0, server: 250, host: 180 }, advertising: { none: 0, flyers: 180, radio: 450 },
    locations: {
        neighborhood: { rent: 0, moveFee: 0 }, park: { rent: 200, moveFee: 100 }, downtown: { rent: 500, moveFee: 300 },
        beach: { rent: 800, moveFee: 400 }, "old-square": { rent: 2000, moveFee: 1000 },
        "train-station": { rent: 600, moveFee: 300 }, mall: { rent: 1000, moveFee: 500 }, marina: { rent: 1000, moveFee: 500 },
        stadium: { rent: 3000, moveFee: 1500 }, "magic-gardens": { rent: 2000, moveFee: 1000 },
    },
    unitCosts: { lemon: 8, sugar: 4, ice: 2, cup: 6 }, bundles: { lemon: 40, sugar: 20, ice: 60, cup: 20 },
    bulk: {
        ice: [{ quantity: 50, price: 100 }, { quantity: 200, price: 300 }, { quantity: 500, price: 500 }],
        cup: [{ quantity: 75, price: 100 }, { quantity: 225, price: 235 }, { quantity: 400, price: 375 }],
    },
});
export const PRICE_RULES = Object.freeze({ "legacy-v1": LEGACY_PRICES });
export type PriceRuleId = keyof typeof PRICE_RULES;
export const NEW_COMPANY_PRICE_RULE: PriceRuleId = "legacy-v1";
export interface Economy {
    readonly rule: PriceRuleId;
    /** Individual acquisition prices, in purchase order, independent of today's quote. */
    readonly equipment: Readonly<Record<Upgrade, readonly number[]>>;
}
export interface EconomyOwner { readonly economy?: Economy }
/** Missing metadata always means legacy, even after the new-company default changes. */
export function pricesFor(owner: EconomyOwner, rules: Readonly<Record<string, PriceRule>> = PRICE_RULES): PriceRule {
    const id = owner.economy?.rule ?? "legacy-v1";
    if (!Object.prototype.hasOwnProperty.call(rules, id)) throw new Error("Unknown company price rule.");
    return rules[id];
}
