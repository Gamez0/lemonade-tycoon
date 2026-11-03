import { INITIAL_CAPITAL, type State } from "../simulation/game";
import { inventoryValues, totalCost } from "../simulation/inventory-costs";
import { UPGRADES, type Upgrade } from "../content/management";

export function balanceSheet(state: State) {
    const inventory = totalCost(inventoryValues(state));
    const equipment = (Object.keys(UPGRADES) as Upgrade[]).reduce((total, id) => total +
        UPGRADES[id].prices.slice(0, state.management.upgrades[id]).reduce((sum: number, price) => sum + price, 0), 0);
    const assets = state.cash + inventory + equipment;
    return { cash: state.cash, inventory, equipment, assets, capital: INITIAL_CAPITAL,
        netAssetChange: assets - INITIAL_CAPITAL };
}
