import { DescriptionText } from "./description-text";
import { TitleText } from "./title-text";

export class UpgradesContainer extends Phaser.GameObjects.Container {
    title: TitleText;
    description: DescriptionText;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.title = new TitleText(scene, 0, 0, "Upgrades");
        this.description = new DescriptionText(
            scene,
            0,
            30,
            "Improve your stand to send your sales through \nthe roof!"
        );
        this.add([this.title, this.description]);
        scene.add.existing(this);
    }
}
