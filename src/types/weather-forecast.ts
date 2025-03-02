export default class WeatherForecast extends Phaser.Events.EventEmitter {
    private _temperatureByTime: TemperatureByTime;
    private _morning: Atmosphere;
    private _afternoon: Atmosphere;
    private _evening: Atmosphere;
    private _isCelsius: boolean;

    constructor(
        temperatureByTime: TemperatureByTime,
        morning: Atmosphere,
        afternoon: Atmosphere,
        evening: Atmosphere,
        isCelsius: boolean
    ) {
        super();
        this._temperatureByTime = temperatureByTime;
        this._morning = morning;
        this._afternoon = afternoon;
        this._evening = evening;
        this._isCelsius = isCelsius;
    }

    get temperatureByTime(): TemperatureByTime {
        return this._temperatureByTime;
    }

    get morning(): Atmosphere {
        return this._morning;
    }

    get afternoon(): Atmosphere {
        return this._afternoon;
    }

    get evening(): Atmosphere {
        return this._evening;
    }

    get isCelsius(): boolean {
        return this._isCelsius;
    }
}

export type Atmosphere = "sunny" | "little-cloudy" | "cloudy" | "rainy" | "snowy";

export type Time =
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23;

export type TemperatureByTime = {
    [K in Time]: number;
};

export type Season = "spring" | "summer" | "autumn" | "winter";

export const tempRanges: Record<Season, [number, number]> = {
    winter: [-10, 10],
    spring: [15, 25],
    summer: [26, 35],
    autumn: [15, 25],
};
