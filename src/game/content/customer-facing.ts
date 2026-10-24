import { mapPosition, type MapThemeId } from "./map-layouts";

export type CustomerFacing = "se" | "ne" | "nw" | "sw";
export type CustomerAction = "idle" | "walk" | "order" | "cup";

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

export function customerAppearance(facing: CustomerFacing, action: CustomerAction, phase: number, reducedMotion: boolean):
    { pose: string; flipX: boolean } {
    const selected = reducedMotion && action === "walk" ? "idle" : action;
    const frame = selected === "idle" || selected === "order" ? 0 : reducedMotion ? 4 : ((Math.floor(phase) % 4) + 4) % 4;
    return {
        pose: `${facing.startsWith("n") ? "rear" : "front"}-${selected}-${frame}`,
        flipX: facing.endsWith("w"),
    };
}
