import Phaser from "phaser";

export class Budget extends Phaser.Events.EventEmitter {
    private _amount: number;

    constructor(amount: number) {
        super();
        this._amount = amount;
    }

    get amount() {
        return this._amount;
    }

    set amount(value: number) {
        this._amount = value;
        this.emit("change", this._amount);
    }

    getAmountString() {
        return this._amount.toFixed(2);
    }
}
