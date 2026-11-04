import { INITIAL_CAPITAL, type State } from "../simulation/game";
import { inventoryValues, totalCost } from "../simulation/inventory-costs";
import { equipmentValue } from "../simulation/equipment-costs";

export function balanceSheet(state: State) {
    const inventory = totalCost(inventoryValues(state));
    const equipment = equipmentValue(state);
    const assets = state.cash + inventory + equipment;
    return { cash: state.cash, inventory, equipment, assets, capital: INITIAL_CAPITAL,
        netAssetChange: assets - INITIAL_CAPITAL };
}
