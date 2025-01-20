import Phaser from "phaser";
import { Budget } from "../models/budget";
import { TitleText } from "./title-text";

export class BudgetContainer extends Phaser.GameObjects.Container {
    private budgetText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, budget: Budget) {
        super(scene, x, y);

        this.budgetText = new TitleText(scene, 0, 12, budget.getAmount().toString());

        budget.on("change", () => {
            this.budgetText.destroy();
            this.budgetText = new TitleText(this.scene, 0, 12, budget.getAmount().toFixed(2).toString());
            this.add(this.budgetText);
        });

        this.add(this.budgetText);
        scene.add.existing(this);
    }
}
