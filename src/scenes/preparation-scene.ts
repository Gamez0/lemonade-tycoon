import { Scene } from "phaser";
import { SupplyStatusContainer } from "../ui/supply-status-container";
import { BudgetContainer } from "../ui/budget-container";
import { GameControlContainer } from "../ui/game-control-container";
import { Supplies } from "../models/supplies";
import { Budget } from "../models/budget";
import { TextButton } from "../ui/text-button";
import { RentedLocation } from "../models/location";
import WeatherNewsContainer from "../ui/weather-news-container";
import { TemperatureByTime, WeatherForecast } from "../types/weather-forecast";
import { changeTemperatureToFahrenheit } from "../utils";
import MapContainer from "../ui/map-container";
import { DayScene } from "./day-scene";
import _Date from "../models/_date";
import { Recipe } from "../models/recipe";
import Price from "../models/price";

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
}

export class PreparationScene extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    private budget: Budget;
    private supplies: Supplies;
    private rentedLocation: RentedLocation;
    private _date: _Date;
    private recipe: Recipe;
    private price: Price;
    supplyStatusContainer: SupplyStatusContainer;
    budgetContainer: BudgetContainer;
    gameControlUI: GameControlContainer;
    startButton: TextButton;
    weatherNewsContainer: WeatherNewsContainer;
    mapContainer: MapContainer;

    private sceneKey: string;

    constructor(key: string) {
        super({ key });
        this.sceneKey = key;
    }

    preload() {
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
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor("rgb(24, 174, 49)");

        const weatherForecast = this.getWeatherForecast({ isCelsius: true });
        const news = this.getNews();

        this.supplyStatusContainer = new SupplyStatusContainer(this, 50, 25, this.supplies);
        this.budgetContainer = new BudgetContainer(this, 924, 16, this.budget);
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
        });
    }

    getNews(): string {
        return "Today's news: Sunny day. \nPerfect day for selling lemonade!";
    }

    getWeatherForecast({ isCelsius }: { isCelsius: boolean }): WeatherForecast {
        const temperatureByTime: TemperatureByTime = this.generateTemperatureByTime(isCelsius);
        return {
            temperatureByTime,
            morning: "sunny",
            afternoon: "sunny",
            evening: "sunny",
            isCelsius,
        };
    }

    generateTemperatureByTime(isCelsius: boolean): TemperatureByTime {
        const temperatureByTime = {} as TemperatureByTime;
        for (let i = 0; i < 24; i++) {
            // generate random temperature
            const temperature = Math.floor(Math.random() * 30) + 10;
            temperatureByTime[i as keyof TemperatureByTime] = isCelsius
                ? temperature
                : changeTemperatureToFahrenheit(temperature);
        }
        return temperatureByTime;
    }
}
