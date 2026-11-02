import { WEATHER, type Weather } from "../content/catalog";

export type Three<T> = readonly [T, T, T];
export interface WeatherPeriods {
    readonly model: "arrival-periods-v1";
    readonly actual: Three<Weather>;
    readonly quotas: Three<number>;
}

const labels = ["Sunny", "Cloudy", "Rainy"] as const;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
function draw(seed: number): { seed: number; value: number } {
    const next = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return { seed: next, value: next / 4294967296 };
}

/** Product three-label adaptation; the original has six distinct weather identities. */
export function actualWeather(forecast: Three<Weather>, seed: number): { seed: number; actual: Three<Weather> } {
    if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error("Invalid weather seed.");
    const actual = forecast.map(weather => {
        const change = draw(seed), temperature = draw(change.seed);
        seed = temperature.seed;
        const roll = Math.floor(change.value * 7);
        const index = clamp(labels.indexOf(weather.label) + (roll === 0 ? -1 : roll === 6 ? 1 : 0), 0, 2);
        const label = labels[index];
        return { label, temperature: clamp(weather.temperature + Math.floor(temperature.value * 7) - 3, 10, 40),
            traffic: label === weather.label ? weather.traffic : WEATHER.find(entry => entry.label === label)!.traffic };
    }) as unknown as Three<Weather>;
    return { seed, actual };
}

/** Visitor numbers are one-based; the last occupied period remains while its queue drains. */
export function weatherPeriod(quotas: Three<number>, visitor: number): 0 | 1 | 2 {
    if (!Number.isSafeInteger(visitor) || visitor < 1) throw new Error("Visitor number must be positive.");
    const total = periodTraffic(quotas);
    if (total === 0) throw new Error("A weather day needs at least one visitor.");
    const ordinal = Math.min(visitor, total);
    if (ordinal <= quotas[0]) return 0;
    return ordinal <= quotas[0] + quotas[1] ? 1 : 2;
}

export function periodTraffic(quotas: Three<number>): number {
    if (quotas.length !== 3 || quotas.some(n => !Number.isSafeInteger(n) || n < 0 || n > 500))
        throw new Error("Weather quotas must be three nonnegative integers up to 500.");
    const total = quotas.reduce((sum, n) => sum + n, 0);
    if (total > 500) throw new Error("Weather traffic must not exceed 500.");
    return total;
}

export function periodWeather(periods: WeatherPeriods, visitor: number): Weather {
    return periods.actual[weatherPeriod(periods.quotas, visitor)];
}
