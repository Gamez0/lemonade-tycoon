import { Scene } from "phaser";
import { TextButton } from "../ui/text-button";
import { Atmosphere, Time } from "../types/weather-forecast";
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
import { Recipe } from "../models/recipe";
import { GameDataFromDayScene, GameDataFromPreparationScene, PreparationScene } from "./preparation-scene";
import Price from "../models/price";
import CustomerQueue from "../models/customerQueue";
import LemonadePitcher from "../models/lemonadePitcher";
import WeatherForecast from "../types/weather-forecast";
import PerformanceContainer from "../ui/performance-container";
import Result from "../models/result";
import { getTooExpensiveReview, getTooLongQueueReview } from "../data/reviewText";
import Reviews, { Review } from "../models/reviews";

const MAP_POSITION = { x: 515, y: 194 };
const MAP_SIZE = { width: 480, height: 384 };
const LEMONADE_STAND_POSITION = { x: 512 + 188, y: 194 + 200 };

const CHARACTER_SPRITE_SIZE = 16;
const TOTAL_CHARACTER_SPRITES = 20;
const TOTAL_CHARACTER_POSITION = 12;

const AVERAGE_CUSTOMER_PATIENCE = 5;

const LEMONADE_MAKE_DELAY = 3000;
const LEMONADE_SALE_DELAY = 1000;
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

interface CustomerListByHour {
    [key: number]: Customer[];
}

