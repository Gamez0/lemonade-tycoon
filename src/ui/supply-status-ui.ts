import Phaser from 'phaser';

export class SupplyStatusUI extends Phaser.GameObjects.Container {
    private lemon: number;
    private sugar: number;
    private ice: number;
    private cup: number;

    constructor(scene: Phaser.Scene, x: number, y: number, lemon: number, sugar: number, ice: number, cup: number) {
        super(scene, x, y);

        this.lemon = lemon;
        this.sugar = sugar;
        this.ice = ice;
        this.cup = cup;

        this.renderInventory();
        scene.add.existing(this);
    }

    private renderInventory() {
        const items = [
            { label: 'Lemon: ', value: this.lemon },
            { label: 'Sugar: ', value: this.sugar },
            { label: 'Ice: ', value: this.ice },
            { label: 'Cup: ', value: this.cup }
        ];

        let xPosition = 0; // Starting y position
        const yPosition = 0; // Fixed x position
        const gap = 50; // Gap between text elements

        items.forEach(item => {
            const text = this.scene.add.text(xPosition, yPosition, item.label + item.value, {
                fontFamily: 'Arial Black', fontSize: 20, color: '#ffffff',
                stroke: '#000000', strokeThickness: 4,
                align: 'center'
            });
            text.setOrigin(0,0);
            this.add(text);
            xPosition += text.width + gap; // Update y position for the next text element
        });
    }

    public updateSupplies(lemon: number, sugar: number, ice: number, cup: number) {
        this.lemon = lemon;
        this.sugar = sugar;
        this.ice = ice;
        this.cup = cup;
        this.removeAll(true); // Remove all current text elements
        this.renderInventory(); // Re-render the inventory with updated values
    }
}