import { Recipe } from "../models/recipe";
import { Supplies } from "../models/supplies";
import { MinusButton } from "./minus-button";
import { PlusButton } from "./plus-button";
import { TitleText } from "./title-text";

export class RecipeContainer extends Phaser.GameObjects.Container {
    private title: Phaser.GameObjects.Text;
    private description: Phaser.GameObjects.Text;
    private recipe: Recipe;
    private lemonPlusButton: PlusButton;
    private lemonMinusButton: MinusButton;
    private sugarPlusButton: PlusButton;
    private sugarMinusButton: MinusButton;
    private icePlusButton: PlusButton;
    private iceMinusButton: MinusButton;
    private lemonText: Phaser.GameObjects.Text;
    private lemonImage: Phaser.GameObjects.Image;
    private sugarText: Phaser.GameObjects.Text;
    private sugarImage: Phaser.GameObjects.Image;
    private iceText: Phaser.GameObjects.Text;
    private iceImage: Phaser.GameObjects.Image;
    private supplies: Supplies;
    private cupsPerPitcherText: Phaser.GameObjects.Text;
    private costPerCupText: Phaser.GameObjects.Text;

    private recipeImage: Phaser.GameObjects.Image;
    private cupImage: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number, supplies: Supplies, recipe: Recipe) {
        super(scene, x, y);
        this.title = new TitleText(scene, 0, 0, "Recipe");
        this.description = scene.add.text(
            0,
            25,
            "Tweak your recipe according to the temperature, \nadding more ice when needed. Always keep a good \nbalance between all ingredients.",
            { fontSize: "16px" }
        );
        this.supplies = supplies;
        this.recipe = recipe;

        this.recipeImage = scene.add.image(0, 100, "recipe-16");
        this.recipeImage.setOrigin(0, 0);
        this.cupImage = scene.add.image(0, 220, "cup-16");
        this.cupImage.setOrigin(0, 0);

        this.createLemonControls(scene);
        this.createSugarControls(scene);
        this.createIceControls(scene);

        this.cupsPerPitcherText = scene.add.text(
            250,
            100,
            "Cups per pitcher: \n" + this.recipe.cupsPerPitcher.toString(),
            { fontSize: "16px" }
        );
        this.costPerCupText = scene.add.text(250, 150, "Cost per cup:\n" + this.recipe.costPerCup.toFixed(2) + " $", {
            fontSize: "16px",
        });

        this.recipe.on("change", (recipe: Recipe) => {
            this.cupsPerPitcherText.setText("Cups per pitcher: \n" + recipe.cupsPerPitcher.toString());
            this.costPerCupText.setText("Cost per cup:\n" + recipe.costPerCup.toFixed(2) + " $");
        });

        this.add([
            this.title,
            this.description,
            this.lemonPlusButton,
            this.lemonMinusButton,
            this.lemonImage,
            this.lemonText,
            this.sugarPlusButton,
            this.sugarMinusButton,
            this.sugarImage,
            this.sugarText,
            this.icePlusButton,
            this.iceMinusButton,
            this.iceImage,
            this.iceText,
            this.cupsPerPitcherText,
            this.costPerCupText,
            this.recipeImage,
            this.cupImage,
        ]);
        scene.add.existing(this);
    }

    private createLemonControls(scene: Phaser.Scene) {
        this.lemonMinusButton = new MinusButton(scene, 30, 100);
        this.lemonMinusButton.on("pointerdown", () => this.decreaseIngredient("lemon"), this);
        this.lemonMinusButton.setVisible(this.recipe.lemon > 1);
        this.lemonImage = scene.add.image(110, 120, "lemon");
        this.lemonText = new TitleText(scene, 150, 110, this.recipe.lemon.toString());
        this.lemonPlusButton = new PlusButton(scene, 180, 100);
        this.lemonPlusButton.on("pointerdown", () => this.increaseIngredient("lemon"), this);
    }

    private createSugarControls(scene: Phaser.Scene) {
        this.sugarMinusButton = new MinusButton(scene, 30, 150);
        this.sugarMinusButton.on("pointerdown", () => this.decreaseIngredient("sugar"), this);
        this.sugarMinusButton.setVisible(this.recipe.sugar > 1);
        this.sugarImage = scene.add.image(110, 170, "sugar");
        this.sugarText = new TitleText(scene, 150, 160, this.recipe.sugar.toString());
        this.sugarPlusButton = new PlusButton(scene, 180, 150);
        this.sugarPlusButton.on("pointerdown", () => this.increaseIngredient("sugar"), this);
    }

    private createIceControls(scene: Phaser.Scene) {
        this.iceMinusButton = new MinusButton(scene, 30, 220);
        this.iceMinusButton.on("pointerdown", () => this.decreaseIngredient("ice"), this);
        this.iceMinusButton.setVisible(this.recipe.ice > 1);
        this.iceImage = scene.add.image(110, 240, "ice");
        this.iceText = new TitleText(scene, 150, 230, this.recipe.ice.toString());
        this.icePlusButton = new PlusButton(scene, 180, 220);
        this.icePlusButton.on("pointerdown", () => this.increaseIngredient("ice"), this);
    }

    private increaseIngredient(ingredient: "lemon" | "sugar" | "ice") {
        switch (ingredient) {
            case "lemon":
                this.recipe.lemon += 1;
                this.lemonText.setText(this.recipe.lemon.toString());
                this.lemonMinusButton.setVisible(true);
                break;
            case "sugar":
                this.recipe.sugar += 1;
                this.sugarText.setText(this.recipe.sugar.toString());
                this.sugarMinusButton.setVisible(true);
                break;
            case "ice":
                this.recipe.ice += 1;
                this.iceText.setText(this.recipe.ice.toString());
                this.iceMinusButton.setVisible(true);
                break;
        }
    }

    private decreaseIngredient(ingredient: "lemon" | "sugar" | "ice") {
        switch (ingredient) {
            case "lemon":
                if (this.recipe.lemon > 1) {
                    this.recipe.lemon -= 1;
                    this.lemonText.setText(this.recipe.lemon.toString());
                }
                if (this.recipe.lemon === 1) {
                    this.lemonMinusButton.setVisible(false);
                } else {
                    this.lemonMinusButton.setVisible(true);
                }
                break;
            case "sugar":
                if (this.recipe.sugar > 1) {
                    this.recipe.sugar -= 1;
                    this.sugarText.setText(this.recipe.sugar.toString());
                }
                if (this.recipe.sugar === 1) {
                    this.sugarMinusButton.setVisible(false);
                } else {
                    this.sugarMinusButton.setVisible(true);
                }
                break;
            case "ice":
                if (this.recipe.ice > 1) {
                    this.recipe.ice -= 1;
                    this.iceText.setText(this.recipe.ice.toString());
                }
                if (this.recipe.ice === 1) {
                    this.iceMinusButton.setVisible(false);
                } else {
                    this.iceMinusButton.setVisible(true);
                }
                break;
        }
    }
}