export class DayScene extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    supplyStatusContainer: SupplyStatusContainer;
    budgetContainer: BudgetContainer;
    gameControlUI: GameControlContainer;
    performanceContainer: PerformanceContainer;
    weatherNewsContainer: WeatherNewsContainer;
    mapContainer: MapContainer;
    skipButton: TextButton;

    // Game Data
    budget: Budget;
    supplies: Supplies;
    weatherForecast: WeatherForecast;
    news: string;
    _date: _Date;
    rentedLocation: RentedLocation;
    recipe: Recipe;
    price: Price;

    // Temporary Game Data
    lemonadePitcher: LemonadePitcher = new LemonadePitcher(0);
    todayResult: Result = new Result(0, 0);
    reviews: Reviews = new Reviews();

    pathPoints: { x: number; y: number }[];
    customerQueue: CustomerQueue;

    enterObjectLayer: Phaser.Tilemaps.ObjectLayer | null;
    exitObjectLayer: Phaser.Tilemaps.ObjectLayer | null;

    timerEvent: Phaser.Time.TimerEvent;
    enterIntervalDuration: Phaser.Time.TimerEvent;
    queueIntervalDuration: Phaser.Time.TimerEvent;
    sellIntervalDuration: Phaser.Time.TimerEvent;

    customerQueueSprites: Map<Customer, Phaser.GameObjects.Sprite> = new Map();

    isAnimationCreated: boolean = false;

    customerListByHour: CustomerListByHour;

    sceneKey: string;

    constructor(key: string) {
        super({ key });
        this.sceneKey = key;
    }

    init(data: GameDataFromPreparationScene) {
        this.budget = data.budget;
        this.supplies = data.supplies;
        this.weatherForecast = data.weatherForecast;
        this.news = data.news;
        this._date = data._date;
        this.rentedLocation = data.rentedLocation;
        this.recipe = data.recipe;
        this.price = data.price;
    }

    preload() {
        this.load.spritesheet("characters", "assets/characters/characters.png", {
            frameWidth: CHARACTER_SPRITE_SIZE,
            frameHeight: CHARACTER_SPRITE_SIZE,
        });

        this.load.image("lemonade-pitcher", "assets/lemonade-pitcher-32.png");
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor("rgb(24, 174, 49)");

        this.supplyStatusContainer = new SupplyStatusContainer(this, 50, 25, this.supplies, this.lemonadePitcher);
        this.budgetContainer = new BudgetContainer(this, 900, 16, this.budget);
        this.performanceContainer = new PerformanceContainer(this, 0, 194, this.todayResult, this.reviews);
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
            this._date.setToNextDay();
            this.switchToPreparationScene();
        });

        this.makeLemonade({ disableDelay: true });

        this.lemonadePitcher.on("change", (amount: number) => {
            if (amount > 0) return;
            this.makeLemonade();
        });

        this.customerQueue = new CustomerQueue();
        this.customerQueue.on("change", () => {
            this.drawCustomerQueue();
        });

        this.customerListByHour = this.getCustomerList(this.weatherForecast);

        this.enterObjectLayer = map.getObjectLayer("Npc Enter Path");
        this.exitObjectLayer = map.getObjectLayer("Npc Exit Path");

        if (!this.isAnimationCreated) {
            this.createAnimation();
            this.isAnimationCreated = true;
        }

        const timerDuration = 12 * 6 * 1000; // 12시간 * 6초 * 1000ms

        this.timerEvent = this.time.addEvent({
            delay: timerDuration, // Duration in milliseconds
            callback: this.switchToPreparationScene, // Function to call when the timer ends
            callbackScope: this, // Scope in which to call the function
            loop: false,
        });

        const enterIntervalDuration = 1000;

        this.enterIntervalDuration = this.time.addEvent({
            delay: enterIntervalDuration,
            callback: this.customerEnterTheMap,
            callbackScope: this,
            loop: true,
        });

        const queueIntervalDuration = 1000;

        this.queueIntervalDuration = this.time.addEvent({
            delay: queueIntervalDuration,
            callback: this.updateCustomerQueue,
            callbackScope: this,
            loop: true,
        });

        this.sellIntervalDuration = this.time.addEvent({
            delay: LEMONADE_SALE_DELAY,
            callback: this.sellLemonade,
            callbackScope: this,
            loop: true,
        });
    }

    makeLemonade({ disableDelay }: { disableDelay?: boolean } = { disableDelay: false }) {
        // check if there are enough supplies
        if (this.supplies.isOutOfSupplies(this.recipe)) {
            return;
        }

        // decrease supplies
        this.supplies.lemon -= this.recipe.lemon;
        this.supplies.sugar -= this.recipe.sugar;
        this.supplies.ice -= this.recipe.ice * this.recipe.cupsPerPitcher;

        // fill lemonade pitcher
        // need delay because it takes time to make lemonade. just delay the process left below
        if (disableDelay) {
            this.lemonadePitcher.amount += this.recipe.cupsPerPitcher;
            return;
        }

        this.time.delayedCall(
            LEMONADE_MAKE_DELAY,
            () => {
                this.lemonadePitcher.amount += this.recipe.cupsPerPitcher;
            },
            [],
            this
        );
    }

    sellLemonade() {
        if (this.lemonadePitcher.amount <= 0) return;
        if (this.customerQueue.length <= 0) return;
        if (this.supplies.cup <= 0) return;

        const customer = this.customerQueue.dequeue() as Customer;
        // decrease lemonade pitcher
        this.lemonadePitcher.decrease();
        this.supplies.cup -= 1;

        // increase budget
        this.budget.amount += this.price.amount;

        // increase today's result
        this.todayResult.increaseCupsSold();
        this.todayResult.addProfit(this.price.amount);

        // dequeue the first customer
        this.customerLeaveTheMap(customer);
        // play exit customer animation

        // customer leaves review
        const { text: reviewText, star } = this.recipe.getReview(this.price, this.weatherForecast);
        const review = new Review(customer.getCharacterIndex(), reviewText, star);
        this.reviews.addReview(review);
    }

    customerEnterTheMap() {
        const elapsedTime = this.timerEvent.getElapsed();
        const enterIndex = Math.floor(elapsedTime / 1000 / 6) + 8;

        if (this.enterObjectLayer) {
            const customerListByHour = this.customerListByHour[enterIndex];
            if (!customerListByHour || !customerListByHour.length) return;
            const characterIndex = customerListByHour[0].getCharacterIndex();
            this.followEnterPath(characterIndex, MAP_POSITION, this.enterObjectLayer, customerListByHour[0]);
            customerListByHour.shift();
        }
    }

    updateCustomerQueue() {
        this.customerQueue.forEach((customer) => {
            customer.decreasePatience();
            if (customer.getPatience() <= 0) {
                // customer leaves review
                const review = new Review(customer.getCharacterIndex(), getTooLongQueueReview(), 0);
                this.reviews.addReview(review);
                // remove customer from queue
                this.customerQueue.removeCustomer(customer);
                this.drawCustomerQueue();
                // TODO: customer leave the map
                this.customerLeaveTheMap(customer);
            }
        });
    }

    drawCustomerQueue() {
        // Remove all current sprites if exists
        if (this.customerQueueSprites.size > 0) {
            this.customerQueueSprites.forEach((sprite) => {
                sprite.destroy();
            });
        }

        // Redraw the queue
        this.customerQueue.forEach((customer, index) => {
            let customerSpriteFrame = customer.getCharacterIndex() * TOTAL_CHARACTER_POSITION;
            if (index === 0) {
                customerSpriteFrame += 2;
            }
            const sprite = this.add.sprite(
                LEMONADE_STAND_POSITION.x,
                LEMONADE_STAND_POSITION.y - index * CHARACTER_SPRITE_SIZE,
                "characters",
                customerSpriteFrame
            );
            this.customerQueueSprites.set(customer, sprite);
        });
    }

    switchToPreparationScene() {
        const preparationScene = new PreparationScene(`preparation-${this._date.getDateString()}`);
        const data: GameDataFromDayScene = {
            budget: this.budget,
            supplies: this.supplies,
            rentedLocation: this.rentedLocation,
            _date: this._date,
            recipe: this.recipe,
            price: this.price,
            todayResult: this.todayResult,
        };
        this.scene.add(`preparation-${this._date.getDateString()}`, preparationScene, true, data);
        this.scene.start(`preparation-${this._date.getDateString()}`);

        this.scene.get(this.scene.key).sys.shutdown();
        this.scene.stop(this.scene.key);
        this.scene.remove(this.scene.key);
    }

    createAnimation() {
        for (let i = 0; i < TOTAL_CHARACTER_SPRITES; i++) {
            if (!this.anims.exists(`walk-down-${i}`)) {
                this.anims.create({
                    key: `walk-down-${i}`,
                    frames: this.anims.generateFrameNumbers("characters", { start: i * 12 + 4, end: i * 12 + 5 }),
                    frameRate: 6,
                    repeat: -1,
                });
            }

            if (!this.anims.exists(`walk-up-${i}`)) {
                this.anims.create({
                    key: `walk-up-${i}`,
                    frames: this.anims.generateFrameNumbers("characters", { start: i * 12 + 6, end: i * 12 + 7 }),
                    frameRate: 6,
                    repeat: -1,
                });
            }

            if (!this.anims.exists(`walk-right-${i}`)) {
                this.anims.create({
                    key: `walk-right-${i}`,
                    frames: this.anims.generateFrameNumbers("characters", { start: i * 12 + 8, end: i * 12 + 9 }),
                    frameRate: 6,
                    repeat: -1,
                });
            }

            if (!this.anims.exists(`walk-left-${i}`)) {
                this.anims.create({
                    key: `walk-left-${i}`,
                    frames: this.anims.generateFrameNumbers("characters", { start: i * 12 + 10, end: i * 12 + 11 }),
                    frameRate: 6,
                    repeat: -1,
                });
            }
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
            const newCustomer = new Customer(characterIndex, AVERAGE_CUSTOMER_PATIENCE);
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

    followEnterPath(
        characterIndex: number,
        mapPosition: MapPosition,
        enterObjectLayer: Phaser.Tilemaps.ObjectLayer,
        customer: Customer
    ) {
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
            this.followPath({
                characterIndex,
                sprite: npc,
                pathPoints: this.pathPoints,
                shouldDestroySpriteAfterComplete: true,
                onComplete: this.checkLemonadeStand.bind(this, customer),
            });
        }
    }

    checkLemonadeStand(customer: Customer) {
        if (this.supplies.isOutOfSupplies(this.recipe) && this.lemonadePitcher.amount === 0) {
            // if out of supplies
            this.customerLeaveTheMap(customer);
            // TODO: customer leaves review or feedback animation
            return;
        }
        // TODO: weather, time, popularity, price, etc. should be considered also.
        const priceRange = 2 + Number((Phaser.Math.RND.integerInRange(-20, 20) / 100).toFixed(1));
        if (this.price.amount > priceRange) {
            // if price is high
            this.customerLeaveTheMap(customer);
            // customer leaves review
            const review = new Review(customer.getCharacterIndex(), getTooExpensiveReview(), 0);
            this.reviews.addReview(review);
            return;
        }

        if (this.customerQueue.length >= 5) {
            // if queue is not too long
            this.customerLeaveTheMap(customer);
            const review = new Review(customer.getCharacterIndex(), getTooLongQueueReview(), 0);
            this.reviews.addReview(review);
            return;
        }
        // TODO
        // if popular
        // if weather is good
        // if time is good

        const weatherPoint = this.isVeryHot() ? 30 : this.isHot() ? 15 : this.isCold() ? -15 : 0;
        // TODO: add popularity to the point
        const enQueuePoint = Math.floor(Math.random() * 100 + weatherPoint);
        if (enQueuePoint > 50) {
            this.customerQueue.enqueue(customer);
        } else {
            this.customerLeaveTheMap(customer);
        }
    }

    isVeryHot() {
        const elapsedTime = this.timerEvent.getElapsed();
        const timeIndex = Math.floor(elapsedTime / 1000 / 6) + 8;

        const temperature = this.weatherForecast.temperatureByTime[timeIndex as Time];
        return temperature > 30;
    }

    isHot() {
        const elapsedTime = this.timerEvent.getElapsed();
        const timeIndex = Math.floor(elapsedTime / 1000 / 6) + 8;

        const temperature = this.weatherForecast.temperatureByTime[timeIndex as Time];
        return temperature > 25;
    }

    isCold() {
        const elapsedTime = this.timerEvent.getElapsed();
        const timeIndex = Math.floor(elapsedTime / 1000 / 6) + 8;

        const temperature = this.weatherForecast.temperatureByTime[timeIndex as Time];
        return temperature < 20;
    }

    customerLeaveTheMap(customer: Customer) {
        if (!this.exitObjectLayer) return;
        this.followExitPath(customer.getCharacterIndex(), MAP_POSITION, this.exitObjectLayer);
    }

    followExitPath(characterIndex: number, mapPosition: MapPosition, exitObjectLayer: Phaser.Tilemaps.ObjectLayer) {
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
            this.followPath({
                characterIndex,
                sprite: npc,
                pathPoints: this.pathPoints,
                loopPath: false,
                shouldDestroySpriteAfterComplete: true,
            });
        }
    }

    destroySprite(sprite: Phaser.GameObjects.Sprite) {
        sprite.destroy();
    }

    followPath({
        characterIndex,
        sprite,
        pathPoints,
        onComplete,
        loopPath = false,
        shouldDestroySpriteAfterComplete = false,
    }: {
        characterIndex: number;
        sprite: Phaser.GameObjects.Sprite;
        pathPoints: PathPoint[];
        onComplete?: (characterIndex: number) => void;
        loopPath?: boolean;
        shouldDestroySpriteAfterComplete: boolean;
    }) {
        let index = 0;

        const moveToNextPoint = () => {
            if (index >= pathPoints.length) {
                onComplete?.call(this, characterIndex);
                if (shouldDestroySpriteAfterComplete) {
                    sprite.destroy();
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
