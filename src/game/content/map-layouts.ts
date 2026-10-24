type FloorPoint = readonly [number, number];
type RoutePoint = readonly [number, number, number];
export interface MapLayout {
    readonly facing: "left" | "right";
    readonly ground: FloorPoint;
    readonly route: readonly RoutePoint[];
    readonly through: readonly RoutePoint[];
    readonly departure: readonly RoutePoint[];
}
// Progress is parameterized by ground distance within each leg. Service286 is
// retained as a presentation anchor; it does not advance simulation decisions.
function along(points: readonly FloorPoint[], start = -20, end = 680): readonly RoutePoint[] {
    const distances = [0];
    for (let i = 1; i < points.length; i++) distances.push(distances[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
    return points.map(([x, y], i) => [i === 0 ? start : i === points.length - 1 ? end :
        start + (end - start) * distances[i] / distances[distances.length - 1], x, y] as const);
}
function approach(points: readonly FloorPoint[]): readonly RoutePoint[] {
    return [...along(points, -20, 286), ...along([...points].reverse(), 286, 680).slice(1)];
}
export const MAP_LAYOUTS = {
    neighborhood: { facing: "right", ground: [113, 142],
        route: approach([[-15, 232], [110, 160], [123, 150]]),
        through: along([[-20, -2], [320, 208]]),
        departure: along([[123, 150], [110, 160], [-15, 234]], 286) },
    park: { facing: "right", ground: [155, 124],
        route: approach([[320, 200], [250, 164], [167, 136]]),
        through: along([[-20, 35], [125, 115], [158, 145], [192, 149], [250, 164], [320, 200]]),
        departure: along([[167, 136], [125, 115], [-20, 35]], 286) },
    downtown: { facing: "left", ground: [138, 165],
        route: approach([[225, 260], [187, 213], [126, 177]]),
        through: along([[100, -11], [320, 119]]),
        departure: along([[126, 177], [94, 159], [55, 137], [-20, 96]], 286) },
    beach: { facing: "left", ground: [256, 145],
        route: approach([[320, 143], [270, 146], [244, 157]]),
        through: along([[-20, -42], [320, 128]]),
        departure: along([[244, 157], [270, 146], [320, 143]], 286) },
    "old-square": { facing: "right", ground: [140, 136],
        route: approach([[150, 260], [165, 200], [152, 148]]),
        through: along([[320, 170], [235, 148], [175, 178], [150, 260]]),
        departure: along([[152, 148], [165, 200], [150, 260]], 286) },
    "train-station": { facing: "left", ground: [216, 161],
        route: approach([[320, 110], [260, 143], [204, 173]]),
        through: along([[-20, 228], [235, 103], [320, 110]]),
        departure: along([[204, 173], [165, 190], [95, 222], [20, 260]], 286) },
    mall: { facing: "right", ground: [228, 188],
        route: approach([[-20, 120], [25, 145], [65, 160], [80, 142], [145, 174], [200, 188], [240, 200]]),
        through: along([[-20, 50], [75, 100], [135, 174], [205, 191], [235, 168], [265, 148], [320, 128]]),
        departure: along([[240, 200], [200, 188], [145, 174], [80, 142], [65, 160], [25, 145], [-20, 120]], 286) },
    marina: { facing: "right", ground: [65, 100],
        route: approach([[320, 40], [77, 112]]),
        through: along([[-20, 136], [320, 35]]),
        departure: along([[77, 112], [-20, 141]], 286) },
    stadium: { facing: "left", ground: [237, 154],
        route: approach([[320, 213], [225, 166]]),
        through: along([[-20, 40], [320, 220]]),
        departure: along([[225, 166], [-20, 33]], 286) },
    "magic-gardens": { facing: "left", ground: [204, 142],
        route: approach([[105, 260], [125, 210], [170, 180], [192, 154]]),
        through: along([[105, 260], [140, 206], [180, 180], [230, 175], [260, 190], [320, 220]]),
        departure: along([[192, 154], [170, 180], [125, 210], [105, 260]], 286) },
} as const satisfies Readonly<Record<string, MapLayout>>;
export type MapThemeId = keyof typeof MAP_LAYOUTS;

export function mapPosition(id: MapThemeId, progress: number, purpose: "service" | "through" | "depart" = "service"): readonly [number, number] {
    const layout: MapLayout = MAP_LAYOUTS[id];
    const route = purpose === "through" ? layout.through :
        purpose === "depart" ? layout.departure : layout.route;
    const next = route.findIndex(point => point[0] >= progress);
    const index = next < 0 ? route.length - 2 : Math.max(0, next - 1);
    const [start, x, y] = route[index], [end, xx, yy] = route[index + 1];
    const t = (progress - start) / (end - start);
    return [x + (xx - x) * t, y + (yy - y) * t];
}

// Queue spacing is a physical distance on the ground, independent of how long
// or short each map's progress segments happen to be.
const lengthOf = (points: readonly RoutePoint[]): number => points.slice(1).reduce((sum, point, i) =>
    sum + Math.hypot(point[1] - points[i][1], point[2] - points[i][2]), 0);
const queueLengths = Object.fromEntries(Object.entries(MAP_LAYOUTS).map(([id, map]) =>
    [id, lengthOf(map.route.filter(point => point[0] >= 286))])) as Record<MapThemeId, number>;
const departureLengths = Object.fromEntries(Object.entries(MAP_LAYOUTS).map(([id, map]) =>
    [id, lengthOf(map.departure)])) as Record<MapThemeId, number>;
export function queueProgress(id: MapThemeId, index: number): number {
    return 286 + (index + 1) * 20 * 394 / queueLengths[id];
}

// Queue routes286..680 are ground-distance parameterized. Bound each visual
// transition instead of teleporting people when the simulation queue changes.
export function moveQueueProgress(id: MapThemeId, from: number, to: number, distance: number): number {
    const length = queueDistance(id, 286, 680);
    return from + Math.sign(to - from) * Math.min(Math.abs(to - from), Math.max(0, distance) * 394 / length);
}

export function queueDistance(id: MapThemeId, from: number, to: number): number {
    return Math.abs(to - from) * queueLengths[id] / 394;
}
export function departureDistance(id: MapThemeId): number { return departureLengths[id]; }
