import { LOCATIONS_DATA } from "../data/locations";

export class RentedLocation extends Phaser.Events.EventEmitter {
    private rentedLocationKey: number;
    private popularityList: number[];
    private satisfactionList: number[];

    constructor() {
        super();
        this.rentedLocationKey = 0;
        this.popularityList = [0, 0, 0, 0, 0];
        this.satisfactionList = [0, 0, 0, 0, 0];
    }

    getCurrentLocationKey = (): number => {
        return this.rentedLocationKey;
    };

    getCurrentLocationTitleText = (): string => {
        return LOCATIONS_DATA[this.rentedLocationKey].title;
    };

    getPopularity = (key: number): number => {
        return this.popularityList[key];
    };

    getSatisfaction = (key: number): number => {
        return this.satisfactionList[key];
    };

    setCurrentLocationKey = (key: number): void => {
        this.rentedLocationKey = key;
        this.emit("locationChanged", key);
    };

    setPopularity = (key: number, value: number): void => {
        this.popularityList[key] = value;
        this.emit("popularityChanged", key, value);
    };

    setSatisfaction = (key: number, value: number): void => {
        this.satisfactionList[key] = value;
        this.emit("satisfactionChanged", key, value);
    };

    getFee = (): number => {
        return LOCATIONS_DATA[this.rentedLocationKey].price;
    };
}
