import Phaser from 'phaser';
import { Supplies } from '../models/supplies';

export class SupplyStatusUI extends Phaser.GameObjects.Container {
    private supplies: Supplies;

    constructor(scene: Phaser.Scene, x: number, y: number, supplies: Supplies) {
        super(scene, x, y);

        this.supplies = supplies;
        this.renderInventory();

        // TODO: each event listener should render only the text element that has changed
        this.supplies.on('lemonChanged', (lemon: number) => {
            this.removeAll(true); // Remove all current text elements
            this.renderInventory(); // Re-render the inventory with updated values
        });

        this.supplies.on('sugarChanged', (sugar: number) => {
            this.removeAll(true); // Remove all current text elements
            this.renderInventory(); // Re-render the inventory with updated values
        });

        this.supplies.on('iceChanged', (ice: number) => {
            this.removeAll(true); // Remove all current text elements
            this.renderInventory(); // Re-render the inventory with updated values
        });

        this.supplies.on('cupChanged', (cup: number) => {
            this.removeAll(true); // Remove all current text elements
            this.renderInventory(); // Re-render the inventory with updated values
        });


        scene.add.existing(this);
    }

    private renderInventory() {
        const items = [
            { label: 'Lemon: ', value: this.supplies.lemon },
            { label: 'Sugar: ', value: this.supplies.sugar },
            { label: 'Ice: ', value: this.supplies.ice },
            { label: 'Cup: ', value: this.supplies.cup }
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

    // CHECK: 이게 public이어야 하는지 확인
    // public updateSupplies(lemon: number, sugar: number, ice: number, cup: number) {
    //     this.supplies.lemon = lemon;
    //     this.supplies.sugar = sugar;
    //     this.supplies.ice = ice;
    //     this.supplies.cup = cup;
    //     this.removeAll(true); // Remove all current text elements
    //     this.renderInventory(); // Re-render the inventory with updated values
    // }
}