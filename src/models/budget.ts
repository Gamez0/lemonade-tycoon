export class Budget {
    private _amount: number;

    constructor(amount: number) {
        this._amount = amount;
    }

    get amount(): number {
        return this._amount;
    }

    set amount(value: number) {
        this._amount = value;
    }
}