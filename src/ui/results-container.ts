import Result from "../models/result";
import { DescriptionText } from "./description-text";
import { TitleText } from "./title-text";

export class ResultsContainer extends Phaser.GameObjects.Container {
    private title: TitleText;

    constructor(scene: Phaser.Scene, x: number, y: number, yesterdayResult?: Result) {
        super(scene, x, y);
        this.title = new TitleText(scene, 0, 0, "Yesterday's Results");
        this.add(this.title);

        if (!yesterdayResult) {
            const noResults = new DescriptionText(scene, 0, 40, "No results yet.\nStart your first day to see how it went!");
            this.add(noResults);
        } else {
            const cupsSold = yesterdayResult.getCupsSold();
            const revenue = yesterdayResult.getProfit();

            const rows: [string, string][] = [
                ["Cups Sold", `${cupsSold}`],
                ["Revenue", `$${revenue.toFixed(2)}`],
            ];

            rows.forEach(([label, value], i) => {
                const y = 50 + i * 40;
                const labelText = new DescriptionText(scene, 0, y, label);
                const valueText = new TitleText(scene, 240, y, value);
                this.add([labelText, valueText]);
            });
        }

        scene.add.existing(this);
    }
}
