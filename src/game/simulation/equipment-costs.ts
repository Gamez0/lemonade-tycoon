import { NEW_COMPANY_PRICE_RULE, LEGACY_PRICES } from "../content/price-rules";
import { UPGRADES, type Upgrade } from "../content/management";
import type { State } from "./game";

/** Only fresh company creation opts in; restored companies keep their historical contract. */
export function withCompanyEconomy(state: State): State {
    if (state.economy) return state;
    if (state.day !== 1 || state.phase !== "preparation" || state.business || state.daily.capital !== 0 ||
        state.daily.purchases !== 0 || state.lifetimeRevenue !== 0 || Object.values(state.stock).some(quantity => quantity !== 0) ||
        Object.values(state.management.upgrades).some(level => level !== 0)) throw new Error("Price rules require a new company.");
    return { ...state, economy: { rule: NEW_COMPANY_PRICE_RULE,
        equipment: { refrigerator: [], iceMaker: [], blender: [], stand: [] } } };
}
export function equipmentValue(state: State): number {
    return (Object.keys(UPGRADES) as Upgrade[]).reduce((sum, id) => sum +
        (state.economy?.equipment[id] ?? LEGACY_PRICES.upgrades[id].slice(0, state.management.upgrades[id]))
            .reduce((value, price) => value + price, 0), 0);
}
