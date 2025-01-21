export class PlusButton extends Phaser.GameObjects.Image {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "plus");
        this.setInteractive();
        this.scale = 0.45;
        this.setOrigin(0, 0);
    }
}
