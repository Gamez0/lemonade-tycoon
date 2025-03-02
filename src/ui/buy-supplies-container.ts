import { TextButton } from "./text-button";
import { BuyLemons, BuySugar, BuyIce, BuyCups } from "./buy-items";
import { SuppliesTotalAmount, SuppliesTotalPrice } from "./game-control-container";
import { TitleText } from "./title-text";

export class BuySuppliesContainer extends Phaser.GameObjects.Container {
    private title: Phaser.GameObjects.Text;
    private description: Phaser.GameObjects.Text;
    lemonImage: Phaser.GameObjects.Image;
    lemonImageBackground: Phaser.GameObjects.Rectangle;
    sugarImage: Phaser.GameObjects.Image;
    sugarImageBackground: Phaser.GameObjects.Rectangle;
    iceImage: Phaser.GameObjects.Image;
    iceImageBackground: Phaser.GameObjects.Rectangle;
    cupImage: Phaser.GameObjects.Image;
    cupImageBackground: Phaser.GameObjects.Rectangle;
    buyUIBackground: Phaser.GameObjects.Rectangle;
    selectedTabIndex: number;
    private buyLemonUI: BuyLemons;
    private buySugarUI: BuySugar;
    private buyIceUI: BuyIce;
    private buyCupsUI: BuyCups;
    private purchaseSupplies: (totalPrice: SuppliesTotalPrice, totalAmount: SuppliesTotalAmount) => void;
    private buyButton: TextButton;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        purchaseSupplies: (totalPrice: SuppliesTotalPrice, totalAmount: SuppliesTotalAmount) => void
    ) {
        super(scene, x, y);
        this.title = new TitleText(scene, 0, 0, "Buy Supplies");
        this.description = scene.add.text(0, 25, "Select the supplies you want to buy", { fontSize: "16px" });

        // image buttons
        this.lemonImage = scene.add.image(32, 58, "lemon");
        this.lemonImage.setOrigin(0, 0);
        this.lemonImage.setSize(64, 64);
        this.lemonImageBackground = scene.add.rectangle(16, 50, 64, 50, 0x008229, 1);
        this.lemonImageBackground.setOrigin(0, 0);
        this.lemonImage.setInteractive({ useHandCursor: true });
        this.lemonImage.on("pointerdown", () => {
            this.onTabSelected(0);
        });
        this.sugarImage = scene.add.image(132, 58, "sugar");
        this.sugarImage.setOrigin(0, 0);
        this.sugarImage.setSize(64, 64);
        this.sugarImageBackground = scene.add.rectangle(120 - 4, 50, 64, 50, 0x008229, 1);
        this.sugarImageBackground.setOrigin(0, 0);
        this.sugarImage.setInteractive({ useHandCursor: true });
        this.sugarImage.on("pointerdown", () => {
            this.onTabSelected(1);
        });
        this.iceImage = scene.add.image(252, 58, "ice");
        this.iceImage.setOrigin(0, 0);
        this.iceImage.setSize(64, 64);
        this.iceImageBackground = scene.add.rectangle(240 - 4, 50, 64, 50, 0x008229, 1);
        this.iceImageBackground.setOrigin(0, 0);
        this.iceImage.setInteractive({ useHandCursor: true });
        this.iceImage.on("pointerdown", () => {
            this.onTabSelected(2);
        });
        this.cupImage = scene.add.image(372, 58, "cup");
        this.cupImage.setOrigin(0, 0);
        this.cupImage.setSize(64, 64);
        this.cupImageBackground = scene.add.rectangle(360 - 4, 50, 64, 50, 0x008229, 1);
        this.cupImageBackground.setOrigin(0, 0);
        this.cupImage.setInteractive({ useHandCursor: true });
        this.cupImage.on("pointerdown", () => {
            this.onTabSelected(3);
        });
        this.selectedTabIndex = 0; // Initialize selectedTabIndex

        this.buyLemonUI = new BuyLemons(scene, 16, 116);
        this.buySugarUI = new BuySugar(scene, 16, 116);
        this.buyIceUI = new BuyIce(scene, 16, 116);
        this.buyCupsUI = new BuyCups(scene, 16, 116);
        this.buyUIBackground = scene.add.rectangle(0, 100, 432, 180, 0x008229, 1);
        this.buyUIBackground.setOrigin(0, 0);

        this.buyButton = new TextButton(scene, 340, 320, "Buy"); // + button 아래에 있으면 좋을 듯 사용자가 누르기 편할 듯
        this.buyButton.setInteractive();
        this.buyButton.on("pointerdown", this.onBuyButtonClicked, this);

        this.purchaseSupplies = purchaseSupplies;

        this.add([
            this.title,
            this.description,
            this.buyUIBackground,
            this.lemonImageBackground,
            this.lemonImage,
            this.sugarImageBackground,
            this.sugarImage,
            this.iceImageBackground,
            this.iceImage,
            this.cupImageBackground,
            this.cupImage,
            this.buyButton,
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

        // Hide all background
        this.lemonImageBackground.setVisible(false);
        this.sugarImageBackground.setVisible(false);
        this.iceImageBackground.setVisible(false);
        this.cupImageBackground.setVisible(false);

        switch (this.selectedTabIndex) {
            case 0:
                this.buyLemonUI.setVisible(true);
                this.lemonImageBackground.setVisible(true);
                break;
            case 1:
                this.buySugarUI.setVisible(true);
                this.sugarImageBackground.setVisible(true);
                break;
            case 2:
                this.buyIceUI.setVisible(true);
                this.iceImageBackground.setVisible(true);
                break;
            case 3:
                this.buyCupsUI.setVisible(true);
                this.cupImageBackground.setVisible(true);
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
