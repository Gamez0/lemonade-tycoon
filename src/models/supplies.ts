import Phaser from "phaser";
export class Supplies extends Phaser.Events.EventEmitter {
    private _lemon: number;
    private _sugar: number;
    private _ice: number;
    private _cup: number;

    constructor(lemon: number, sugar: number, ice: number, cup: number) {
        super();
        this._lemon = lemon;
        this._sugar = sugar;
        this._ice = ice;
        this._cup = cup;
    }

    get lemon(): number {
        return this._lemon;
    }

    setLemon(value: number) {
        this._lemon = value;
        this.emit('lemonAmountChanged', this._lemon);
    }

    get sugar(): number {
        return this._sugar;
    }

    setSugar(value: number) {
        this._sugar = value;
        this.emit('sugarAmountChanged', this._sugar);
    }

    get ice(): number {
        return this._ice;
    }

    setIce(value: number) {
        this._ice = value;
        this.emit('iceAmountChanged', this._ice);
    }

    get cup(): number {
        return this._cup;
    }

    setCup(value: number) {
        this._cup = value;
        this.emit('cupAmountChanged', this._cup);
    }
}