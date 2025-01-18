import { ItemPurchaseContainer } from "./item-purchase-container";

class BuyItems extends Phaser.GameObjects.Container {
    firstOption: ItemPurchaseContainer;
    secondOption: ItemPurchaseContainer;
    thirdOption: ItemPurchaseContainer;

    constructor(scene: Phaser.Scene, x: number, y: number, itemName: string, prices: number[], amounts: number[]) {
        super(scene, x, y);

        this.firstOption = new ItemPurchaseContainer(scene, 0, 0, itemName, amounts[0], prices[0]);
        this.secondOption = new ItemPurchaseContainer(scene, 0, 50, itemName, amounts[1], prices[1]);
        this.thirdOption = new ItemPurchaseContainer(scene, 0, 100, itemName, amounts[2], prices[2]);

        this.add([this.firstOption, this.secondOption, this.thirdOption]);
        scene.add.existing(this);
    }

    public getTotalPrice() {
        return this.firstOption.getTotalPrice() + this.secondOption.getTotalPrice() + this.thirdOption.getTotalPrice();
    }

    public getAmount() {
        return this.firstOption.getAmount() + this.secondOption.getAmount() + this.thirdOption.getAmount();
    }

    public reset() {
        this.firstOption.reset();
        this.secondOption.reset();
        this.thirdOption.reset();
    }
}

export class BuySugar extends BuyItems {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "sugar", [4.8, 7.0, 15.0], [12, 24, 48]);
    }
}

export class BuyLemons extends BuyItems {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "lemons", [4.8, 7.2, 9.6], [12, 24, 48]);
    }
}

export class BuyIce extends BuyItems {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "cubes", [1, 3, 5], [50, 200, 500]);
    }
}

export class BuyCups extends BuyItems {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "cups", [1, 2.35, 3.75], [75, 225, 400]);
    }
}
