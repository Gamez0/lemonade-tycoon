import Phaser from "phaser";

export class Budget extends Phaser.Events.EventEmitter{
    private _amount: number;

    constructor(amount: number) {
        super();
        this._amount = amount;
    }

    getAmount = (): number => {
        return this._amount;
    }

    setAmount = (value: number) => {
        this._amount = value;
        this.emit('budgetAmountChanged', this._amount);
    }
}