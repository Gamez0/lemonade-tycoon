import { Scene } from "phaser";
import { TextButton } from "../ui/text-button";
import { Atmosphere, Time, WeatherForecast } from "../types/weather-forecast";
import { Customer } from "../models/customer";
import { changeTemperatureToFahrenheit } from "../utils";
import { Budget } from "../models/budget";
import { Supplies } from "../models/supplies";

export class DayScene extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    skipButton: TextButton;
    kid: Phaser.GameObjects.Sprite;
    test: Phaser.GameObjects.Sprite;
    budget: Budget;
    supplies: Supplies;
    weatherForecast: WeatherForecast;
    news: string;

    constructor() {
        super("day");
    }

    init(data: { budget: Budget; supplies: Supplies; weatherForecast: WeatherForecast; news: string }) {
        this.budget = data.budget;
        this.supplies = data.supplies;
        this.weatherForecast = data.weatherForecast;
        this.news = data.news;
    }

    preload() {
        for (let i = 1; i <= 12; i++) {
            this.load.image(`kid-girl-${i}`, `assets/characters/kid-girl/kid-girl-${i}.png`);
        }

        this.load.spritesheet("characters", "assets/characters/characters.png", {
            frameWidth: 16,
            frameHeight: 16,
        });
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor("rgb(24, 174, 49)");

        const map = this.make.tilemap({ key: "park-map" });
        const tileset = map.addTilesetImage("tilemap_packed", "tiles");

        if (tileset) {
            const mapX = 515;
            const mapY = 194;
            map.createLayer("Tile Layer 1", tileset)?.setPosition(mapX, mapY);
            map.createLayer("Tile Layer 2", tileset)?.setPosition(mapX, mapY);
            map.createLayer("Tile Layer 3", tileset)?.setPosition(mapX, mapY);
        } else {
            console.error("Failed to load tileset");
        }

        this.skipButton = new TextButton(this, 960, 700, "SKIP");
        this.skipButton.on("pointerdown", () => {
            this.scene.switch("preparation");
        });

        const customerList = this.getCustomerList(this.weatherForecast);

        this.test = this.add.sprite(100, 100, "characters", 4);

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
        }

        this.test.play("walk-left-0", true);

        // this.anims.create({
        //     key: "stand-front",
        //     frames: [{ key: "kid-girl-1" }],
        //     frameRate: 10,
        // });
        // this.anims.create({
        //     key: "stand-back",
        //     frames: [{ key: "kid-girl-2" }],
        //     frameRate: 10,
        // });
        // this.anims.create({
        //     key: "stand-right",
        //     frames: [{ key: "kid-girl-3" }],
        //     frameRate: 10,
        // });
        // this.anims.create({
        //     key: "stand-left",
        //     frames: [{ key: "kid-girl-4" }],
        //     frameRate: 10,
        // });

        // this.anims.create({
        //     key: "walk-down",
        //     frames: [{ key: "kid-girl-5" }, { key: "kid-girl-6" }],
        //     frameRate: 6,
        //     repeat: -1,
        // });

        // this.anims.create({
        //     key: "walk-up",
        //     frames: [{ key: "kid-girl-7" }, { key: "kid-girl-8" }],
        //     frameRate: 6,
        //     repeat: -1,
        // });

        // this.anims.create({
        //     key: "walk-right",
        //     frames: [{ key: "kid-girl-9" }, { key: "kid-girl-10" }],
        //     frameRate: 6,
        //     repeat: -1,
        // });

        // this.anims.create({
        //     key: "walk-left",
        //     frames: [{ key: "kid-girl-11" }, { key: "kid-girl-12" }],
        //     frameRate: 6,
        //     repeat: -1,
        // });

        // this.kid = this.add.sprite(100, 300, "kid-girl-1");

        // this.tweens.add({
        //     targets: this.kid,
        //     x: 500,
        //     duration: 3000,
        //     ease: "Linear",
        //     repeat: -1,
        //     yoyo: true,

        //     onUpdate: (tweens) => {
        //         if (tweens.elapsed % 6000 < 3000) {
        //             this.kid.play("walk-right", true);
        //         } else if (tweens.elapsed % 6000 >= 3000) {
        //             this.kid.play("walk-left", true);
        //         }
        //     },
        // });
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
            const character = this.add.sprite(100, 300, "characters", 4);
            const newCustomer = new Customer(character, 10);
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
}
