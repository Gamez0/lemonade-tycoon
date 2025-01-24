export class TextButton extends Phaser.GameObjects.Container {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        style?: Phaser.Types.GameObjects.Text.TextStyle,
        isDisabled: boolean = false
    ) {
        super(scene, x, y);

        // Create the button background

        // Create the text
        const startButton = new Phaser.GameObjects.Text(scene, 0, 0, text, { ...defaultStyle(isDisabled), ...style });
        startButton.setOrigin(0.5); // Center the text
        const textWidth = startButton.width;
        const textHeight = startButton.height;

        const buttonWithRadius = this.createRoundedBackground(textWidth, textHeight);

        this.add([buttonWithRadius, startButton]);
        scene.add.existing(this);

        startButton.setInteractive({ useHandCursor: true });
        startButton.on("pointerdown", () => {
            this.emit("startGame");
        });
    }

    private createRoundedBackground(textWidth: number, textHeight: number): Phaser.GameObjects.Graphics {
        const graphics = this.scene.add.graphics();
        const width = textWidth + 16; // Button width
        const height = textHeight + 32; // Button height
        const radius = 10; // Border radius

        // Set button background color
        const fillColor = 0x73cb21;
        graphics.fillStyle(fillColor, 1);
        graphics.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

        return graphics;
    }
}

const defaultStyle = (isDisabled: boolean): Phaser.Types.GameObjects.Text.TextStyle => {
    return {
        fontSize: "24px",
        color: isDisabled ? "#9bdb63" : "#ffffff", // Gray color if disabled, white if enabled
        align: "center",
    };
};
