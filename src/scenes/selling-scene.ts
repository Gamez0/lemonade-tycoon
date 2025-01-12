import { Scene } from "phaser";

export class SellingScene extends Scene {
    constructor() {
        super('selling');
    }

    create() {
        this.add.text(100, 100, 'Selling Scene', { fontSize: '24px' });
    }

}