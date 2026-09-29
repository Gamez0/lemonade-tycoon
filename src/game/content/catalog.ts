// Money is always integer cents. Recipe ingredients are small serving units.
export const ITEMS = {
    lemon: { name: "Lemon units", cost: 8, bundle: 40 },
    sugar: { name: "Sugar scoops", cost: 4, bundle: 20 },
    ice: { name: "Ice cubes", cost: 2, bundle: 60 },
    cup: { name: "Paper cups", cost: 6, bundle: 20 },
} as const;

export type Item = keyof typeof ITEMS;
export const ITEM_KEYS = Object.keys(ITEMS) as Item[];
export const WEATHER = [
    { label: "Sunny", temperature: 32, traffic: 48 },
    { label: "Cloudy", temperature: 23, traffic: 40 },
    { label: "Rainy", temperature: 18, traffic: 32 },
    { label: "Sunny", temperature: 28, traffic: 44 },
] as const;
export type Weather = (typeof WEATHER)[number];
export const CUSTOMERS = [
    { name: "Neighbor", budget: 0.95 },
    { name: "Walker", budget: 1.15 },
    { name: "Student", budget: 0.8 },
] as const;
