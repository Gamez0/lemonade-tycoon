import Phaser from "phaser";
import { Supplies } from "../models/supplies";
import { TitleText } from "./title-text";

export class SupplyStatusContainer extends Phaser.GameObjects.Container {
    private supplies: Supplies;
    private lemonImage: Phaser.GameObjects.Image;
    private lemonText: TitleText;
    private sugarImage: Phaser.GameObjects.Image;
    private sugarText: TitleText;
    private iceImage: Phaser.GameObjects.Image;
    private iceText: TitleText;
    private cupImage: Phaser.GameObjects.Image;
    private cupText: TitleText;

    constructor(scene: Phaser.Scene, x: number, y: number, supplies: Supplies) {
        super(scene, x, y);

        this.supplies = supplies;

        this.lemonImage = scene.add.image(0, 12, "lemon");
        this.lemonText = new TitleText(scene, 30, 0, this.supplies.lemon.toString());

        this.sugarImage = scene.add.image(100, 12, "sugar");
        this.sugarText = new TitleText(scene, 130, 0, this.supplies.sugar.toString());

        this.iceImage = scene.add.image(200, 12, "ice");
        this.iceText = new TitleText(scene, 230, 0, this.supplies.ice.toString());

        this.cupImage = scene.add.image(300, 12, "cup");
        this.cupText = new TitleText(scene, 330, 0, this.supplies.cup.toString());

        this.supplies.on("lemonChanged", (lemon: number) => {
            this.lemonText.destroy();
            this.lemonText = new TitleText(this.scene, 30, 0, this.supplies.lemon.toString());
            this.add(this.lemonText);
        });

        this.supplies.on("sugarChanged", (sugar: number) => {
            this.sugarText.destroy();
            this.sugarText = new TitleText(this.scene, 130, 0, this.supplies.sugar.toString());
            this.add(this.sugarText);
        });

        this.supplies.on("iceChanged", (ice: number) => {
            this.iceText.destroy();
            this.iceText = new TitleText(this.scene, 230, 0, this.supplies.ice.toString());
            this.add(this.iceText);
        });

        this.supplies.on("cupChanged", (cup: number) => {
            this.cupText.destroy();
            this.cupText = new TitleText(this.scene, 330, 0, this.supplies.cup.toString());
            this.add(this.cupText);
        });

        this.add([
            this.lemonImage,
            this.lemonText,
            this.sugarImage,
            this.sugarText,
            this.iceImage,
            this.iceText,
            this.cupImage,
            this.cupText,
        ]);
        scene.add.existing(this);
    }
}
