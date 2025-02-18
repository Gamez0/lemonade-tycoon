import { Scene } from "phaser";
import { TextButton } from "../ui/text-button";

export class DayScene extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    skipButton: TextButton;
    kid: Phaser.GameObjects.Sprite;
    test: Phaser.GameObjects.Sprite;

    constructor() {
        super("day");
    }

    preload() {
        for (let i = 1; i <= 12; i++) {
            this.load.image(`kid-girl-${i}`, `assets/characters/kid-girl/kid-girl-${i}.png`);
        }

        this.load.spritesheet("characters", "assets/characters/characters.png", {
            frameWidth: 16,
            frameHeight: 16,
        });
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor("rgb(24, 174, 49)");

        const map = this.make.tilemap({ key: "park-map" });
        const tileset = map.addTilesetImage("tilemap_packed", "tiles");

        if (tileset) {
            const mapX = 515;
            const mapY = 194;
            map.createLayer("Tile Layer 1", tileset)?.setPosition(mapX, mapY);
            map.createLayer("Tile Layer 2", tileset)?.setPosition(mapX, mapY);
            map.createLayer("Tile Layer 3", tileset)?.setPosition(mapX, mapY);
        } else {
            console.error("Failed to load tileset");
        }

        this.skipButton = new TextButton(this, 960, 700, "SKIP");
        this.skipButton.on("pointerdown", () => {
            this.scene.switch("preparation");
        });

        this.test = this.add.sprite(100, 100, "characters", 4);

        for (let i = 0; i < 12; i++) {
            this.anims.create({
                key: `stand-front-${i}`,
                frames: this.anims.generateFrameNumbers("characters", { start: i * 12 + 0, end: i * 12 + 1 }),
            });

            this.anims.create({
                key: `stand-back-${i}`,
                frames: this.anims.generateFrameNumbers("characters", { start: i * 12 + 2, end: i * 12 + 3 }),
            });

            this.anims.create({
                key: `walk-down-${i}`,
                frames: this.anims.generateFrameNumbers("characters", { start: i * 12 + 4, end: i * 12 + 5 }),
                frameRate: 6,
                // repeat 은 -1 이면 무한반복이기 때문에 테스트할 땐 -1로 설정하지만 조작했을 땐 한번만 하는게 맞다.
                repeat: -1,
            });

            this.anims.create({
                key: `walk-up-${i}`,
                frames: this.anims.generateFrameNumbers("characters", { start: i * 12 + 6, end: i * 12 + 7 }),
                frameRate: 6,
                repeat: -1,
            });

            this.anims.create({
                key: `walk-right-${i}`,
                frames: this.anims.generateFrameNumbers("characters", { start: i * 12 + 8, end: i * 12 + 9 }),
                frameRate: 6,
                repeat: -1,
            });

            this.anims.create({
                key: `walk-left-${i}`,
                frames: this.anims.generateFrameNumbers("characters", { start: i * 12 + 10, end: i * 12 + 11 }),
                frameRate: 6,
                repeat: -1,
            });
        }

        this.test.play("walk-left-0", true);

        // this.anims.create({
        //     key: "stand-front",
        //     frames: [{ key: "kid-girl-1" }],
        //     frameRate: 10,
        // });
        // this.anims.create({
        //     key: "stand-back",
        //     frames: [{ key: "kid-girl-2" }],
        //     frameRate: 10,
        // });
        // this.anims.create({
        //     key: "stand-right",
        //     frames: [{ key: "kid-girl-3" }],
        //     frameRate: 10,
        // });
        // this.anims.create({
        //     key: "stand-left",
        //     frames: [{ key: "kid-girl-4" }],
        //     frameRate: 10,
        // });

        // this.anims.create({
        //     key: "walk-down",
        //     frames: [{ key: "kid-girl-5" }, { key: "kid-girl-6" }],
        //     frameRate: 6,
        //     repeat: -1,
        // });

        // this.anims.create({
        //     key: "walk-up",
        //     frames: [{ key: "kid-girl-7" }, { key: "kid-girl-8" }],
        //     frameRate: 6,
        //     repeat: -1,
        // });

        // this.anims.create({
        //     key: "walk-right",
        //     frames: [{ key: "kid-girl-9" }, { key: "kid-girl-10" }],
        //     frameRate: 6,
        //     repeat: -1,
        // });

        // this.anims.create({
        //     key: "walk-left",
        //     frames: [{ key: "kid-girl-11" }, { key: "kid-girl-12" }],
        //     frameRate: 6,
        //     repeat: -1,
        // });

        // this.kid = this.add.sprite(100, 300, "kid-girl-1");

        // this.tweens.add({
        //     targets: this.kid,
        //     x: 500,
        //     duration: 3000,
        //     ease: "Linear",
        //     repeat: -1,
        //     yoyo: true,

        //     onUpdate: (tweens) => {
        //         if (tweens.elapsed % 6000 < 3000) {
        //             this.kid.play("walk-right", true);
        //         } else if (tweens.elapsed % 6000 >= 3000) {
        //             this.kid.play("walk-left", true);
        //         }
        //     },
        // });
    }
}
