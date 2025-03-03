import Result from "../models/result";
import Reviews, { Review } from "../models/reviews";
import { TitleText } from "./title-text";

export default class PerformanceContainer extends Phaser.GameObjects.Container {
    private performanceText: TitleText;
    private background: Phaser.GameObjects.Rectangle;

    private cupsSoldText: TitleText;

    private profitText: TitleText;

    private result: Result;

    private reviewText: Phaser.GameObjects.Text;
    private reviews: Reviews;

    // TODO: cups sold, profit 까진 동일하게

    constructor(scene: Phaser.Scene, x: number, y: number, result: Result, reviews: Reviews) {
        super(scene, x, y);

        const marginLeft = 16;
        const padding = 16;

        this.result = result;
        this.reviews = reviews;

        this.performanceText = new TitleText(scene, marginLeft + padding, padding, "PERFORMANCE");

        this.cupsSoldText = scene.add.text(marginLeft + padding, padding + 40, `Cups Sold: ${result.getCupsSold()}`);

        this.profitText = scene.add.text(marginLeft + padding, padding + 80, `Profit: $${result.getProfit()}`);

        this.reviewText = scene.add.text(
            marginLeft + padding,
            padding + 120,
            this.reviews.getLatestReview()?.getText() || "No reviews yet"
        );

        result.on("cupsSoldChanged", (cupsSold: number) => {
            this.cupsSoldText.setText(`Cups Sold: ${cupsSold}`);
        });

        result.on("profitChanged", (profit: number) => {
            this.profitText.setText(`Profit: $${profit}`);
        });

        reviews.on("reviewAdded", (review: Review) => {
            this.reviewText.setText(review.getText());
        });

        const backgroundWidth = 488;
        const backgroundHeight = 180;
        this.background = scene.add.rectangle(marginLeft, 0, backgroundWidth, backgroundHeight, 0x008229, 1);
        this.background.setOrigin(0, 0);

        this.add([this.background, this.performanceText, this.cupsSoldText, this.profitText, this.reviewText]);
        this.scene.add.existing(this);

        scene.events.on(Phaser.Scenes.Events.SHUTDOWN, this.onSceneShutdown, this);
    }

    onSceneShutdown() {
        this.result.off("cupsSoldChanged");
        this.result.off("profitChanged");
        this.reviews.off("reviewAdded");
    }
}
