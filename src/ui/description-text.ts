export class DescriptionText extends Phaser.GameObjects.Text {
    constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
        super(scene, x, y, text, {
            color: "white",
            fontSize: "16px",
        });
        scene.add.existing(this);
    }
}
