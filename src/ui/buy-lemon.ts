import { TextButton } from "./TextButton";

export class BuyLemon extends Phaser.GameObjects.Container {
    private addButton: TextButton;
    private subtractButton: TextButton;
    private quantityText: Phaser.GameObjects.Text;
    private priceText: Phaser.GameObjects.Text;
    private selectedQuantityText: number;
    private selectedQuantity: number;
    private price: number;
    private totalPrice: number;


    constructor(scene: Phaser.Scene, x: number, y: number, quantity: number, price: number) {
        super(scene, x, y);
        this.price = price;
        this.subtractButton = new TextButton(scene, 0, 0, '-', { fontSize: '24px' });
        this.subtractButton.setInteractive();
        this.subtractButton.on('pointerdown', this.onSubtractButtonClicked, this);

        this.quantityText = scene.add.text(50, 0, quantity.toString(), { fontSize: '24px' });
        
        this.addButton = new TextButton(scene, 100, 0, '+', { fontSize: '24px' });
        this.addButton.setInteractive();
        this.addButton.on('pointerdown', this.onAddButtonClicked, this);
        
        this.priceText = scene.add.text(150, 0, '$'+ price, { fontSize: '24px' });
        this.selectedQuantityText = 0;
        
        this.add([this.subtractButton, this.quantityText, this.addButton, this.priceText]);
        scene.add.existing(this);
    }

    private onAddButtonClicked() {
        this.selectedQuantityText += 1;
        this.updateTotalPrice();
        this.quantityText.setText(this.selectedQuantityText.toString());
        // if(this.selectedQuantityText > 9)
        //     this.addButton.setVisible(false);
    }



    private onSubtractButtonClicked() {
        if(this.selectedQuantityText <= 0)
            return;
        this.selectedQuantityText -= 1;
        this.updateTotalPrice();
        this.quantityText.setText(this.selectedQuantityText.toString());
        // if(this.selectedQuantityText = 0)
        //     this.subtractButton.setVisible(false);
    }

    private updateTotalPrice() {
        this.totalPrice = this.selectedQuantityText * this.price;
    }
}