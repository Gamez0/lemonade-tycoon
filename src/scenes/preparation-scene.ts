import { Scene } from "phaser";
import { SupplyStatusContainer } from "../ui/supply-status-container";
import { BudgetContainer } from "../ui/budget-container";
import { GameControlContainer } from "../ui/game-control-container";
import { Supplies } from "../models/supplies";
import { Budget } from "../models/budget";
import { TextButton } from "../ui/text-button";
import { RentedLocation } from "../models/location";
import WeatherNewsContainer from "../ui/weather-news-container";
import WeatherForecast, { TemperatureByTime, tempRanges } from "../types/weather-forecast";
import { changeTemperatureToFahrenheit } from "../utils";
import MapContainer from "../ui/map-container";
import { DayScene } from "./day-scene";
import _Date from "../models/_date";
import { Recipe } from "../models/recipe";
import Price from "../models/price";
import Result from "../models/result";

export interface GameDataFromPreparationScene {
    budget: Budget;
    supplies: Supplies;
    weatherForecast: WeatherForecast;
    news: string;
    _date: _Date;
    rentedLocation: RentedLocation;
    recipe: Recipe;
    price: Price;
}

export interface GameDataFromDayScene {
    budget: Budget;
    supplies: Supplies;
    rentedLocation: RentedLocation;
    _date: _Date;
    recipe: Recipe;
    price: Price;
    todayResult: Result;
}

export class PreparationScene extends Scene {
    private bgm: Phaser.Sound.BaseSound;
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    private budget: Budget;
    private supplies: Supplies;
    private rentedLocation: RentedLocation;
    private _date: _Date;
    private recipe: Recipe;
    private price: Price;
    private yesterdayResult?: Result;
    supplyStatusContainer: SupplyStatusContainer;
    budgetContainer: BudgetContainer;
    gameControlUI: GameControlContainer;
    startButton: TextButton;
    weatherNewsContainer: WeatherNewsContainer;
    mapContainer: MapContainer;
    speakerButton: Phaser.GameObjects.Image;

    private sceneKey: string;

    constructor(key: string) {
        super({ key });
        this.sceneKey = key;
    }

    preload() {
        this.load.audio("bgm", "assets/audio/bgm.mp3");
        this.load.image("lemon", "assets/lemon-32.png");
        this.load.image("ice", "assets/ice-32.png");
        this.load.image("sugar", "assets/sugar-32.png");
        this.load.image("cup", "assets/cup-32.png");
        this.load.image("plus", "assets/plus.svg");
        this.load.image("minus", "assets/minus.svg");
        this.load.image("cup-16", "assets/cup-16.png");
        this.load.image("recipe-16", "assets/recipe-16.png");
        this.load.image("marketing-32", "assets/marketing-32.png");
        this.load.image("recipe-32", "assets/recipe-32.png");
        this.load.image("rent-32", "assets/rent-32.png");
        this.load.image("results-32", "assets/results-32.png");
        this.load.image("staff-32", "assets/staff-32.png");
        this.load.image("supplies-32", "assets/supplies-32.png");
        this.load.image("upgrades-32", "assets/upgrades-32.png");
        this.load.image("sunny-24", "assets/sunny-24.png");
        this.load.image("cloudy-24", "assets/cloudy-24.png");
        this.load.image("rainy-24", "assets/rainy-24.png");
        this.load.image("little-cloudy-24", "assets/little-cloudy-24.png");
        this.load.image("speaker-32", "assets/speaker-32.png");
        this.load.image("speaker-mute-32", "assets/speaker-mute-32.png");

        this.load.image("tiles", "assets/tiles/tilemap_packed.png");
        this.load.tilemapTiledJSON("park-map", "assets/tiles/park.json");
    }

