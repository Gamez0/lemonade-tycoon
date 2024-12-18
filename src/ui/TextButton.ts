// TextButton.ts usable in Game.ts
export class TextButton extends Phaser.GameObjects.Text {
    constructor(scene: Phaser.Scene, x:number, y:number, text:string, style:Phaser.Types.GameObjects.Text.TextStyle) {
        super(scene, x, y, text, style);
        scene.add.existing(this);
        this.setInteractive();
    }

    public onClick(callback: () => void) {
        this.on('pointerdown', callback);
    }
}