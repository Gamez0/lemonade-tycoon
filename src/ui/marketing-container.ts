import { DescriptionText } from "./description-text";
import { TitleText } from "./title-text";

export class MarketingContainer extends Phaser.GameObjects.Container {
    firstTitle: TitleText;
    firstDescription: DescriptionText;

    secondTitle: TitleText;
    secondDescription: DescriptionText;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.firstTitle = new TitleText(scene, 0, 0, "Price");
        this.firstDescription = new DescriptionText(
            scene,
            0,
            30,
            "Skills, instinct, judgement, luck... Do you \nhave what it takes to set the perfect price?"
        );
        this.secondTitle = new TitleText(scene, 0, 150, "Advertising");
        this.secondDescription = new DescriptionText(
            scene,
            0,
            180,
            "When your reputation needs a little boost, \nspending a few dollars here can really make \nthe difference by attracting more customers \nto your stand."
        );
        this.add([this.firstTitle, this.firstDescription, this.secondTitle, this.secondDescription]);
        scene.add.existing(this);
    }
}
