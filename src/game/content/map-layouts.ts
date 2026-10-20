export interface MapLayout {
    readonly facing: "left" | "right";
    readonly ground: readonly [number, number];
    readonly route: readonly (readonly [number, number, number])[];
    readonly through?: readonly (readonly [number, number, number])[];
    readonly departure?: readonly (readonly [number, number, number])[];
}
// Authored positions on the 300x240 map grid. Route values are simulation progress,
// not screen X: a path may turn, cross a street and exit at a different edge.
// 286 is the fixed service progress for every stand tier; upgrading never moves it.
export const MAP_LAYOUTS = {
    neighborhood: { facing: "right", ground: [113, 142], route: [[-20, -15, 232], [286, 123, 150], [680, -15, 232]],
        through: [[-20, -20, -2], [680, 320, 208]],
        departure: [[286, 123, 150], [400, 110, 160], [680, -15, 234]] },
    park: { facing: "right", ground: [155, 124], route: [[-20, -15, 36.5], [286, 167, 136], [420, 230, 168], [680, 320, 213]] },
    downtown: { facing: "left", ground: [138, 173], route: [[-20, -20, 98], [160, 65, 144], [220, 110, 174], [286, 126, 185], [560, 183, 220], [680, 178, 253]] },
    beach: { facing: "left", ground: [256, 145], route: [[-20, -20, 110], [150, 110, 120], [286, 244, 157], [680, 320, 150]] },
    "old-square": { facing: "right", ground: [140, 136], route: [[-20, -20, 115], [120, 100, 125], [286, 152, 148], [450, 165, 200], [680, 150, 260]] },
    "train-station": { facing: "left", ground: [216, 161], route: [[-20, -20, 125], [130, 105, 145], [286, 204, 173], [680, 320, 110]] },
    mall: { facing: "right", ground: [228, 188], route: [[-20, -20, 100], [130, 80, 150], [240, 150, 185], [286, 240, 200], [680, 320, 240]] },
    marina: { facing: "right", ground: [65, 100], route: [[-20, -20, 141], [286, 77, 112], [680, 320, 40]] },
    stadium: { facing: "left", ground: [237, 154], route: [[-20, -20, 33], [286, 225, 166], [680, 320, 213]] },
    "magic-gardens": { facing: "left", ground: [204, 142], route: [[-20, -20, 103], [130, 120, 112], [286, 192, 154], [430, 165, 178], [540, 120, 205], [680, 100, 260]] },
} as const satisfies Readonly<Record<string, MapLayout>>;
export type MapThemeId = keyof typeof MAP_LAYOUTS;

export function mapPosition(id: MapThemeId, progress: number, purpose: "service" | "through" | "depart" = "service"): readonly [number, number] {
    const layout: MapLayout = MAP_LAYOUTS[id];
    const route = purpose === "through" ? layout.through ?? layout.route :
        purpose === "depart" ? layout.departure ?? layout.route : layout.route;
    const next = route.findIndex(point => point[0] >= progress);
    const index = next < 0 ? route.length - 2 : Math.max(0, next - 1);
    const [start, x, y] = route[index], [end, xx, yy] = route[index + 1];
    const t = (progress - start) / (end - start);
    return [x + (xx - x) * t, y + (yy - y) * t];
}

// Queue spacing is a physical distance on the ground, independent of how long
// or short each map's progress segments happen to be.
export function queueProgress(id: MapThemeId, index: number): number {
    const service = mapPosition(id, 286);
    const points = [[286, ...service], ...MAP_LAYOUTS[id].route.filter(point => point[0] > 286)];
    let remaining = (index + 1) * 20;
    for (let i = 1; i < points.length; i++) {
        const a = points[i - 1], b = points[i];
        const length = Math.hypot(b[1] - a[1], b[2] - a[2]);
        if (remaining <= length || i === points.length - 1)
            return a[0] + (b[0] - a[0]) * remaining / length;
        remaining -= length;
    }
    return 286;
}
