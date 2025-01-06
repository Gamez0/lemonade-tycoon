// src/models/Supplies.ts
export class Supplies {
    private _lemon: number;
    private _sugar: number;
    private _ice: number;
    private _cup: number;

    constructor(lemon: number, sugar: number, ice: number, cup: number) {
        this._lemon = lemon;
        this._sugar = sugar;
        this._ice = ice;
        this._cup = cup;
    }

    get lemon(): number {
        return this._lemon;
    }

    set lemon(value: number) {
        this._lemon = value;
    }

    get sugar(): number {
        return this._sugar;
    }

    set sugar(value: number) {
        this._sugar = value;
    }

    get ice(): number {
        return this._ice;
    }

    set ice(value: number) {
        this._ice = value;
    }

    get cup(): number {
        return this._cup;
    }

    set cup(value: number) {
        this._cup = value;
    }
}