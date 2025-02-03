import { TitleText } from "./title-text";

const titles = ["Yesterday's Results", "Charts", "Profit & Loss", "Balance Sheet"];

export class ResultsContainer extends Phaser.GameObjects.Container {
    title: TitleText;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.title = new TitleText(scene, 0, 0, titles[0]);
        this.add(this.title);
        scene.add.existing(this);
    }
}
