export class TextButton extends Phaser.GameObjects.Container {
    private startButton: Phaser.GameObjects.Text;
    private emptyButton: Phaser.GameObjects.Rectangle;
    private buttonWithRadius: Phaser.GameObjects.Graphics;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        isDisabled: boolean = false,
        style?: Phaser.Types.GameObjects.Text.TextStyle,
    ) {
        super(scene, x, y);

        // Create the button background

        // Create the text
        this.startButton = new Phaser.GameObjects.Text(scene, 0, 0, text, { ...defaultStyle(isDisabled), ...style });
        this.startButton.setOrigin(0.5); // Center the text
        const textWidth = this.startButton.width;
        const textHeight = this.startButton.height;

        this.emptyButton = new Phaser.GameObjects.Rectangle(scene, 0, 0, textWidth + 16, textHeight + 32, 0x000000, 0);
        this.emptyButton.setOrigin(0.5);
        this.emptyButton.setInteractive({ useHandCursor: !isDisabled });
        this.emptyButton.on("pointerdown", () => {
            if (isDisabled) return;
            this.emit("pointerdown");
        });

        this.buttonWithRadius = this.createRoundedBackground(textWidth, textHeight);

        this.add([this.buttonWithRadius, this.emptyButton, this.startButton]);
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

    public destory() {
        this.startButton.destroy();
        this.emptyButton.destroy();
        this.buttonWithRadius.destroy();
    }
}

const defaultStyle = (isDisabled: boolean): Phaser.Types.GameObjects.Text.TextStyle => {
    return {
        fontSize: "24px",
        color: isDisabled ? "#9bdb63" : "#ffffff", // Gray color if disabled, white if enabled
        align: "center",
    };
};