    init(data: GameDataFromDayScene) {
        this.budget = data.budget ?? new Budget(100);
        this.supplies = data.supplies ?? new Supplies(0, 0, 0, 0, 0, 0, 0, 0);
        this.rentedLocation = data.rentedLocation ?? new RentedLocation();
        this._date = data._date ?? new _Date(2025, 7, 1);
        this.recipe = data.recipe ?? new Recipe(1, 1, 1, this.supplies);
        this.price = data.price ?? new Price(1);
        this.yesterdayResult = data.todayResult;
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor("rgb(24, 174, 49)");

        this.loadBgm();

        const weatherForecast = this.getWeatherForecast({ isCelsius: true });
        const news = this.getNews();

        this.supplyStatusContainer = new SupplyStatusContainer(this, 50, 25, this.supplies);
        this.budgetContainer = new BudgetContainer(this, 900, 16, this.budget);
        this.gameControlUI = new GameControlContainer(
            this,
            0,
            144,
            this.price,
            this.budget,
            this.supplies,
            this.rentedLocation,
            this.recipe
        );
        this.weatherNewsContainer = new WeatherNewsContainer(this, 512, 64, this._date, weatherForecast, news, true);
        const map = this.make.tilemap({ key: "park-map" });
        const tileset = map.addTilesetImage("tilemap_packed", "tiles");
        this.mapContainer = new MapContainer(this, 512, 194, map, tileset, this.rentedLocation);

        this.startButton = new TextButton(this, 410, 700, "START GAME");
        this.startButton.setInteractive();
        this.startButton.on("pointerdown", () => {
            // Create a new instance of the DayScene
            const dayScene = new DayScene(`day-${this._date.getDateString()}`);
            // // Add the new instance to the scene manager
            const data: GameDataFromPreparationScene = {
                budget: this.budget,
                supplies: this.supplies,
                weatherForecast,
                news,
                _date: this._date,
                rentedLocation: this.rentedLocation,
                recipe: this.recipe,
                price: this.price,
            };
            this.scene.add(`day-${this._date.getDateString()}`, dayScene, true, data);
            this.scene.start(`day-${this._date.getDateString()}`);
            this.scene.get(this.sceneKey).sys.shutdown();
            this.scene.stop(this.sceneKey);
            this.scene.remove(this.sceneKey);
            this.sound.remove(this.bgm);
        });
    }

    loadBgm() {
        // add bgm and play it
        if (!this.sound.get("bgm")) {
            this.bgm = this.sound.add("bgm", { loop: true, volume: 0.5 });
            const isBgmPaused = this.registry.get("bgmPaused");
            if (isBgmPaused) {
                this.bgm.pause();
                return;
            }
            this.bgm.play();
        }
        // add speaker image
        this.speakerButton = this.add
            .image(50, 718, this.registry.get("bgmPaused") ? "speaker-mute-32" : "speaker-32")
            .setInteractive({ cursor: "pointer" });
        // add event listener to speaker image
        this.speakerButton.on("pointerdown", () => {
            const isBgmPaused = this.registry.get("bgmPaused");
            if (isBgmPaused) {
                this.bgm.play();
                this.speakerButton.setTexture("speaker-32");
                this.registry.set("bgmPaused", false);
            } else {
                this.bgm.pause();
                this.speakerButton.setTexture("speaker-mute-32");
                this.registry.set("bgmPaused", true);
            }
        });
    }

    getNews(): string {
        return "Today's news: Sunny day. \nPerfect day for selling lemonade!";
    }

    getWeatherForecast({ isCelsius }: { isCelsius: boolean }): WeatherForecast {
        const temperatureByTime: number = this.generateTemperatureByTime(isCelsius);
        return {
            temperatureByTime,
            morning: "sunny",
            afternoon: "sunny",
            evening: "sunny",
            isCelsius,
        };
        // const temperatureByTime: TemperatureByTime = this.generateTemperatureByTime(isCelsius);
        // const newWeatherForecast = new WeatherForecast(temperatureByTime, "sunny", "sunny", "sunny", isCelsius);
        // return newWeatherForecast;
    }

    generateTemperatureByTime(isCelsius: boolean): number {
        const month = this._date.getMonth();
        const temperature = getTemperature(month);
        return isCelsius ? temperature : changeTemperatureToFahrenheit(temperature);
    }
}

function getTemperature(month: number) {
    const season = month <= 2 || month === 12 ? "winter" : month <= 5 ? "spring" : month <= 8 ? "summer" : "autumn";
    const [min, max] = tempRanges[season];
    return Math.floor(Math.random() * (max - min) + min);
}
