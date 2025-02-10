// work time: 8:00 am - 20:00 pm (12 hours)
// idea: work time control. (can have break time)

import { Atmosphere, WeatherForecast } from "../types/weather-forecast";


interface Date {
    year: number;
    month: number;
    day: number;
}

// TODO: selling scene 에선 isPreparationScene 이 false 로 들어옴, 그에 맞는 UI 를 보여주도록 수정
export default class WeatherNewsContainer extends Phaser.GameObjects.Container {
    date: Phaser.GameObjects.Text;
    todayTemperature: Phaser.GameObjects.Text;
    news: Phaser.GameObjects.Text;
    background: Phaser.GameObjects.Rectangle;
    morningAtmosphereImage: Phaser.GameObjects.Image;
    afternoonAtmosphereImage: Phaser.GameObjects.Image;
    eveningAtmosphereImage: Phaser.GameObjects.Image;
    
    
    constructor(scene:Phaser.Scene, x:number, y:number, date: Date, weatherForecast:WeatherForecast, news:string, isPreparationScene?: boolean) {
        super(scene, x, y);

        const padding = 16;
        
        this.date = scene.add.text(0 + padding, 0 + padding, this.getDate(date), { fontSize: "16px" });
        this.news = scene.add.text(244, 32 + padding, news, { fontSize: "12px" });
        this.todayTemperature = scene.add.text(0 + padding, 24 + padding, this.getTodayTemperature(weatherForecast), { fontSize: "16px" });

        this.morningAtmosphereImage = scene.add.image(16 + padding, 72 + padding, this.getAtmosphereImage(weatherForecast.morning));
        this.afternoonAtmosphereImage = scene.add.image(80 + padding, 72 + padding, this.getAtmosphereImage(weatherForecast.afternoon));
        this.eveningAtmosphereImage = scene.add.image(144 + padding, 72 + padding, this.getAtmosphereImage(weatherForecast.evening));
        
        const backgroundWidth = 488;
        const backgroundHeight = 120;
        this.background = scene.add.rectangle(0, 0, backgroundWidth, backgroundHeight, 0x008229, 1);
        this.background.setOrigin(0, 0);
        this.add([this.background, this.date, this.news, this.todayTemperature, this.morningAtmosphereImage, this.afternoonAtmosphereImage, this.eveningAtmosphereImage]);
        scene.add.existing(this);
    }

    getDate(date:Date):string {
        return `Year ${date.year} Month ${date.month} Day ${date.day}`;
    }

    getTodayTemperature(weatherForecast: WeatherForecast):string {
        return `${this.getLowestTemperature(weatherForecast)}${weatherForecast.isCelsius ? 'C' : 'F'} - ${this.getHighestTemperature(weatherForecast)}${weatherForecast.isCelsius ? 'C' : 'F'}`;
    }

    getLowestTemperature(weatherForecast: WeatherForecast):number {
        return Math.min(...Object.values(weatherForecast.temperatureByTime));
    }

    getHighestTemperature(weatherForecast: WeatherForecast):number {
        return Math.max(...Object.values(weatherForecast.temperatureByTime));
    }

    getAtmosphereImage(atmosphere: Atmosphere): string {
        switch(atmosphere) {
            case 'sunny':
                return 'sunny-24';
            case 'cloudy':
                return 'cloudy-24';
            case 'rainy':
                return 'rainy-24';
            case 'little-cloudy':
                return 'little-cloudy-24';
            default:
                return 'sunny-24';
        }
    }
}