import { Recipe } from "../models/recipe";
import { TitleText } from "./title-text";

export default class TodaySettingContainer extends Phaser.GameObjects.Container {
    private titleText: TitleText;
    private recipeTitle: Phaser.GameObjects.Text;
    private background: Phaser.GameObjects.Rectangle;
    private lemonImage: Phaser.GameObjects.Image;
    private lemonText: Phaser.GameObjects.Text;
    private sugarImage: Phaser.GameObjects.Image;
    private sugarText: Phaser.GameObjects.Text;
    private iceImage: Phaser.GameObjects.Image;
    private iceText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, recipe: Recipe) {
        super(scene, x, y);

        const marginLeft = 16;
        const padding = 16;

        this.titleText = new TitleText(scene, marginLeft + padding, padding, "TODAY'S SETTING");

        this.recipeTitle = scene.add.text(marginLeft + padding, 60, "Recipe:", {
            fontSize: "16px",
        });

        this.lemonImage = scene.add.image(marginLeft + padding + 120, 60, "lemon");
        this.lemonText = scene.add.text(marginLeft + padding + 152, 60, `x ${recipe.lemon}`, {
            fontSize: "16px",
        });
        this.sugarImage = scene.add.image(marginLeft + padding + 220, 60, "sugar");
        this.sugarText = scene.add.text(marginLeft + padding + 252, 60, `x ${recipe.sugar}`, {
            fontSize: "16px",
        });
        this.iceImage = scene.add.image(marginLeft + padding + 320, 60, "ice");
        this.iceText = scene.add.text(marginLeft + padding + 352, 60, `x ${recipe.ice}`, {
            fontSize: "16px",
        });

        this.background = scene.add.rectangle(marginLeft, 0, 488, 180, 0x008229, 1);
        this.background.setOrigin(0, 0);

        this.add([
            this.background,
            this.titleText,
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
