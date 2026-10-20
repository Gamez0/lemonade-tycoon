export const LOCATIONS = {
    neighborhood: { name: "The Neighborhood", street: "Willow Lane", rent: 0, moveFee: 0,
        traffic: 1, budget: 1, weights: [3, 1, 2], patience: 18, arrival: 5,
        days: 0, revenue: 0, satisfaction: 0,
        description: "A quiet street and thirsty neighbors. No rent: a safe place to rebuild your business." },
    park: { name: "The Park", street: "Park Walk", rent: 200, moveFee: 100,
        traffic: 1.25, budget: 0.95, weights: [4, 1, 3], patience: 24, arrival: 5,
        days: 3, revenue: 4500, satisfaction: 0.55,
        description: "Picnic tables and a playground draw walkers and families. More visitors, modest budgets and patient queues." },
    downtown: { name: "Downtown", street: "Market Street", rent: 500, moveFee: 300,
        traffic: 1.5, budget: 1.25, weights: [1, 5, 1], patience: 12, arrival: 3,
        days: 7, revenue: 12000, satisfaction: 0.65,
        description: "Office workers have more to spend, but little time to wait. Higher rent makes every sale count." },
    beach: { name: "The Beach", street: "Beach Walk", rent: 800, moveFee: 400,
        traffic: 1.65, budget: 1.1, weights: [4, 1, 4], patience: 22, arrival: 4,
        days: 7, revenue: 12000, satisfaction: 0.65,
        description: "A busy seaside promenade with families and holidaymakers. Keep supplies ready for the beach crowds." },
    "old-square": { name: "Old Square", street: "Old Square", rent: 2000, moveFee: 1000,
        traffic: 1.85, budget: 1.5, weights: [2, 2, 5], patience: 20, arrival: 4,
        days: 7, revenue: 12000, satisfaction: 0.65,
        description: "Tourists gather around the fountain. Larger budgets come with an expensive daily pitch." },
    "train-station": { name: "Train Station", street: "Station Forecourt", rent: 600, moveFee: 300,
        traffic: 1.65, budget: 1.2, weights: [1, 6, 1], patience: 10, arrival: 3,
        days: 7, revenue: 12000, satisfaction: 0.65,
        description: "Commuters hurry through the station forecourt. Fast service matters when the next train is close." },
    mall: { name: "The Mall", street: "Mall Concourse", rent: 1000, moveFee: 500,
        traffic: 1.75, budget: 1.25, weights: [3, 2, 4], patience: 20, arrival: 4,
        days: 7, revenue: 12000, satisfaction: 0.65,
        description: "Shoppers pause between stores in the indoor concourse. Balance a busy pitch against its rent." },
    marina: { name: "The Marina", street: "Marina Boardwalk", rent: 1000, moveFee: 500,
        traffic: 1.5, budget: 1.65, weights: [1, 3, 5], patience: 22, arrival: 4,
        days: 7, revenue: 12000, satisfaction: 0.65,
        description: "Visitors stroll past the yachts. Higher spending can reward a careful recipe and price." },
    stadium: { name: "Hexa-Stad", street: "Stadium Plaza", rent: 3000, moveFee: 1500,
        traffic: 2.5, budget: 1.4, weights: [3, 3, 3], patience: 14, arrival: 2,
        days: 7, revenue: 12000, satisfaction: 0.65,
        description: "The stadium plaza brings the biggest rush and the highest rent. Plan stock and service before opening." },
    "magic-gardens": { name: "Magic Gardens", street: "Gardens Midway", rent: 2000, moveFee: 1000,
        traffic: 2.1, budget: 1.3, weights: [5, 1, 4], patience: 20, arrival: 3,
        days: 7, revenue: 12000, satisfaction: 0.65,
        description: "Families stream past the rides and gardens. A lively midway needs plenty of cups and a steady queue." },
} as const;
export type LocationId = keyof typeof LOCATIONS;
export const LOCATION_IDS = Object.keys(LOCATIONS) as LocationId[];
export const isLocation = (value: unknown): value is LocationId =>
    typeof value === "string" && Object.prototype.hasOwnProperty.call(LOCATIONS, value);

export const LEGACY_LOCATION_IDS = ["neighborhood", "park", "downtown"] as const;
export const defaultLocationStats = () => Object.fromEntries(LOCATION_IDS.map(id =>
    [id, { satisfaction: 0.5, popularity: 0.5 }])) as Record<LocationId, { satisfaction: number; popularity: number }>;
