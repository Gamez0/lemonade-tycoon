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

        const emptyButton = new Phaser.GameObjects.Rectangle(scene, 0, 0, textWidth + 16, textHeight + 32, 0x000000, 0);
        emptyButton.setOrigin(0.5);
        emptyButton.setInteractive({ useHandCursor: !isDisabled });
        emptyButton.on("pointerdown", () => {
            if (isDisabled) return;
            this.emit("pointerdown");
        });

        const buttonWithRadius = this.createRoundedBackground(textWidth, textHeight);

        this.add([buttonWithRadius, startButton, emptyButton]);
        scene.add.existing(this);
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
