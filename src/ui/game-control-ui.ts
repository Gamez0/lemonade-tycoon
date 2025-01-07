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
    private purchaseSupplies = (lemonTotal: number, sugarTotal: number, iceTotal: number, cupsTotal: number) => {
        // receive the total amount of each item by parameter

        const currentBudget: number = this.getBudgetAmount();

        // check the total is not higher than the budget
        if(lemonTotal + sugarTotal + iceTotal + cupsTotal > currentBudget) {
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
        const newAmount = currentBudget - (lemonTotal + sugarTotal + iceTotal + cupsTotal);
        this.setBudgetAmount(newAmount);

        this.supplies.setLemon(this.supplies.lemon + lemonTotal);
        this.supplies.setSugar(this.supplies.sugar + sugarTotal);
        this.supplies.setIce(this.supplies.ice + iceTotal);
        this.supplies.setCup(this.supplies.cup + cupsTotal);
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