import type { LocationId } from "./locations";

// Anonymous numeric groups recovered from the retained 1.1.6 tables.
// Sprite identities and the original patience time unit remain unverified (#234).
export const CUSTOMER_PROFILES = [
    { name: "Visitor group 1", patience: 35, preferredPrice: 200, maximumPrice: 400 },
    { name: "Visitor group 2", patience: 50, preferredPrice: 150, maximumPrice: 300 },
    { name: "Visitor group 3", patience: 60, preferredPrice: 100, maximumPrice: 210 },
    { name: "Visitor group 4", patience: 70, preferredPrice: 150, maximumPrice: 300 },
    { name: "Visitor group 5", patience: 50, preferredPrice: 150, maximumPrice: 350 },
    { name: "Visitor group 6", patience: 100, preferredPrice: 75, maximumPrice: 150 },
    { name: "Visitor group 7", patience: 70, preferredPrice: 120, maximumPrice: 250 },
    { name: "Visitor group 8", patience: 70, preferredPrice: 100, maximumPrice: 250 },
    { name: "Visitor group 9", patience: 70, preferredPrice: 120, maximumPrice: 250 },
    { name: "Visitor group 10", patience: 100, preferredPrice: 100, maximumPrice: 150 },
    { name: "Visitor group 11", patience: 70, preferredPrice: 120, maximumPrice: 250 },
] as const;

export const LOCATION_CUSTOMER_WEIGHTS: Readonly<Record<LocationId, readonly number[]>> = {
    neighborhood: [5, 5, 25, 5, 5, 35, 10, 10, 0, 0, 0],
    park: [5, 0, 10, 20, 10, 40, 10, 5, 0, 0, 0],
    downtown: [25, 15, 15, 15, 15, 5, 5, 5, 0, 0, 0],
    "train-station": [40, 40, 5, 5, 5, 5, 0, 0, 0, 0, 0],
    beach: [0, 0, 10, 0, 0, 10, 15, 15, 10, 15, 25],
    mall: [5, 5, 15, 30, 20, 15, 5, 5, 0, 0, 0],
    marina: [25, 15, 15, 15, 15, 5, 5, 5, 0, 0, 0],
    "old-square": [15, 15, 10, 10, 10, 10, 15, 15, 0, 0, 0],
    "magic-gardens": [10, 10, 10, 10, 10, 10, 10, 10, 0, 10, 10],
    stadium: [12, 12, 12, 12, 12, 16, 12, 12, 0, 0, 0],
};

/** Product tick adaptation; group4's70 is neutral. Staff's entire bonus stays additive. */
export function profilePatience(base: number, profile: number, staffBonus: number): number {
    return Math.max(1, Math.round(base * CUSTOMER_PROFILES[profile].patience / 70) + staffBonus);
}
