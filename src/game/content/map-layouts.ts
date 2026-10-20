export interface MapLayout {
    readonly ground: readonly [number, number];
    readonly route: readonly (readonly [number, number, number])[];
}
// Authored positions on the 300x240 map grid. Route values are simulation progress,
// not screen X: a path may turn, cross a street and exit at a different edge.
// 286 is the fixed service progress for every stand tier; upgrading never moves it.
export const MAP_LAYOUTS = {
    neighborhood: { ground: [107.5, 145], route: [[-20, -15, 232], [120, 50, 194], [286, 131, 149.5], [333, 147, 141.5], [360, 151, 146], [420, 190, 165], [510, 120, 205], [600, 55, 243], [680, -20, 287]] },
    park: { ground: [195, 119], route: [[-20, -15, 36.5], [220, 174, 131], [286, 220, 126], [360, 238, 146], [420, 260, 173], [680, 320, 203]] },
    downtown: { ground: [95.5, 165], route: [[-20, -20, 98], [190, 65, 144], [286, 110, 174], [420, 156, 198], [560, 183, 220], [680, 178, 253]] },
    beach: { ground: [204.5, 127], route: [[-20, -20, 115], [150, 80, 115], [286, 224, 131], [680, 320, 150]] },
    "old-square": { ground: [190.5, 137], route: [[-20, -20, 115], [120, 100, 125], [286, 208, 149], [450, 165, 200], [680, 150, 260]] },
    "train-station": { ground: [181.5, 149], route: [[-20, -20, 120], [130, 105, 130], [286, 200, 161], [680, 320, 130]] },
    mall: { ground: [111.5, 165], route: [[-20, -20, 100], [130, 80, 150], [286, 135, 174], [450, 205, 212], [680, 320, 270]] },
    marina: { ground: [159.5, 77], route: [[-20, -20, 141], [286, 181, 80], [680, 320, 39]] },
    stadium: { ground: [145.5, 109], route: [[-20, -20, 33], [286, 170, 128], [680, 320, 203]] },
    "magic-gardens": { ground: [197.5, 150], route: [[-20, -20, 103], [130, 120, 112], [286, 214, 163], [430, 165, 178], [540, 120, 205], [680, 100, 260]] },
} as const satisfies Readonly<Record<string, MapLayout>>;
export type MapThemeId = keyof typeof MAP_LAYOUTS;

export function mapPosition(id: MapThemeId, progress: number): readonly [number, number] {
    const route: MapLayout["route"] = MAP_LAYOUTS[id].route;
    const next = route.findIndex(point => point[0] >= progress);
    const index = next < 0 ? route.length - 2 : Math.max(0, next - 1);
    const [start, x, y] = route[index], [end, xx, yy] = route[index + 1];
    const t = (progress - start) / (end - start);
    return [x + (xx - x) * t, y + (yy - y) * t];
}
