export const LOCATIONS = {
    neighborhood: { name: "The Neighborhood", street: "Willow Lane", rent: 0, moveFee: 0,
        traffic: 1, budget: 1, weights: [1, 1, 1], patience: 18, arrival: 5,
        days: 0, revenue: 0, satisfaction: 0,
        description: "A quiet street and thirsty neighbors. No rent: a safe place to rebuild your business." },
    park: { name: "Riverside Park", street: "Riverside Park", rent: 200, moveFee: 100,
        traffic: 1.25, budget: 0.95, weights: [2, 2, 1], patience: 24, arrival: 5,
        days: 3, revenue: 4500, satisfaction: 0.55,
        description: "Walkers and families linger beside the pond. More visitors, modest budgets and patient queues." },
    downtown: { name: "Downtown", street: "Market Street", rent: 500, moveFee: 300,
        traffic: 1.5, budget: 1.25, weights: [1, 3, 1], patience: 12, arrival: 3,
        days: 7, revenue: 12000, satisfaction: 0.65,
        description: "Office workers have more to spend, but little time to wait. Higher rent makes every sale count." },
} as const;
export type LocationId = keyof typeof LOCATIONS;
export const LOCATION_IDS = Object.keys(LOCATIONS) as LocationId[];
export const isLocation = (value: unknown): value is LocationId =>
    typeof value === "string" && Object.prototype.hasOwnProperty.call(LOCATIONS, value);
