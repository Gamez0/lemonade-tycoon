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