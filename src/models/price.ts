export default class Price extends Phaser.Events.EventEmitter {
    private _amount: number;

    constructor(amount: number) {
        super();
        this._amount = amount;
    }

    get amount() {
        return this._amount;
    }

    set amount(amount: number) {
        this._amount = amount;
        this.emit("change", this._amount);
    }
}
