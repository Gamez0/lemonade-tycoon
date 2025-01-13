import { PITCHER_PER_ICE } from "../constants";

export class Recipe extends Phaser.Events.EventEmitter{
    private _lemon: number;
    private _sugar: number;
    private _ice: number;
    private _cupsPerPitcher: number;
    private _costPerCup: number;

    constructor(lemon: number, sugar: number, ice: number) {
        super();
        this._lemon = lemon;
        this._sugar = sugar;
        this._ice = ice;
        this._cupsPerPitcher = PITCHER_PER_ICE[ice];
        this._costPerCup = this.calculateCostPerCup(lemon, sugar, ice);
    }

    private calculateCostPerCup(lemon: number, sugar: number, ice: number): number {
        // TODO: Implement this method
        // 평균 구매가격을 어떻게 가져와야 하지?
        // lemon 개수 * lemon 평균 구매가
        // sugar 개수 * sugar 평균 구매가
        // ice 개수 * ice 평균 구매가
        // 위 세 가지를 더한 값에 pitcher를 나눈값이 costPerCup
        return 0;
    }

    get lemon(): number {
        return this._lemon;
    }

    set lemon(value: number) {
        this._lemon = value;
        this.emit('change', this);
    }

    get sugar(): number {
        return this._sugar;
    }

    set sugar(value: number) {
        this._sugar = value;
        this.emit('change', this);
    }

    get ice(): number {
        return this._ice;
    }

    set ice(value: number) {
        this._ice = value;
        this._cupsPerPitcher = PITCHER_PER_ICE[value];
        this.emit('change', this);
    }

    get cupsPerPitcher(): number {
        return this._cupsPerPitcher;
    }

    get costPerCup(): number {
        return this._costPerCup;
    }
}