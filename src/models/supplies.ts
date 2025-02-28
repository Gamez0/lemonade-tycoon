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
    }

    get sugarAveragePrice(): number {
        return this._sugarAveragePrice;
    }

    set sugarAveragePrice(value: number) {
        this._sugarAveragePrice = value;
    }

    get iceAveragePrice(): number {
        return this._iceAveragePrice;
    }

    set iceAveragePrice(value: number) {
        this._iceAveragePrice = value;
    }

    get cupAveragePrice(): number {
        return this._cupAveragePrice;
    }

    set cupAveragePrice(value: number) {
        this._cupAveragePrice = value;
    }

    isOutOfSupplies(recipe: Recipe): boolean {
        return this._lemon < recipe.lemon || this._sugar < recipe.sugar || this._ice < recipe.ice || this._cup < 1;
    }
}
