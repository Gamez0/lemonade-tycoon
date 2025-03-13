import { RentedLocation } from "../models/location";
import Price from "../models/price";
import { Recipe } from "../models/recipe";
import { TitleText } from "./title-text";

export default class TodaySettingContainer extends Phaser.GameObjects.Container {
    private titleText: TitleText;

    // Location
    private locationTitle: Phaser.GameObjects.Text;
    private locationText: Phaser.GameObjects.Text;

    // Price
    private priceTitle: Phaser.GameObjects.Text;
    private priceText: Phaser.GameObjects.Text;

    // Recipe
    private recipeTitle: Phaser.GameObjects.Text;
    private background: Phaser.GameObjects.Rectangle;
    private lemonImage: Phaser.GameObjects.Image;
    private lemonText: Phaser.GameObjects.Text;
    private sugarImage: Phaser.GameObjects.Image;
    private sugarText: Phaser.GameObjects.Text;
    private iceImage: Phaser.GameObjects.Image;
    private iceText: Phaser.GameObjects.Text;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        rentedLocation: RentedLocation,
        price: Price,
        recipe: Recipe
    ) {
        super(scene, x, y);

        const marginLeft = 16;
        const padding = 16;

        this.titleText = new TitleText(scene, marginLeft + padding, padding, "TODAY'S SETTING");

        // Location
        this.locationTitle = scene.add.text(marginLeft + padding, 60, "Location:", {
            fontSize: "16px",
        });
        this.locationText = scene.add.text(
            marginLeft + padding + 120,
            60,
            rentedLocation.getCurrentLocationTitleText(),
            {
                fontSize: "16px",
            }
        );

        // Price
        const priceY = 100;
        this.priceTitle = scene.add.text(marginLeft + padding, priceY, "Price:", {
            fontSize: "16px",
        });
        this.priceText = scene.add.text(marginLeft + padding + 120, priceY, `$ ${price.amount}`, {
            fontSize: "16px",
        });

        // Recipe
        const recipeY = 140;
        this.recipeTitle = scene.add.text(marginLeft + padding, recipeY, "Recipe:", {
            fontSize: "16px",
        });

        this.lemonImage = scene.add.image(marginLeft + padding + 120, recipeY, "lemon");
        this.lemonImage.setOrigin(0, 0);
        this.lemonText = scene.add.text(marginLeft + padding + 160, recipeY + 8, `x ${recipe.lemon}`, {
            fontSize: "16px",
        });
        this.sugarImage = scene.add.image(marginLeft + padding + 220, recipeY, "sugar");
        this.sugarImage.setOrigin(0, 0);
        this.sugarText = scene.add.text(marginLeft + padding + 260, recipeY + 8, `x ${recipe.sugar}`, {
            fontSize: "16px",
        });

        this.iceImage = scene.add.image(marginLeft + padding + 320, recipeY, "ice");
        this.iceImage.setOrigin(0, 0);
        this.iceText = scene.add.text(marginLeft + padding + 360, recipeY + 8, `x ${recipe.ice}`, {
            fontSize: "16px",
        });

        this.background = scene.add.rectangle(marginLeft, 0, 488, 200, 0x008229, 1);
        this.background.setOrigin(0, 0);

        this.add([
            this.background,
            this.titleText,
            this.locationTitle,
            this.locationText,
            this.priceTitle,
            this.priceText,
            this.recipeTitle,
            this.lemonImage,
            this.lemonText,
            this.sugarImage,
            this.sugarText,
            this.iceImage,
            this.iceText,
        ]);
        this.scene.add.existing(this);
    }
}
