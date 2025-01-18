import { MinusButton } from "./minus-button";
import { PlusButton } from "./plus-button";
import { TextButton } from "./text-button";

export class ItemPurchaseContainer extends Phaser.GameObjects.Container {
    private addButton: TextButton;
    private subtractButton: TextButton;
    private perBundleText: Phaser.GameObjects.Text;
    private priceText: Phaser.GameObjects.Text;
    private bundlesToBuy: number;
    private bundlesToBuyText: Phaser.GameObjects.Text;
    private price: number;
    private totalPrice: number;
    private perBundle: number;

    constructor(scene: Phaser.Scene, x: number, y: number, itemName: string, perBundle: number, price: number) {
        super(scene, x, y);
        this.price = price;
        this.totalPrice = 0;
        this.perBundle = perBundle;

        this.subtractButton = new MinusButton(scene, 0, 0);
        this.subtractButton.setInteractive();
        this.subtractButton.on("pointerdown", this.onSubtractButtonClicked, this);

        this.perBundleText = scene.add.text(50, 0, perBundle.toString() + " " + itemName, { fontSize: "24px" });
        this.priceText = scene.add.text(50, 25, price.toFixed(2) + " $", {
            fontSize: "24px",
        });

        this.bundlesToBuyText = scene.add.text(250, 0, "0", {
            fontSize: "24px",
        });

        this.addButton = new PlusButton(scene, 300, 0);
        this.addButton.setInteractive();
        this.addButton.on("pointerdown", this.onAddButtonClicked, this);

        this.bundlesToBuy = 0;

        this.add([this.subtractButton, this.perBundleText, this.addButton, this.priceText, this.bundlesToBuyText]);
        scene.add.existing(this);
    }

    private onAddButtonClicked() {
        this.bundlesToBuy += 1;
        this.updateTotalPrice();
        this.bundlesToBuyText.setText(this.bundlesToBuy.toString());
        this.updateButtonVisibility();
    }

    private onSubtractButtonClicked() {
        if (this.bundlesToBuy === 0) {
            return;
        }
        this.bundlesToBuy -= 1;
        this.updateTotalPrice();
        this.bundlesToBuyText.setText(this.bundlesToBuy.toString());
        this.updateButtonVisibility();
    }

    // function calls to update the visibility of the add and subtract buttons
    private updateButtonVisibility() {
        this.updateAddButtonVisibility();
        this.updateSubtractButtonVisibility();
    }

    // when bundlesToBuy is 10, the add button should be hidden
    private updateAddButtonVisibility() {
        this.addButton.setVisible(this.bundlesToBuy < 10);
    }

    // when bundlesToBuy is 0, the subtract button should be hidden
    private updateSubtractButtonVisibility() {
        this.subtractButton.setVisible(this.bundlesToBuy > 0);
    }

    private updateTotalPrice() {
        this.totalPrice = this.bundlesToBuy * this.price;
        this.emit("update");
    }

    public getTotalPrice() {
        return this.totalPrice;
    }

    // get the total amount of the item
    public getAmount() {
        return this.bundlesToBuy * this.perBundle;
    }

    public reset() {
        this.bundlesToBuy = 0;
        this.updateTotalPrice();
        this.bundlesToBuyText.setText(this.bundlesToBuy.toString());
        this.updateButtonVisibility();
    }
}
