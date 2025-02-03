import { DescriptionText } from "./description-text";
import { TitleText } from "./title-text";

export class StaffContainer extends Phaser.GameObjects.Container {
    title: TitleText;
    description: DescriptionText;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.title = new TitleText(scene, 0, 0, "Staff");
        this.description = new DescriptionText(
            scene,
            0,
            30,
            "Hire the right person at the right time \nto send your sales through the roof."
        );
        this.add([this.title, this.description]);
        scene.add.existing(this);
    }
}
