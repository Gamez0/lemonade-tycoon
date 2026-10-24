import type { Weather } from "./catalog";
import type { LocationId } from "./locations";

// Product adaptation of the observed weather/news/location relationships.
// Strengths are deliberately explicit tuning, not recovered original constants.
export const DAILY_NEWS = [
    { id: "ordinary", headline: "An ordinary trading day. Watch the forecast before choosing a pitch.", locations: [] as readonly LocationId[], factor: 1 },
    { id: "park-fair", headline: "A family fair brings more visitors to the Park.", locations: ["park"] as readonly LocationId[], factor: 1.6 },
    { id: "rail-delays", headline: "Rail disruption reduces foot traffic at the station.", locations: ["train-station"] as readonly LocationId[], factor: .45 },
    { id: "match-day", headline: "Match day draws a larger crowd to Hexa-Stad.", locations: ["stadium"] as readonly LocationId[], factor: 1.6 },
    { id: "beach-cleanup", headline: "Beach maintenance keeps many visitors away today.", locations: ["beach"] as readonly LocationId[], factor: .35 },
    { id: "mall-sale", headline: "A shopping event brings more people to the Mall.", locations: ["mall"] as readonly LocationId[], factor: 1.5 },
    { id: "roadworks", headline: "Roadworks reduce visitors in Downtown and Old Square.", locations: ["downtown", "old-square"] as readonly LocationId[], factor: .5 },
    { id: "school-break", headline: "A school break brings families to the Park and Magic Gardens.", locations: ["park", "magic-gardens"] as readonly LocationId[], factor: 1.35 },
    { id: "marina-show", headline: "A boat show brings more visitors to the Marina.", locations: ["marina"] as readonly LocationId[], factor: 1.5 },
] as const;
export interface DayConditions {
    readonly model: "weather-news-v1";
    readonly newsId: (typeof DAILY_NEWS)[number]["id"];
    readonly temperature: number;
    readonly weatherFactor: number;
    readonly newsFactor: number;
}
export const newsForDay = (day: number) => DAILY_NEWS[(Math.imul(day - 1, 7) >>> 0) % DAILY_NEWS.length];
export function locationConditions(day: number, location: LocationId, weather: Weather): DayConditions {
    const news = newsForDay(day);
    const rain: Record<LocationId, number> = { neighborhood: .45, park: .08, downtown: .65,
        beach: .05, "old-square": .25, "train-station": .8, mall: 1.4, marina: .2, stadium: .85, "magic-gardens": .1 };
    return { model: "weather-news-v1", newsId: news.id, temperature: location === "mall" ? 20 : weather.temperature,
        weatherFactor: weather.label === "Rainy" ? rain[location] : location === "mall" && weather.label === "Sunny" ? .8 : 1,
        newsFactor: news.locations.includes(location) ? news.factor : 1 };
}
export function validConditions(value: unknown, location: LocationId, weather: Weather): value is DayConditions {
    if (typeof value !== "object" || value === null) return false;
    const v = value as Partial<DayConditions>, news = DAILY_NEWS.find(n => n.id === v.newsId);
    if (!news || v.model !== "weather-news-v1") return false;
    const expected = locationConditions(1, location, weather);
    return v.temperature === expected.temperature && v.weatherFactor === expected.weatherFactor &&
        v.newsFactor === (news.locations.includes(location) ? news.factor : 1);
}
