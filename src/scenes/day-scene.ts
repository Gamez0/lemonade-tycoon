import { Scene } from "phaser";

export class DayScene extends Scene {
    constructor() {
        super("day");
    }

    preload() {}

    create() {
        this.add.text(400, 300, "Day Scene", {
            fontSize: "32px",
            color: "#000",
        });
    }
}
