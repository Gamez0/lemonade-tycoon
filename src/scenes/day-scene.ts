import { Scene } from "phaser";
import { TextButton } from "../ui/text-button";

export class DayScene extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    skipButton: TextButton;
    kid: Phaser.GameObjects.Sprite;

    constructor() {
        super("day");
    }

    preload() {
        for (let i = 1; i <= 12; i++) {
            this.load.image(`kid-girl-${i}`, `assets/characters/kid-girl/kid-girl-${i}.png`);
        }
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor("rgb(24, 174, 49)");

        const map = this.make.tilemap({ key: "park-map" });
        const tileset = map.addTilesetImage("tilemap_packed", "tiles");

        if (tileset) {
            map.createLayer("Tile Layer 1", tileset);
            map.createLayer("Tile Layer 2", tileset);
            map.createLayer("Tile Layer 3", tileset);
        } else {
            console.error("Failed to load tileset");
        }

        this.skipButton = new TextButton(this, 410, 700, "SKIP");
        this.skipButton.on("pointerdown", () => {
            this.scene.switch("preparation");
        });

        this.anims.create({
            key: "stand-front",
            frames: [{ key: "kid-girl-1" }],
            frameRate: 10,
        });
        this.anims.create({
            key: "stand-back",
            frames: [{ key: "kid-girl-2" }],
            frameRate: 10,
        });
        this.anims.create({
            key: "stand-right",
            frames: [{ key: "kid-girl-3" }],
            frameRate: 10,
        });
        this.anims.create({
            key: "stand-left",
            frames: [{ key: "kid-girl-4" }],
            frameRate: 10,
        });

        this.anims.create({
            key: "walk-down",
            frames: [{ key: "kid-girl-5" }, { key: "kid-girl-6" }],
            frameRate: 6,
            repeat: -1,
        });

        this.anims.create({
            key: "walk-up",
            frames: [{ key: "kid-girl-7" }, { key: "kid-girl-8" }],
            frameRate: 6,
            repeat: -1,
        });

        this.anims.create({
            key: "walk-right",
            frames: [{ key: "kid-girl-9" }, { key: "kid-girl-10" }],
            frameRate: 6,
            repeat: -1,
        });

        this.anims.create({
            key: "walk-left",
            frames: [{ key: "kid-girl-11" }, { key: "kid-girl-12" }],
            frameRate: 6,
            repeat: -1,
        });

        this.kid = this.add.sprite(100, 300, "kid-girl-1").setScale(2);
        this.kid.play("stand-front");

        this.tweens.add({
            targets: this.kid,
            x: 500,
            duration: 3000,
            ease: "Linear",
            repeat: -1,
            yoyo: true,

            onUpdate: (tweens) => {
                if (tweens.elapsed % 6000 < 3000) {
                    this.kid.play("walk-right", true);
                } else if (tweens.elapsed % 6000 >= 3000) {
                    this.kid.play("walk-left", true);
                }
            },
        });
    }
}
