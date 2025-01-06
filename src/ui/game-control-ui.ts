import { Budget } from "../models/budget";
import { Supplies } from "../models/supplies";
import { BuySupplies } from "./buy-supplies";
import { TabUI } from "./tab-ui";


const SUPPLIES_LIMIT = {
    LEMON: 100,
    SUGAR: 100,
    ICE: 1000,
    CUP: 1000
}

export class GameControlUI extends Phaser.GameObjects.Container {
    tabUI: TabUI;
    selectedTabIndex: number;
    buySuppliesUI: BuySupplies;
    recipeUI: Phaser.GameObjects.Container;
    private budget: Budget;
    private supplies: Supplies;
    
    constructor(scene: Phaser.Scene, x: number, y: number, budget:Budget, supplies:Supplies) {
        super(scene, x, y);
        this.tabUI = new TabUI(scene, 50, 75 ,[
            'Results', 'Rent', 'Upgrades', 'Staff', 'Marketing', 'Recipe', 'Supplies']);
        this.tabUI.on('tabSelected', this.onTabSelected, this);
        this.selectedTabIndex = 0; // Initialize selectedTabIndex
        this.budget = budget;
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
    private purchaseSupplies (lemonTotal: number, sugarTotal: number, iceTotal: number, cupsTotal: number) {
        // receive the total amount of each item by parameter

        // check the total is not higher than the budget
        if(lemonTotal + sugarTotal + iceTotal + cupsTotal > this.budget.amount) {
            // if it is, show an alert message
            alert("You don't have enough budget to buy all the supplies");
            return;
        }

        // if it is not check the limit of each item and show an alert message if it is higher than the limit
        if(lemonTotal + this.supplies.lemon > SUPPLIES_LIMIT.LEMON) {
            alert("You can't have more than 100 lemons");
            return;
        }
        if(sugarTotal + this.supplies.sugar > SUPPLIES_LIMIT.SUGAR) {
            alert("You can't have more than 100 sugars");
            return;
        }
        if(iceTotal + this.supplies.ice > SUPPLIES_LIMIT.ICE) {
            alert("You can't have more than 1000 ices");
            return;
        }
        if(cupsTotal + this.supplies.cup > SUPPLIES_LIMIT.CUP) {
            alert("You can't have more than 1000 cups");
            return;
        }
        // if it is not, update the budget and the total amount of each item
        this.budget.amount -= lemonTotal + sugarTotal + iceTotal + cupsTotal;
        this.supplies.lemon += lemonTotal;
        this.supplies.sugar += sugarTotal;
        this.supplies.ice += iceTotal;
        this.supplies.cup += cupsTotal;
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