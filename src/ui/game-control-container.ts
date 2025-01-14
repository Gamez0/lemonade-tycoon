import { SUPPLIES_LIMIT } from "../constants";
import { Budget } from "../models/budget";
import { Supplies } from "../models/supplies";
import { BuySuppliesContainer } from "./buy-supplies-container";
import { RecipeContainer } from "./recipe-container";
import { TabUI } from "./tab-ui";

export interface SuppliesTotalPrice {
    lemonTotalPrice: number;
    sugarTotalPrice: number;
    iceTotalPrice: number;
    cupsTotalPrice: number;
}

export interface SuppliesTotalAmount {
    lemonTotalAmount: number;
    sugarTotalAmount: number;
    iceTotalAmount: number;
    cupsTotalAmount: number;
}

export class GameControlContainer extends Phaser.GameObjects.Container { // TODO: need better name for this class
    tabUI: TabUI;
    selectedTabIndex: number;
    buySuppliesContainer: BuySuppliesContainer;
    recipeContainer: RecipeContainer;
    budget: Budget;
    private supplies: Supplies;
    
    constructor(scene: Phaser.Scene, x: number, y: number, budget: Budget, supplies:Supplies) {
        super(scene, x, y);
        this.tabUI = new TabUI(scene, 50, 75 ,[
            'Results', 'Rent', 'Upgrades', 'Staff', 'Marketing', 'Recipe', 'Supplies']);
        this.tabUI.on('tabSelected', this.onTabSelected, this);
        this.selectedTabIndex = 0; // Initialize selectedTabIndex
        
        this.budget = budget;
        this.supplies = supplies;
        
        this.buySuppliesContainer = new BuySuppliesContainer(scene, 50, 125, this.purchaseSupplies);
        this.recipeContainer = new RecipeContainer(scene, 50, 125, this.supplies);
        
        scene.add.existing(this);
        this.updateUI();
    }

    onTabSelected(tabIndex: number) {
        this.selectedTabIndex = tabIndex;
        this.updateUI();
    }

    private purchaseSupplies = (totalPrice: SuppliesTotalPrice, totalAmount: SuppliesTotalAmount) => {
        const { lemonTotalPrice, sugarTotalPrice, iceTotalPrice, cupsTotalPrice } = totalPrice;
        const { lemonTotalAmount, sugarTotalAmount, iceTotalAmount, cupsTotalAmount } = totalAmount;
        const currentBudget: number = this.budget.getAmount();

        const totalCost = lemonTotalPrice + sugarTotalPrice + iceTotalPrice + cupsTotalPrice;
        if (totalCost > currentBudget) {
            alert("You don't have enough budget to buy all the supplies");
            return;
        }

        const exceedsLimit = (amount: number, limit: number, itemName: string) => {
            if (amount > limit) {
                alert(`You can't have more than ${limit} ${itemName}`);
                return true;
            }
            return false;
        };

        if (
            exceedsLimit(lemonTotalAmount + this.supplies.lemon, SUPPLIES_LIMIT.LEMON, 'lemons') ||
            exceedsLimit(sugarTotalAmount + this.supplies.sugar, SUPPLIES_LIMIT.SUGAR, 'sugars') ||
            exceedsLimit(iceTotalAmount + this.supplies.ice, SUPPLIES_LIMIT.ICE, 'ices') ||
            exceedsLimit(cupsTotalAmount + this.supplies.cup, SUPPLIES_LIMIT.CUP, 'cups')
        ) {
            return;
        }

        const newAmount = currentBudget - totalCost;
        this.budget.setAmount(newAmount);

        this.supplies.lemon += lemonTotalAmount;
        this.supplies.sugar += sugarTotalAmount;
        this.supplies.ice += iceTotalAmount;
        this.supplies.cup += cupsTotalAmount;

        this.buySuppliesContainer.reset();
    }

    updateUI() {
        // Hide all UI elements
        this.buySuppliesContainer.setVisible(false);
        this.recipeContainer.setVisible(false);

        // Show UI elements based on selected tab
        switch(this.selectedTabIndex) {
            case 5:
                this.recipeContainer.setVisible(true);
                break;
            case 6:
                this.buySuppliesContainer.setVisible(true);
                break;
            default:
                break;
        }
    }
}