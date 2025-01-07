import { BuyItem } from "./buy-item";

export class BuyIce extends Phaser.GameObjects.Container {
    firstOption: BuyItem;
    secondOption: BuyItem;
    thirdOption: BuyItem;
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        const itemName = "cubes";
        
        this.firstOption = new BuyItem(scene, 0, 0, itemName, 50, 1);
        this.secondOption = new BuyItem(scene, 0, 50, itemName, 200, 3);
        this.thirdOption = new BuyItem(scene, 0, 100, itemName, 500, 5);

        this.add([this.firstOption, this.secondOption, this.thirdOption]);
        scene.add.existing(this);
    }

    public getTotalPrice() {
        return this.firstOption.getTotalPrice() + this.secondOption.getTotalPrice() + this.thirdOption.getTotalPrice();
    };

    public getAmount() {
        return this.firstOption.getAmount() + this.secondOption.getAmount() + this.thirdOption.getAmount();
    }

    public reset() {
        this.firstOption.reset();
        this.secondOption.reset();
        this.thirdOption.reset();
    }
}
