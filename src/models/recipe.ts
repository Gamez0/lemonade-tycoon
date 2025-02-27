import { PITCHER_PER_ICE } from "../constants";
import { Supplies } from "./supplies";

export class Recipe extends Phaser.Events.EventEmitter {
    private _lemon: number;
    private _sugar: number;
    private _ice: number;
    private _cupsPerPitcher: number;
    private _costPerCup: number;
    private supplies: Supplies;

    constructor(lemon: number, sugar: number, ice: number, supplies: Supplies) {
        super();

        this._lemon = lemon;
        this._sugar = sugar;
        this._ice = ice;

        this.supplies = supplies;

        this._cupsPerPitcher = PITCHER_PER_ICE[ice];
        this._costPerCup = this.getCostPerCup(lemon, sugar);
    }

    private getCostPerCup(lemon: number, sugar: number): number {
        const lemonCost = lemon * this.supplies.lemonAveragePrice;
        const sugarCost = sugar * this.supplies.sugarAveragePrice;
        const cupCost = this.supplies.cup;
        const totalCost = lemonCost + sugarCost + cupCost;

        return totalCost / this._cupsPerPitcher;
    }

    get lemon(): number {
        return this._lemon;
    }

    set lemon(value: number) {
        this._lemon = value;
        this._costPerCup = this.getCostPerCup(value, this._sugar);
        this.emit("change", this);
    }

    get sugar(): number {
        return this._sugar;
    }

    set sugar(value: number) {
        this._sugar = value;
        this._costPerCup = this.getCostPerCup(this._lemon, value);
        this.emit("change", this);
    }

    get ice(): number {
        return this._ice;
    }

    set ice(value: number) {
        this._ice = value;
        this._cupsPerPitcher = PITCHER_PER_ICE[value];
        this._costPerCup = this.getCostPerCup(this._lemon, this._sugar);
        this.emit("change", this);
    }

    get cupsPerPitcher(): number {
        return this._cupsPerPitcher;
    }

    get costPerCup(): number {
        return this._costPerCup;
    }
}
