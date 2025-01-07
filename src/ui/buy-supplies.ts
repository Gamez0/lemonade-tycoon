import { TextButton } from "./TextButton";
import { BuyCups } from "./buy-cups";
import { BuyIce } from "./buy-ice";
import { BuyLemons } from "./buy-lemons";
import { BuySugar } from "./buy-sugar";
import { TabUI } from "./tab-ui";

export class BuySupplies extends Phaser.GameObjects.Container {
    private title: Phaser.GameObjects.Text;
    private description: Phaser.GameObjects.Text;
    tabUI: TabUI;
    selectedTabIndex: number;
    private buyLemonUI: BuyLemons;
    private buySugarUI: BuySugar;
    private buyIceUI: BuyIce;
    private buyCupsUI: BuyCups;
    private purchaseSupplies: Function;
    private buyButton: TextButton;

    constructor(scene: Phaser.Scene, x: number, y: number, purchaseSupplies: Function) {
        super(scene, x, y);
        this.title = scene.add.text(0, 0, 'Buy Supplies', { fontSize: '24px' });
        this.description = scene.add.text(0, 25, 'Select the supplies you want to buy', { fontSize: '16px' });
        

        this.tabUI = new TabUI(scene, 0, 50, ['Lemons', 'Sugar', 'Ice', 'Cups']);
        this.tabUI.on('tabSelected', this.onTabSelected, this);
        this.selectedTabIndex = 0; // Initialize selectedTabIndex

        this.buyLemonUI = new BuyLemons(scene, 0, 100);
        this.buySugarUI = new BuySugar(scene, 0, 100);
        this.buyIceUI = new BuyIce(scene, 0, 100);
        this.buyCupsUI = new BuyCups(scene, 0, 100);

        this.buyButton = new TextButton(scene, 250, 260, 'Buy');
        this.buyButton.setInteractive();
        this.buyButton.on('pointerdown', this.onBuyButtonClicked, this);

        this.purchaseSupplies = purchaseSupplies;

        this.add([this.title, this.description, this.buyButton, this.tabUI, this.buyLemonUI, this.buySugarUI, this.buyIceUI, this.buyCupsUI]);
        scene.add.existing(this);
        this.updateUI();
    }

    onTabSelected(tabIndex: number) {
        this.selectedTabIndex = tabIndex;
        this.updateUI();
    }

    // TODO: buy button 만들어야 함

    onBuyButtonClicked() {
        // check selected items
        const lemonTotal = this.buyLemonUI.getTotal();
        const sugarTotal = this.buySugarUI.getTotal();
        const iceTotal = this.buyIceUI.getTotal();
        const cupsTotal = this.buyCupsUI.getTotal();
        console.log('buy button clicked', lemonTotal, sugarTotal, iceTotal, cupsTotal);
        this.purchaseSupplies(lemonTotal, sugarTotal, iceTotal, cupsTotal);

        // 구매했을 때

        // 구매가 안됐을 때
    }

    updateUI() {
        // Hide all UI elements
        this.buyLemonUI.setVisible(false);
        this.buySugarUI.setVisible(false);
        this.buyIceUI.setVisible(false);
        this.buyCupsUI.setVisible(false);

        switch(this.selectedTabIndex) {
            case 0:
                this.buyLemonUI.setVisible(true);
                break;
            case 1:
                this.buySugarUI.setVisible(true);
                break;
            case 2:
                this.buyIceUI.setVisible(true);
                break;
            case 3:
                this.buyCupsUI.setVisible(true);
                break;
            default:
                break;
        }
    }
}