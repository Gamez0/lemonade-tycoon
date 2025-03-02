export default class Price extends Phaser.Events.EventEmitter {
    private _amount: number;

    constructor(amount: number) {
        super();
        this._amount = amount;
    }

    get amount() {
        return Number(this._amount.toFixed(2));
    }

    get amountString() {
        return this._amount.toFixed(2);
    }

    set amount(amount: number) {
        this._amount = amount;
        this.emit("change", this._amount);
    }

    increase() {
        this.amount += 0.1;
    }

    decrease() {
        this.amount -= 0.1;
    }
}
