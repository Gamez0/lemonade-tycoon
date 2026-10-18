import { INITIAL_CAPITAL, type State } from "../simulation/game";
import { ITEMS, ITEM_KEYS } from "../content/catalog";
import { UPGRADES, type Upgrade } from "../content/management";

export function balanceSheet(state: State) {
    const inventory = ITEM_KEYS.reduce((total, item) => total +
        (state.stock[item] - (item === "ice" ? state.freeIce : 0)) * ITEMS[item].cost, 0);
    const equipment = (Object.keys(UPGRADES) as Upgrade[]).reduce((total, id) => total +
        UPGRADES[id].prices.slice(0, state.management.upgrades[id]).reduce((sum: number, price) => sum + price, 0), 0);
    const assets = state.cash + inventory + equipment;
    return { cash: state.cash, inventory, equipment, assets, capital: INITIAL_CAPITAL,
        netAssetChange: assets - INITIAL_CAPITAL };
}
