export class TitleText extends Phaser.GameObjects.Text {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        style?: Phaser.Types.GameObjects.Text.TextStyle
    ) {
        super(scene, x, y, text, { ...defaultStyle, ...style });
        scene.add.existing(this);
    }
}

const defaultStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: "24px",
    color: "#ffffff",
    fontFamily: '"Play"',
};
