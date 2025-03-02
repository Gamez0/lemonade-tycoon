import Price from "../models/price";
import { DescriptionText } from "./description-text";
import { MinusButton } from "./minus-button";
import { PlusButton } from "./plus-button";
import { TitleText } from "./title-text";

export class MarketingContainer extends Phaser.GameObjects.Container {
    firstTitle: TitleText;
    firstDescription: DescriptionText;

    secondTitle: TitleText;
    secondDescription: DescriptionText;

    priceText: Phaser.GameObjects.Text;
    pricePlusButton: PlusButton;
    priceMinusButton: MinusButton;

    advertisingText: Phaser.GameObjects.Text;
    advertisingPlusButton: PlusButton;
    advertisingMinusButton: MinusButton;

    constructor(scene: Phaser.Scene, x: number, y: number, price: Price) {
        super(scene, x, y);
        this.firstTitle = new TitleText(scene, 0, 0, "Price");
        this.firstDescription = new DescriptionText(
            scene,
            0,
            30,
            "Skills, instinct, judgement, luck... Do you \nhave what it takes to set the perfect price?"
        );
        this.priceMinusButton = new MinusButton(scene, 0, 90);
        this.priceMinusButton.on("pointerdown", () => {
            price.decrease();
            this.priceText.setText(price.amountString);
            this.priceMinusButton.setVisible(price.amount > 0.2);
            this.priceMinusButton.setInteractive(price.amount > 0.2);
        });

        this.priceText = new TitleText(scene, 60, 100, price.amount.toFixed(2));
        this.pricePlusButton = new PlusButton(scene, 120, 90);
        this.pricePlusButton.on("pointerdown", () => {
            price.increase();
            this.priceText.setText(price.amountString);
            this.priceMinusButton.setVisible(true);
            this.priceMinusButton.setInteractive(true);
        });

        this.secondTitle = new TitleText(scene, 0, 150, "Advertising");
        this.secondDescription = new DescriptionText(
            scene,
            0,
            180,
            "When your reputation needs a little boost, \nspending a few dollars here can really make \nthe difference by attracting more customers \nto your stand."
        );

        this.advertisingMinusButton = new MinusButton(scene, 0, 240);
        this.advertisingText = new TitleText(scene, 60, 250, "0.00");
        this.advertisingPlusButton = new PlusButton(scene, 120, 240);

        this.add([
            this.firstTitle,
            this.firstDescription,
            this.priceMinusButton,
            this.priceText,
            this.pricePlusButton,
            this.secondTitle,
            this.secondDescription,
            this.advertisingMinusButton,
            this.advertisingText,
            this.advertisingPlusButton,
        ]);
        scene.add.existing(this);
    }
}
