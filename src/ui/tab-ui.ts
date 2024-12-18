import { TextButton } from "./TextButton";

export class TabUI extends Phaser.GameObjects.Container {
    private buttonStyle: Phaser.Types.GameObjects.Text.TextStyle;

    constructor(scene: Phaser.Scene, x: number, y: number ,items: string[]) {
        super(scene, x, y);

        this.buttonStyle = {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#a5d739',
            padding: { x: 10, y: 5 }
        };

        this.renderTabUI(items);
        scene.add.existing(this);
        
    }


    private renderTabUI(items: string[]) {
        let xPosition = 0; // Starting y position
        const yPosition = 0; // Fixed x position
        const gap = 10; // Gap between text elements

        items.forEach((item,index) => {
            const button = new TextButton(this.scene, xPosition, yPosition, item, this.buttonStyle).setInteractive();
            button.setPosition(xPosition, yPosition);
            button.setOrigin(0,0);
            button.on('pointerdown', () => {
                this.emit('tabSelected', index);
            });
            this.add(button);
            xPosition += button.width + gap; // Update y position for the next text element
        });
    }
}