import { Recipe } from "../models/recipe";
import { Supplies } from "../models/supplies";
import { MinusButton } from "./minus-button";
import { PlusButton } from "./plus-button";

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
    private sugarText: Phaser.GameObjects.Text;
    private iceText: Phaser.GameObjects.Text;
    private supplies: Supplies;
    private cupsPerPitcherText: Phaser.GameObjects.Text;
    private costPerCupText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, supplies: Supplies) {
        super(scene, x, y);
        this.title = scene.add.text(0, 0, "Recipe", { fontSize: "24px" });
        this.description = scene.add.text(
            0,
            25,
            "Tweak your recipe according to the temperature, adding more \nice when needed. \nAlways keep a good balance between all ingredients.",
            { fontSize: "16px" },
        );
        this.supplies = supplies;
        this.recipe = new Recipe(1, 1, 1, this.supplies);

        this.createLemonControls(scene);
        this.createSugarControls(scene);
        this.createIceControls(scene);

        this.cupsPerPitcherText = scene.add.text(
            50,
            250,
            "Cups per pitcher: " + this.recipe.cupsPerPitcher.toString(),
            { fontSize: "24px" },
        );
        this.costPerCupText = scene.add.text(
            50,
            300,
            "Cost per cup: $" + this.recipe.costPerCup.toFixed(2),
            { fontSize: "24px" },
        );

        this.recipe.on("change", (recipe: Recipe) => {
            this.cupsPerPitcherText.setText(
                "Cups per pitcher: " + recipe.cupsPerPitcher.toString(),
            );
            this.costPerCupText.setText(
                "Cost per cup: $" + recipe.costPerCup.toFixed(2),
            );
        });

        this.add([
            this.title,
            this.description,
            this.lemonPlusButton,
            this.lemonMinusButton,
            this.lemonText,
            this.sugarPlusButton,
            this.sugarMinusButton,
            this.sugarText,
            this.icePlusButton,
            this.iceMinusButton,
            this.iceText,
            this.cupsPerPitcherText,
            this.costPerCupText,
        ]);
        scene.add.existing(this);
    }

    private createLemonControls(scene: Phaser.Scene) {
        this.lemonMinusButton = new MinusButton(scene, 0, 100);
        this.lemonMinusButton.setInteractive();
        this.lemonMinusButton.on(
            "pointerdown",
            () => this.decreaseIngredient("lemon"),
            this,
        );
        this.lemonText = scene.add.text(
            50,
            100,
            "Lem   " + this.recipe.lemon.toString(),
            { fontSize: "24px" },
        );
        this.lemonPlusButton = new PlusButton(scene, 200, 100);
        this.lemonPlusButton.setInteractive();
        this.lemonPlusButton.on(
            "pointerdown",
            () => this.increaseIngredient("lemon"),
            this,
        );
    }

    private createSugarControls(scene: Phaser.Scene) {
        this.sugarMinusButton = new MinusButton(scene, 0, 150);
        this.sugarMinusButton.setInteractive();
        this.sugarMinusButton.on(
            "pointerdown",
            () => this.decreaseIngredient("sugar"),
            this,
        );
        this.sugarText = scene.add.text(
            50,
            150,
            "Sug   " + this.recipe.sugar.toString(),
            { fontSize: "24px" },
        );
        this.sugarPlusButton = new PlusButton(scene, 200, 150);
        this.sugarPlusButton.setInteractive();
        this.sugarPlusButton.on(
            "pointerdown",
            () => this.increaseIngredient("sugar"),
            this,
        );
    }

    private createIceControls(scene: Phaser.Scene) {
        this.iceMinusButton = new MinusButton(scene, 0, 200);
        this.iceMinusButton.setInteractive();
        this.iceMinusButton.on(
            "pointerdown",
            () => this.decreaseIngredient("ice"),
            this,
        );
        this.iceText = scene.add.text(
            50,
            200,
            "Ice   " + this.recipe.ice.toString(),
            { fontSize: "24px" },
        );
        this.icePlusButton = new PlusButton(scene, 200, 200);
        this.icePlusButton.setInteractive();
        this.icePlusButton.on(
            "pointerdown",
            () => this.increaseIngredient("ice"),
            this,
        );
    }

    private increaseIngredient(ingredient: "lemon" | "sugar" | "ice") {
        switch (ingredient) {
            case "lemon":
                this.recipe.lemon += 1;
                this.lemonText.setText("Lem   " + this.recipe.lemon.toString());
                break;
            case "sugar":
                this.recipe.sugar += 1;
                this.sugarText.setText("Sug   " + this.recipe.sugar.toString());
                break;
            case "ice":
                this.recipe.ice += 1;
                this.iceText.setText("Ice   " + this.recipe.ice.toString());
                break;
        }
    }

    private decreaseIngredient(ingredient: "lemon" | "sugar" | "ice") {
        switch (ingredient) {
            case "lemon":
                if (this.recipe.lemon > 1) {
                    this.recipe.lemon -= 1;
                    this.lemonText.setText(
                        "Lem   " + this.recipe.lemon.toString(),
                    );
                }
                break;
            case "sugar":
                if (this.recipe.sugar > 1) {
                    this.recipe.sugar -= 1;
                    this.sugarText.setText(
                        "Sug   " + this.recipe.sugar.toString(),
                    );
                }
                break;
            case "ice":
                if (this.recipe.ice > 1) {
                    this.recipe.ice -= 1;
                    this.iceText.setText("Ice   " + this.recipe.ice.toString());
                }
                break;
        }
    }
}
