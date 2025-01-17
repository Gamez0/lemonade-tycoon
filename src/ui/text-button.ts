// TextButton.ts usable in Game.ts
export class TextButton extends Phaser.GameObjects.Text {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        style?: Phaser.Types.GameObjects.Text.TextStyle,
    ) {
        const defaultStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: "Arial",
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#a5d739",
            padding: { x: 10, y: 5 },
        };
        super(scene, x, y, text, style ?? defaultStyle);
        scene.add.existing(this);
        this.setInteractive();
    }

    public onClick(callback: () => void) {
        this.on("pointerdown", callback);
    }
}
