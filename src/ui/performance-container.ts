import Result from "../models/result";
import { TitleText } from "./title-text";

export default class PerformanceContainer extends Phaser.GameObjects.Container {
    private performanceText: TitleText;
    private background: Phaser.GameObjects.Rectangle;

    private cupsSoldText: TitleText;
    private cupsSold: number;

    private profitText: TitleText;

    private result: Result;

    // TODO: cups sold, profit 까진 동일하게

    constructor(scene: Phaser.Scene, x: number, y: number, result: Result) {
        super(scene, x, y);

        const marginLeft = 16;
        const padding = 16;

        this.result = result;

        this.performanceText = new TitleText(scene, marginLeft + padding, padding, "PERFORMANCE");

        this.cupsSoldText = scene.add.text(marginLeft + padding, padding + 40, `Cups Sold: ${result.getCupsSold()}`);

        this.profitText = scene.add.text(marginLeft + padding, padding + 80, `Profit: $${result.getProfit()}`);

        result.on("cupsSoldChanged", (cupsSold: number) => {
            this.cupsSoldText.setText(`Cups Sold: ${cupsSold}`);
        });

        result.on("profitChanged", (profit: number) => {
            this.profitText.setText(`Profit: $${profit}`);
        });

        const backgroundWidth = 488;
        const backgroundHeight = 140;
        this.background = scene.add.rectangle(marginLeft, 0, backgroundWidth, backgroundHeight, 0x008229, 1);
        this.background.setOrigin(0, 0);

        this.add([this.background, this.performanceText, this.cupsSoldText, this.profitText]);
        this.scene.add.existing(this);

        scene.events.on(Phaser.Scenes.Events.SHUTDOWN, this.onSceneShutdown, this);
    }

    onSceneShutdown() {
        this.result.off("cupsSoldChanged");
        this.result.off("profitChanged");
    }
}
