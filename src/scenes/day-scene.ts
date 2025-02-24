import { Scene } from "phaser";
import { TextButton } from "../ui/text-button";
import { Atmosphere, Time, WeatherForecast } from "../types/weather-forecast";
import { Customer } from "../models/customer";
import { changeTemperatureToFahrenheit } from "../utils";
import { Budget } from "../models/budget";
import { Supplies } from "../models/supplies";
import _Date from "../models/_date";
import { SupplyStatusContainer } from "../ui/supply-status-container";
import { BudgetContainer } from "../ui/budget-container";
import { GameControlContainer } from "../ui/game-control-container";
import WeatherNewsContainer from "../ui/weather-news-container";
import MapContainer from "../ui/map-container";
import { RentedLocation } from "../models/location";

const MAP_POSITION = { x: 515, y: 194 };
const MAP_SIZE = { width: 480, height: 384 };

interface MapPosition {
    x: number;
    y: number;
}

interface PathPoint {
    x: number;
    y: number;
}

interface PathObject {
    x: number;
    y: number;
    polyline: { x: number; y: number }[];
    properties: { name: string; type: string; value: string }[];
}

export class DayScene extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    supplyStatusContainer: SupplyStatusContainer;
    budgetContainer: BudgetContainer;
    gameControlUI: GameControlContainer;
    weatherNewsContainer: WeatherNewsContainer;
    mapContainer: MapContainer;
    skipButton: TextButton;
    budget: Budget;
    supplies: Supplies;
    weatherForecast: WeatherForecast;
    news: string;
    _date: _Date;
    rentedLocation: RentedLocation;
    pathPoints: { x: number; y: number }[];
    queue: Customer[] = [];

    constructor(key: string) {
        super({ key });
    }

    init(data: {
        budget: Budget;
        supplies: Supplies;
        weatherForecast: WeatherForecast;
        news: string;
        _date: _Date;
        rentedLocation: RentedLocation;
    }) {
        this.budget = data.budget;
        this.supplies = data.supplies;
        this.weatherForecast = data.weatherForecast;
        this.news = data.news;
        this._date = data._date;
        this.rentedLocation = data.rentedLocation;
    }

    preload() {
        this.load.spritesheet("characters", "assets/characters/characters.png", {
            frameWidth: 16,
            frameHeight: 16,
        });
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor("rgb(24, 174, 49)");

        this.supplyStatusContainer = new SupplyStatusContainer(this, 50, 25, this.supplies);
        this.budgetContainer = new BudgetContainer(this, 924, 16, this.budget);
        this.gameControlUI = new GameControlContainer(this, 0, 144, this.budget, this.supplies, this.rentedLocation);
        this.weatherNewsContainer = new WeatherNewsContainer(
            this,
            512,
            64,
            this._date,
            this.weatherForecast,
            this.news,
            true
        );

        const map = this.make.tilemap({ key: "park-map" });
        const tileset = map.addTilesetImage("tilemap_packed", "tiles");
        this.mapContainer = new MapContainer(this, 512, 194, map, tileset, this.rentedLocation);

        this.skipButton = new TextButton(this, 950, 555, "SKIP");
        this.skipButton.on("pointerdown", () => {
            this.scene.switch("preparation", {
                budget: this.budget,
                supplies: this.supplies,
                weatherForecast: this.weatherForecast,
                news: this.news,
                _date: this._date.getNextDay(),
            });
        });

        const customerList = this.getCustomerList(this.weatherForecast);

        const enterObjectLayer = map.getObjectLayer("Npc Enter Path");
        const exitObjectLayer = map.getObjectLayer("Npc Exit Path");

        if (enterObjectLayer) {
            for (let i = 0; i < 12; i++) {
                const temp = customerList[i];
                if (temp) {
                    for (let j = 0; j < temp.length; j++) {
                        this.enterMap(customerList[i][j].getCharacterIndex(), MAP_POSITION, enterObjectLayer);
                    }
                }
            }
            this.enterMap(4, MAP_POSITION, enterObjectLayer);
        }

        this.createAnimation();
    }

    createAnimation() {
        for (let i = 0; i < 12; i++) {
            this.anims.create({
                key: `stand-front-${i}`,
                frames: this.anims.generateFrameNumbers("characters", { start: i * 12 + 0, end: i * 12 + 1 }),
            });

            this.anims.create({
                key: `stand-back-${i}`,
                frames: this.anims.generateFrameNumbers("characters", { start: i * 12 + 2, end: i * 12 + 3 }),
            });

            this.anims.create({
                key: `walk-down-${i}`,
                frames: this.anims.generateFrameNumbers("characters", { start: i * 12 + 4, end: i * 12 + 5 }),
                frameRate: 6,
                // repeat 은 -1 이면 무한반복이기 때문에 테스트할 땐 -1로 설정하지만 조작했을 땐 한번만 하는게 맞다.
                repeat: -1,
            });

            this.anims.create({
                key: `walk-up-${i}`,
                frames: this.anims.generateFrameNumbers("characters", { start: i * 12 + 6, end: i * 12 + 7 }),
                frameRate: 6,
                repeat: -1,
            });

            this.anims.create({
                key: `walk-right-${i}`,
                frames: this.anims.generateFrameNumbers("characters", { start: i * 12 + 8, end: i * 12 + 9 }),
                frameRate: 6,
                repeat: -1,
            });

            this.anims.create({
                key: `walk-left-${i}`,
                frames: this.anims.generateFrameNumbers("characters", { start: i * 12 + 10, end: i * 12 + 11 }),
                frameRate: 6,
                repeat: -1,
            });

            this.anims.create({
                key: `stand-right-${i}`,
                // just standing to the right
                frames: [{ key: "characters", frame: i * 12 + 2 }],
            });
        }
    }

    getCustomerList(weatherForecast: WeatherForecast) {
        const { morning, afternoon, evening, temperatureByTime, isCelsius } = weatherForecast;
        const customerList: { [key: number]: Customer[] } = {};
        for (let i = 8; i <= 19; i++) {
            const atmosphere = i < 12 ? morning : i < 18 ? afternoon : evening;
            const celsiusTemperature = isCelsius
                ? temperatureByTime[i as Time]
                : changeTemperatureToFahrenheit(temperatureByTime[i as Time]);
            customerList[i] = this.makeCustomerListByTime(i, celsiusTemperature, atmosphere);
        }
        return customerList;
    }

    private makeCustomerListByTime(time: number, celsiusTemperature: number, atmosphere: Atmosphere) {
        // TODO: location should be added to paramters
        const customerList = [];
        const customerCount = this.setCustomerCount(time, celsiusTemperature, atmosphere);
        for (let i = 0; i < customerCount; i++) {
            // FIX ME: 이부분 때문에 화면에 케릭터가 떠 있음
            const characterIndex = Math.floor(Math.random() * 19);
            const newCustomer = new Customer(characterIndex, 10);
            customerList.push(newCustomer);
        }
        return customerList;
    }

    private setCustomerCount(time: number, celsiusTemperature: number, atmosphere: Atmosphere) {
        let defaultCount = 2;
        if (time >= 12 && time < 18) {
            // if time is morning, customer count is low
            // if time is afternoon, customer count is high
            // if time is evening, customer count is low
            defaultCount *= 2;
        }
        if (celsiusTemperature > 25) {
            // if temperature is high, customer count is high
            // if temperature is low, customer count is low
            defaultCount *= 2;
        }
        if (atmosphere === "sunny") {
            // if atmosphere is sunny, customer count is high
            // if atmosphere is rainy, customer count is low
            defaultCount *= 2;
        }
        return defaultCount;
    }

    enterMap(characterIndex: number, mapPosition: MapPosition, enterObjectLayer: Phaser.Tilemaps.ObjectLayer) {
        const enterPaths = enterObjectLayer.objects.filter((obj) => obj.name.startsWith("enter")) as PathObject[];

        const enterPath = enterPaths[Math.floor(Math.random() * enterPaths.length)];
        const initDirection = enterPath.properties.find((prop) => prop.name === "initDirection")?.value ?? "right";
        const initDirectionIndex = ["down", "up", "right", "left"].indexOf(initDirection);

        if (!enterPath || !enterPath.polyline) {
            console.error("NPC path or polyline missing in Tiled.");
            return;
        }

        this.pathPoints = enterPath.polyline.map((point) => ({
            x: enterPath.x + point.x + mapPosition.x,
            y: enterPath.y + point.y + mapPosition.y,
        }));

        // Create NPC sprite at the first point of the path
        const npc = this.add.sprite(
            this.pathPoints[0].x,
            this.pathPoints[0].y,
            "characters",
            characterIndex * 12 + initDirectionIndex
        );

        // Start the path-following animation
        if (npc) {
            this.followPath(characterIndex, npc, this.pathPoints);
        }
    }

    leaveMap(characterIndex: number, mapPosition: MapPosition, exitObjectLayer: Phaser.Tilemaps.ObjectLayer) {
        const exitPaths = exitObjectLayer.objects.filter((obj) => obj.name.startsWith("exit")) as PathObject[];
        const exitPath = exitPaths[Math.floor(Math.random() * exitPaths.length)];
        if (!exitPath || !exitPath.polyline) {
            console.error("NPC path or polyline missing in Tiled.");
            return;
        }

        this.pathPoints = exitPath.polyline.map((point) => ({
            x: exitPath.x + point.x + mapPosition.x, // Add offset based on polyline's origin
            y: exitPath.y + point.y + mapPosition.y, // Same for the y position
        }));

        // Create NPC sprite at the first point of the path
        const npc = this.add.sprite(this.pathPoints[0].x, this.pathPoints[0].y, "characters", characterIndex * 12);

        // Start the path-following animation
        if (npc) {
            this.followPath(characterIndex, npc, this.pathPoints, true);
        }
    }

    followPath(
        characterIndex: number,
        sprite: Phaser.GameObjects.Sprite,
        pathPoints: PathPoint[],
        destroyAfterComplete: boolean = false,
        loopPath: boolean = false
    ) {
        let index = 0;

        const moveToNextPoint = () => {
            if (index >= pathPoints.length) {
                if (destroyAfterComplete) {
                    sprite.destroy(); // Destroy NPC after completing the path
                }
                if (loopPath) {
                    index = 0;
                } else {
                    return;
                }

                // index = 0; // Loop back to the beginning if you want continuous movement
            }
            const currentPoint = pathPoints[index - 1] || sprite;

            const nextPoint = pathPoints[index++];

            // Determine direction
            if (nextPoint.x > currentPoint.x) {
                sprite.play(`walk-right-${characterIndex}`);
            } else if (nextPoint.x < currentPoint.x) {
                sprite.play(`walk-left-${characterIndex}`);
            } else if (nextPoint.y > currentPoint.y) {
                sprite.play(`walk-down-${characterIndex}`);
            } else if (nextPoint.y < currentPoint.y) {
                sprite.play(`walk-up-${characterIndex}`);
            }

            this.tweens.add({
                targets: sprite,
                x: nextPoint.x,
                y: nextPoint.y,
                duration: 1000,
                ease: "Linear",
                onComplete: moveToNextPoint, // Move to next point after this tween completes
            });
        };

        moveToNextPoint(); // Start movement
    }
}
