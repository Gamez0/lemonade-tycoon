import Phaser from "phaser";
import type { CustomerAction } from "../content/customer-facing";

import { paintClassicCustomer } from "./classic-customer-art";
// Presentation families are separate from simulation identities (#228).
export const CUSTOMER_VISUAL_FOR_PROFILE = ["neighbor", "office", "student"] as const;
export function customerTexture(profile: number, pose: string): string {
    const visual = CUSTOMER_VISUAL_FOR_PROFILE[profile];
    if (!visual) throw new Error("Unsupported customer visual mapping");
    return `customer-${visual}-${pose}`;
}
export const CUSTOMER_METRICS = {
    width: 64, height: 96, originX: .5, originY: 87 / 96,
    // Independently authored30px body shown24px high at300px map width.
    scale: (24 * 640 / 300) / (30 * 2), labelOffset: 72,
} as const;

export function createCustomerArt(scene: Phaser.Scene): void {
    const actions: readonly CustomerAction[] = ["idle", "walk", "order", "cup"];
    for (const visual of CUSTOMER_VISUAL_FOR_PROFILE) for (const group of ["front", "rear"]) {
        for (const action of actions) for (let frame = 0; frame < (action === "walk" ? 4 : action === "cup" ? 5 : 1); frame++) {
            const key = `customer-${visual}-${group}-${action}-${frame}`;
            if (scene.textures.exists(key)) continue;
            const canvas = document.createElement("canvas");
            canvas.width = CUSTOMER_METRICS.width; canvas.height = CUSTOMER_METRICS.height;
            const ctx = canvas.getContext("2d")!;
            paintClassicCustomer(ctx, visual, group === "rear", action, frame);
            const texture = scene.textures.addCanvas(key, canvas);
            if (!texture) throw new Error("Unable to register customer frame");
            texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        }
    }
}
