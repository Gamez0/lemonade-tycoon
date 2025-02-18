export function changeTemperatureToFahrenheit(temperature: number): number {
    return Math.round((temperature * 9) / 5 + 32);
}
