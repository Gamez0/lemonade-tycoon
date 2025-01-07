import Phaser from 'phaser';
import { Budget } from '../models/budget';

export class BudgetContainer extends Phaser.GameObjects.Container {
    private budget: Budget;
    private budgetText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, budget: Budget) {
        super(scene, x, y);

        this.budget = budget;
        this.budgetText = this.createText(scene, 'Budget: ', budget.getAmount(), 0);
        this.add(this.budgetText);

        this.budget.on('change', this.updateBudget, this);

        scene.add.existing(this);
    }

    private createText(scene: Phaser.Scene, label: string, value: number, yOffset: number): Phaser.GameObjects.Text {
        return scene.add.text(0, yOffset, `${label}${value}`, {
            fontFamily: 'Arial Black', fontSize: 20, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'right'
        }).setOrigin(0.5);
    }

    public updateBudget(budget: number) {
        this.budgetText.setText(`Budget: ${budget.toFixed(2)}`);
    }
}