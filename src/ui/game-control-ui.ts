import { BuySupplies } from "./buy-supplies";
import { TabUI } from "./tab-ui";

export class GameControlUI extends Phaser.GameObjects.Container {
    tabUI: TabUI;
    selectedTabIndex: number;
    buySuppliesUI: BuySupplies;
    recipeUI: Phaser.GameObjects.Container;
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.tabUI = new TabUI(scene, 50, 75 ,[
            'Results', 'Rent', 'Upgrades', 'Staff', 'Marketing', 'Recipe', 'Supplies']);
        this.tabUI.on('tabSelected', this.onTabSelected, this);
        this.selectedTabIndex = 0; // Initialize selectedTabIndex
        
        
        this.buySuppliesUI = new BuySupplies(scene, 50, 125);
        
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