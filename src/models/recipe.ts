import { PITCHER_PER_ICE } from "../constants";
import { getReviewsByStar } from "../data/reviewText";
import WeatherForecast from "../types/weather-forecast";
import Price from "./price";
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

    getFlavor(): "good" | "bad" | "perfect" {
        const ratio = this.getRatio();
        if (this._sugar >= 3 && ratio === 2) {
            return "perfect";
        } else if (ratio >= 1.5 && ratio <= 2.5 && this._lemon >= 2 && this._sugar >= 1) {
            return "good";
        } else {
            return "bad";
        }
    }

    getRatio(): number {
        return this._lemon / this._sugar;
    }

    getFlavorReview(): string[] {
        const ratio = this.getRatio();
        const reviews = [];
        if (ratio === 2) {
            reviews.push("Perfect balance between lemon and sugar.");
        } else if (ratio > 2) {
            reviews.push("More sugar will be better.");
        } else {
            reviews.push("More lemon will be better.");
        }

        return reviews;
    }

    getReview(price: Price, weatherForecast: WeatherForecast): { text: string; star: number } {
        const flavor = this.getFlavor();
        const flavorReview = this.getFlavorReview();
        const star = flavor === "perfect" ? 3 : flavor === "good" ? 2 : 1;
        return { text: Phaser.Math.RND.pick([...flavorReview, ...getReviewsByStar(star)]), star };
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
