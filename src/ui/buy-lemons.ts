import { ItemPurchaseContainer } from "./item-purchase-container";

export class BuyLemons extends Phaser.GameObjects.Container {
    firstOption: ItemPurchaseContainer;
    secondOption: ItemPurchaseContainer;
    thirdOption: ItemPurchaseContainer;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        const itemName = "lemons";
        
        this.firstOption = new ItemPurchaseContainer(scene, 0, 0, itemName, 12, 4.8);
        this.secondOption = new ItemPurchaseContainer(scene, 0, 50, itemName, 24, 7.2);
        this.thirdOption = new ItemPurchaseContainer(scene, 0, 100, itemName, 48, 9.6);

        this.add([this.firstOption, this.secondOption, this.thirdOption]);
        scene.add.existing(this);
    }


    public getTotalPrice() {
        return this.firstOption.getTotalPrice() + this.secondOption.getTotalPrice() + this.thirdOption.getTotalPrice();
    };

    // get how many lemons are bought
    public getAmount() {
        return this.firstOption.getAmount() + this.secondOption.getAmount() + this.thirdOption.getAmount();
    }

    public reset() {
        this.firstOption.reset();
        this.secondOption.reset();
        this.thirdOption.reset();
    }
}
