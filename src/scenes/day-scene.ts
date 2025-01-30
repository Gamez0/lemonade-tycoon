import { Scene } from "phaser";
import { TextButton } from "../ui/text-button";

export class DayScene extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    skipButton: TextButton;

    constructor() {
        super("day");
    }

    preload() {}

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor("rgb(24, 174, 49)");
        this.skipButton = new TextButton(this, 410, 700, "SKIP");
        this.skipButton.on("pointerdown", () => {
            this.scene.start("preparation");
        });
    }
}
