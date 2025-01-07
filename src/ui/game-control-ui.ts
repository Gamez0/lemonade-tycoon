import { Supplies } from "../models/supplies";
import { BuySupplies } from "./buy-supplies";
import { TabUI } from "./tab-ui";


const SUPPLIES_LIMIT = {
    LEMON: 100,
    SUGAR: 100,
    ICE: 1000,
    CUP: 1000
}

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

export class GameControlUI extends Phaser.GameObjects.Container {
    tabUI: TabUI;
    selectedTabIndex: number;
    buySuppliesUI: BuySupplies;
    recipeUI: Phaser.GameObjects.Container;
    private getBudgetAmount: () => number;
    private setBudgetAmount: (value: number) => void;
    private supplies: Supplies;
    
    constructor(scene: Phaser.Scene, x: number, y: number, getBudgetAmount:() => number, setBudgetAmount:(value: number) => void, supplies:Supplies) {
        super(scene, x, y);
        this.tabUI = new TabUI(scene, 50, 75 ,[
            'Results', 'Rent', 'Upgrades', 'Staff', 'Marketing', 'Recipe', 'Supplies']);
        this.tabUI.on('tabSelected', this.onTabSelected, this);
        this.selectedTabIndex = 0; // Initialize selectedTabIndex
        
        this.getBudgetAmount = getBudgetAmount;
        this.setBudgetAmount = setBudgetAmount;
        this.supplies = supplies;

        
        // TODO: 이친구 한테 구매할 수 있는 기능을 전달해줘야 함
        this.buySuppliesUI = new BuySupplies(scene, 50, 125, this.purchaseSupplies);
        
        scene.add.existing(this);
        this.updateUI();
    }

    onTabSelected(tabIndex: number) {
        this.selectedTabIndex = tabIndex;
        this.updateUI();
    }

    // TODO: need better name for this function

    

    private purchaseSupplies = (totalPrice: SuppliesTotalPrice, totalAmount: SuppliesTotalAmount) => {
        const { lemonTotalPrice, sugarTotalPrice, iceTotalPrice, cupsTotalPrice } = totalPrice;
        const { lemonTotalAmount, sugarTotalAmount, iceTotalAmount, cupsTotalAmount } = totalAmount;
        const currentBudget: number = this.getBudgetAmount();

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
        this.setBudgetAmount(newAmount);

        this.supplies.setLemon(this.supplies.lemon + lemonTotalAmount);
        this.supplies.setSugar(this.supplies.sugar + sugarTotalAmount);
        this.supplies.setIce(this.supplies.ice + iceTotalAmount);
        this.supplies.setCup(this.supplies.cup + cupsTotalAmount);

        this.buySuppliesUI.reset();
    }

    updateUI() {
        // Hide all UI elements
        this.buySuppliesUI.setVisible(false);
        // this.RecipeUI.setVisible(false);

        // Show UI elements based on selected tab
        switch(this.selectedTabIndex) {
            case 1:
                this.recipeUI.setVisible(true);
                break;
            case 6:
                this.buySuppliesUI.setVisible(true);
                break;
            default:
                break;
        }
    }
}