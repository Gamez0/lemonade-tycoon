import Phaser from "phaser";
import { Supplies } from "../models/supplies";
import { TitleText } from "./title-text";
import LemonadePitcher from "../models/lemonadePitcher";

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
    private lemonadePitcher: LemonadePitcher | undefined;
    private lemonadePitcherImage: Phaser.GameObjects.Image;
    private lemonadePitcherText: TitleText;

    constructor(scene: Phaser.Scene, x: number, y: number, supplies: Supplies, lemonadePitcher?: LemonadePitcher) {
        super(scene, x, y);

        this.supplies = supplies;
        this.lemonadePitcher = lemonadePitcher;

        this.lemonImage = scene.add.image(0, 12, "lemon");
        this.lemonText = new TitleText(scene, 30, 0, this.supplies.lemon.toString());

        this.sugarImage = scene.add.image(100, 12, "sugar");
        this.sugarText = new TitleText(scene, 130, 0, this.supplies.sugar.toString());

        this.iceImage = scene.add.image(200, 12, "ice");
        this.iceText = new TitleText(scene, 230, 0, this.supplies.ice.toString());

        this.cupImage = scene.add.image(300, 12, "cup");
        this.cupText = new TitleText(scene, 330, 0, this.supplies.cup.toString());

        if (this.lemonadePitcher) {
            this.lemonadePitcherImage = scene.add.image(400, 12, "lemonade-pitcher");
            this.lemonadePitcherText = new TitleText(scene, 430, 0, this.lemonadePitcher.amount.toString());
            this.lemonadePitcher.on("change", (amount: number) => {
                this.lemonadePitcherText.setText(amount.toString());
            });
            this.add([this.lemonadePitcherImage, this.lemonadePitcherText]);
        }

        this.supplies.on("lemonChanged", (lemon: number) => {
            this.lemonText.setText(lemon.toString());
        });

        this.supplies.on("sugarChanged", (sugar: number) => {
            this.sugarText.setText(sugar.toString());
        });

        this.supplies.on("iceChanged", (ice: number) => {
            this.iceText.setText(ice.toString());
        });

        this.supplies.on("cupChanged", (cup: number) => {
            this.cupText.setText(cup.toString());
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

        scene.events.on(Phaser.Scenes.Events.SHUTDOWN, this.onSceneShutdown, this);
    }

    private onSceneShutdown() {
        this.supplies.off("lemonChanged");
        this.supplies.off("sugarChanged");
        this.supplies.off("iceChanged");
        this.supplies.off("cupChanged");
        this.lemonadePitcher?.off("change");
    }
}
