import { BuyItem } from "./buy-item";

export class BuyLemons extends Phaser.GameObjects.Container {
    buy12lemons: BuyItem;
    buy24lemons: BuyItem;
    buy48lemons: BuyItem;
    private total: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.total = 0;
        
        const itemName = "lemons";
        
        this.buy12lemons = new BuyItem(scene, 0, 0, itemName, 12, 4.8);
        this.buy24lemons = new BuyItem(scene, 0, 50, itemName, 24, 7.2);
        this.buy48lemons = new BuyItem(scene, 0, 100, itemName, 48, 9.6);

        this.buy12lemons.on('update', this.updateTotal, this);
        this.buy24lemons.on('update', this.updateTotal, this);
        this.buy48lemons.on('update', this.updateTotal, this);

        this.add([this.buy12lemons, this.buy24lemons, this.buy48lemons]);
        scene.add.existing(this);
    }

    private updateTotal() {
        this.total = this.buy12lemons.getTotalPrice() + this.buy24lemons.getTotalPrice() + this.buy48lemons.getTotalPrice();
        console.log(this.total);
    }

    public getTotal() {
        return this.total;
    };
}