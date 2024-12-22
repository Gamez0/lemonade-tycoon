import { BuyLemon } from "./buy-lemon";
import { TabUI } from "./tab-ui";

export class BuySupplies extends Phaser.GameObjects.Container {
    private title: Phaser.GameObjects.Text;
    private description: Phaser.GameObjects.Text;
    tabUI: TabUI;
    selectedTabIndex: number;
    buyLemonUI: BuyLemon;
    tempUI: BuyLemon;
    private buySugarUI: Phaser.GameObjects.Container;
    private buyIceUI: Phaser.GameObjects.Container;
    private buyCupsUI: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.title = scene.add.text(0, 0, 'Buy Supplies', { fontSize: '24px' });
        this.description = scene.add.text(0, 25, 'Select the supplies you want to buy', { fontSize: '16px' });

        this.tabUI = new TabUI(scene, 0, 50, ['Lemons', 'Sugar', 'Ice', 'Cups']);
        this.tabUI.on('tabSelected', this.onTabSelected, this);
        this.selectedTabIndex = 0; // Initialize selectedTabIndex

        this.buyLemonUI = new BuyLemon(scene, 0, 100, 12, 4.8);
        this.tempUI = new BuyLemon(scene, 0, 100, 0, 2);
        

        this.add([this.title, this.description, this.tabUI, this.buyLemonUI, this.tempUI]);
        scene.add.existing(this);
        this.updateUI();
    }

    onTabSelected(tabIndex: number) {
        this.selectedTabIndex = tabIndex;
        this.updateUI();
    }


    updateUI() {
        // Hide all UI elements

        this.buyLemonUI.setVisible(false);
        this.tempUI.setVisible(false);
        // this.buySugarUI.setVisible(false);
        // this.buyIceUI.setVisible(false);
        // this.buyCupsUI.setVisible(false);

        switch(this.selectedTabIndex) {
            case 0:
                this.buyLemonUI.setVisible(true);
                break;
            case 1:
                this.tempUI.setVisible(true);
                // this.buySugarUI.setVisible(true);
                break;
            case 2:
                // this.buyIceUI.setVisible(true);
                break;
            case 3:
                // this.buyCupsUI.setVisible(true);
                break;
            default:
                break;
        }
    }
}