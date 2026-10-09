export const UPGRADES = {
    refrigerator: { name: "Refrigerator", prices: [900, 1700], effects: ["Keep 50% of leftover ice", "Keep all leftover ice"] },
    iceMaker: { name: "Ice maker", prices: [1200, 2200], effects: ["Produce up to 60 free ice at opening", "Produce up to 120 free ice at opening"] },
    blender: { name: "Blender", prices: [1400, 2600], effects: ["Service takes 7 ticks", "Service takes 6 ticks"] },
} as const;
export type Upgrade = keyof typeof UPGRADES;
export const STAFF = {
    none: { name: "Owner only", wage: 0, speed: 0, patience: 0 },
    server: { name: "Jamie · server", wage: 250, speed: 2, patience: 0 },
    host: { name: "Robin · queue host", wage: 180, speed: 0, patience: 12 },
} as const;
export const ADS = {
    none: { name: "Word of mouth", cost: 0, traffic: 1 },
    flyers: { name: "Local flyers", cost: 180, traffic: 1.2 },
    radio: { name: "Local radio", cost: 450, traffic: 1.45 },
} as const;
export interface Management {
    readonly upgrades: Readonly<Record<Upgrade, number>>;
    readonly staff: keyof typeof STAFF;
    readonly advertising: keyof typeof ADS;
}
export const defaultManagement = (): Management => ({ upgrades: { refrigerator: 0, iceMaker: 0, blender: 0 }, staff: "none", advertising: "none" });
