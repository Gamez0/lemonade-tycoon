export type Atmosphere = "sunny" | "little-cloudy" | "cloudy" | "rainy" | "snowy" ;

export type Time = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;

export type TemperatureByTime = {
  [K in Time]: number;
};

export interface WeatherForecast {
  temperatureByTime: TemperatureByTime; // time as key and temperature as value
  morning: Atmosphere; // 8:00 am - 12:00 pm
  afternoon: Atmosphere; // 12:00 pm - 4:00 pm
  evening: Atmosphere; // 4:00 pm - 8:00 pm
  isCelsius: boolean;
}