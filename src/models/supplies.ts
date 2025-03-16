import Phaser from "phaser";
import type { Recipe } from "./recipe";
export class Supplies extends Phaser.Events.EventEmitter {
    private _lemon: number;
    private _sugar: number;
    private _ice: number;
    private _cup: number;
    // TODO: 구매할 때마다 평단가 업데이트
    private _lemonAveragePrice: number;
    private _sugarAveragePrice: number;
    private _iceAveragePrice: number;
    private _cupAveragePrice: number;

    constructor(
        lemon: number,
        sugar: number,
        ice: number,
        cup: number,
        lemonAveragePrice: number,
        sugarAveragePrice: number,
        iceAveragePrice: number,
        cupAveragePrice: number
    ) {
        super();
        this._lemon = lemon;
        this._sugar = sugar;
        this._ice = ice;
        this._cup = cup;
        this._lemonAveragePrice = lemonAveragePrice;
        this._sugarAveragePrice = sugarAveragePrice;
        this._iceAveragePrice = iceAveragePrice;
        this._cupAveragePrice = cupAveragePrice;
    }

    get lemon(): number {
        return this._lemon;
    }

    set lemon(value: number) {
        this._lemon = value;
        this.emit("lemonChanged", this._lemon);
    }

    get sugar(): number {
        return this._sugar;
    }

    set sugar(value: number) {
        this._sugar = value;
        this.emit("sugarChanged", this._sugar);
    }

    get ice(): number {
        return this._ice;
    }

    set ice(value: number) {
        this._ice = value;
        this.emit("iceChanged", this._ice);
    }

    get cup(): number {
        return this._cup;
    }

    set cup(value: number) {
        this._cup = value;
        this.emit("cupChanged", this._cup);
    }

    get lemonAveragePrice(): number {
        return this._lemonAveragePrice;
    }

    set lemonAveragePrice(value: number) {
        this._lemonAveragePrice = value;
        this.emit("averagePriceChanged", this._lemonAveragePrice);
    }

    get sugarAveragePrice(): number {
        return this._sugarAveragePrice;
    }

    set sugarAveragePrice(value: number) {
        this._sugarAveragePrice = value;
        this.emit("averagePriceChanged", this._sugarAveragePrice);
    }

    get iceAveragePrice(): number {
        return this._iceAveragePrice;
    }

    set iceAveragePrice(value: number) {
        this._iceAveragePrice = value;
        this.emit("averagePriceChanged", this._iceAveragePrice);
    }

    get cupAveragePrice(): number {
        return this._cupAveragePrice;
    }

    set cupAveragePrice(value: number) {
        this._cupAveragePrice = value;
        this.emit("averagePriceChanged", this._cupAveragePrice);
    }

    isOutOfSupplies(recipe: Recipe): boolean {
        return (
            this._lemon < recipe.lemon ||
            this._sugar < recipe.sugar ||
            this._ice < recipe.ice * recipe.cupsPerPitcher ||
            this._cup < 1
        );
    }

    updateAveragePrice(
        lemonTotalPrice: number,
        lemonTotalAmount: number,
        sugarTotalPrice: number,
        sugarTotalAmount: number,
        iceTotalPrice: number,
        iceTotalAmount: number,
        cupsTotalPrice: number,
        cupsTotalAmount: number
    ) {
        if (lemonTotalAmount > 0) {
            const newLemonAverageAmount =
                (this._lemonAveragePrice * this._lemon + lemonTotalPrice) / (this._lemon + lemonTotalAmount);
            this.lemonAveragePrice = Number(newLemonAverageAmount.toFixed(2));
        }

        if (sugarTotalAmount > 0) {
            const newSugarAverageAmount =
                (this._sugarAveragePrice * this._sugar + sugarTotalPrice) / (this._sugar + sugarTotalAmount);
            this.sugarAveragePrice = Number(newSugarAverageAmount.toFixed(2));
        }

        if (iceTotalAmount > 0) {
            const newIceAverageAmount =
                (this._iceAveragePrice * this._ice + iceTotalPrice) / (this._ice + iceTotalAmount);
            this.iceAveragePrice = Number(newIceAverageAmount.toFixed(2));
        }

        if (cupsTotalAmount > 0) {
            const newCupAverageAmount =
                (this._cupAveragePrice * this._cup + cupsTotalPrice) / (this._cup + cupsTotalAmount);
            this.cupAveragePrice = Number(newCupAverageAmount.toFixed(2));
        }
    }
}
