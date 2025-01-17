import { TextButton } from "./text-button";
import { BuyLemons, BuySugar, BuyIce, BuyCups } from "./buy-items";
import {
    SuppliesTotalAmount,
    SuppliesTotalPrice,
} from "./game-control-container";
import { TabUI } from "./tab-ui";

export class BuySuppliesContainer extends Phaser.GameObjects.Container {
    private title: Phaser.GameObjects.Text;
    private description: Phaser.GameObjects.Text;
    tabUI: TabUI;
    selectedTabIndex: number;
    private buyLemonUI: BuyLemons;
    private buySugarUI: BuySugar;
    private buyIceUI: BuyIce;
    private buyCupsUI: BuyCups;
    private purchaseSupplies: (
        totalPrice: SuppliesTotalPrice,
        totalAmount: SuppliesTotalAmount,
    ) => void;
    private buyButton: TextButton;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        purchaseSupplies: (
            totalPrice: SuppliesTotalPrice,
            totalAmount: SuppliesTotalAmount,
        ) => void,
    ) {
        super(scene, x, y);
        this.title = scene.add.text(0, 0, "Buy Supplies", { fontSize: "24px" });
        this.description = scene.add.text(
            0,
            25,
            "Select the supplies you want to buy",
            { fontSize: "16px" },
        );

        this.tabUI = new TabUI(scene, 0, 50, [
            "Lemons",
            "Sugar",
            "Ice",
            "Cups",
        ]);
        this.tabUI.on("tabSelected", this.onTabSelected, this);
        this.selectedTabIndex = 0; // Initialize selectedTabIndex

        this.buyLemonUI = new BuyLemons(scene, 0, 100);
        this.buySugarUI = new BuySugar(scene, 0, 100);
        this.buyIceUI = new BuyIce(scene, 0, 100);
        this.buyCupsUI = new BuyCups(scene, 0, 100);

        this.buyButton = new TextButton(scene, 250, 260, "Buy");
        this.buyButton.setInteractive();
        this.buyButton.on("pointerdown", this.onBuyButtonClicked, this);

        this.purchaseSupplies = purchaseSupplies;

        this.add([
            this.title,
            this.description,
            this.buyButton,
            this.tabUI,
            this.buyLemonUI,
            this.buySugarUI,
            this.buyIceUI,
            this.buyCupsUI,
        ]);
        scene.add.existing(this);
        this.updateUI();
    }

    onTabSelected(tabIndex: number) {
        this.selectedTabIndex = tabIndex;
        this.updateUI();
    }

    onBuyButtonClicked() {
        const totalPrice: SuppliesTotalPrice = {
            lemonTotalPrice: this.buyLemonUI.getTotalPrice(),
            sugarTotalPrice: this.buySugarUI.getTotalPrice(),
            iceTotalPrice: this.buyIceUI.getTotalPrice(),
            cupsTotalPrice: this.buyCupsUI.getTotalPrice(),
        };

        const totalAmount: SuppliesTotalAmount = {
            lemonTotalAmount: this.buyLemonUI.getAmount(),
            sugarTotalAmount: this.buySugarUI.getAmount(),
            iceTotalAmount: this.buyIceUI.getAmount(),
            cupsTotalAmount: this.buyCupsUI.getAmount(),
        };

        this.purchaseSupplies(totalPrice, totalAmount);
    }

    updateUI() {
        // Hide all UI elements
        this.buyLemonUI.setVisible(false);
        this.buySugarUI.setVisible(false);
        this.buyIceUI.setVisible(false);
        this.buyCupsUI.setVisible(false);

        switch (this.selectedTabIndex) {
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

    // Reset all the values
    reset() {
        this.buyLemonUI.reset();
        this.buySugarUI.reset();
        this.buyIceUI.reset();
        this.buyCupsUI.reset();
    }
}
