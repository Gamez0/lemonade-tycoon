import Phaser from 'phaser';

export class BudgetUI extends Phaser.GameObjects.Container {
    private budgetText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, budget: number) {
        super(scene, x, y);

        this.budgetText = this.createText(scene, 'Budget: ', budget, 0);

        this.add(this.budgetText);
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
        this.budgetText.setText(`Budget: ${budget}`);
    }
}