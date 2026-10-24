import { mapPosition, type MapThemeId } from "./map-layouts";

export type CustomerFacing = "se" | "ne" | "nw" | "sw";

// Screen-space directions. Keep the previous component on a stationary axis.
export function vectorFacing(dx: number, dy: number, previous: CustomerFacing = "se"): CustomerFacing {
    const left = Math.abs(dx) < 0.01 ? previous.endsWith("w") : dx < 0;
    const rear = Math.abs(dy) < 0.01 ? previous.startsWith("n") : dy < 0;
    return rear ? left ? "nw" : "ne" : left ? "sw" : "se";
}

export function routeFacing(id: MapThemeId, progress: number,
    purpose: "service" | "through" | "depart", travel: 1 | -1,
    previous?: CustomerFacing): CustomerFacing {
    const here = mapPosition(id, progress, purpose);
    const next = mapPosition(id, progress + travel, purpose);
    return vectorFacing(next[0] - here[0], next[1] - here[1], previous);
}

export function customerAppearance(facing: CustomerFacing, pose: number, reducedMotion: boolean):
    { pose: number; flipX: boolean } {
    const action = reducedMotion && pose !== 3 ? 0 : pose;
    return {
        pose: facing.startsWith("n") ? action === 3 ? 5 : action === 1 ? 4 : 2 : action,
        flipX: facing.endsWith("w"),
    };
}
