import { Scene, GameObjects } from "phaser";
import { PreparationScene } from "./preparation-scene";

// Define the MainMenu class that extends Phaser's Scene class
export class MainMenu extends Scene {
    // Declare properties for background image, logo image, title text, and buttons
    background: GameObjects.Image;
    logo: GameObjects.Image;
    startButton: GameObjects.Text;

    // Constructor method to initialize the scene with the key 'MainMenu'
    constructor() {
        super("MainMenu");
    }

    // Create method to set up the scene's content
    create() {
        const preparationScene = new PreparationScene("preparation");

        // background color is #18ae31
        this.cameras.main.setBackgroundColor("#18ae31");

        // Add a logo image at coordinates (512, 300) with the key 'logo'
        this.logo = this.add.image(512, 240, "logo");
        this.logo.setScale(0.5); // Scale the logo image to 50%

        // Add a start button at coordinates (512, 640) with specific style properties
        this.startButton = this.add
            .text(512, 640, "Start Game", {
                fontFamily: "Arial Black",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                padding: { x: 10, y: 5 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        // Set up an input event listener for the start button
        this.startButton.on("pointerdown", () => {
            this.scene.add("preparation", preparationScene, true);
            this.scene.start("preparation");
        });
    }
}
