import Phaser from "phaser";
import { Budget } from "../models/budget";
import { TitleText } from "./title-text";

export class BudgetContainer extends Phaser.GameObjects.Container {
    private budgetText: Phaser.GameObjects.Text;
    private budget: Budget;

    constructor(scene: Phaser.Scene, x: number, y: number, budget: Budget) {
        super(scene, x, y);

        this.budget = budget;

        this.budgetText = new TitleText(scene, 0, 12, `$ ${budget.getAmountString()}`);

        this.budget.on("change", this.updateBudgetText, this);

        this.add([this.budgetText]);
        scene.add.existing(this);

        scene.events.on(Phaser.Scenes.Events.SHUTDOWN, this.onSceneShutdown, this);
    }

    private updateBudgetText() {
        this.budgetText.setText(this.budget.getAmountString());
    }

    private onSceneShutdown() {
        this.budget.off("change", this.updateBudgetText, this);
    }
}
