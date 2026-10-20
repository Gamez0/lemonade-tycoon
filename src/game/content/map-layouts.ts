export interface MapLayout {
    readonly facing: "left" | "right";
    readonly ground: readonly [number, number];
    readonly route: readonly (readonly [number, number, number])[];
}
// Authored positions on the 300x240 map grid. Route values are simulation progress,
// not screen X: a path may turn, cross a street and exit at a different edge.
// 286 is the fixed service progress for every stand tier; upgrading never moves it.
export const MAP_LAYOUTS = {
    neighborhood: { facing: "left", ground: [235, 137], route: [[-20, -20, -2], [286, 223, 148], [680, 320, 208]] },
    park: { facing: "right", ground: [182, 108], route: [[-20, -15, 36.5], [220, 174, 131], [286, 194, 120], [420, 240, 80], [680, 320, 20]] },
    downtown: { facing: "right", ground: [146, 174], route: [[-20, -20, 98], [160, 65, 144], [220, 110, 174], [286, 158, 186], [560, 183, 220], [680, 178, 253]] },
    beach: { facing: "right", ground: [177, 123], route: [[-20, -20, 110], [150, 110, 120], [286, 189, 135], [680, 320, 150]] },
    "old-square": { facing: "right", ground: [196, 137], route: [[-20, -20, 115], [120, 100, 125], [286, 208, 149], [450, 165, 200], [680, 150, 260]] },
    "train-station": { facing: "right", ground: [195, 163], route: [[-20, -20, 125], [130, 105, 145], [286, 207, 175], [680, 320, 110]] },
    mall: { facing: "right", ground: [106, 172], route: [[-20, -20, 100], [130, 80, 150], [286, 118, 184], [450, 205, 212], [680, 320, 270]] },
    marina: { facing: "right", ground: [133, 100], route: [[-20, -20, 161], [286, 145, 112], [680, 320, 60]] },
    stadium: { facing: "left", ground: [164, 110], route: [[-20, -20, 33], [286, 152, 122], [680, 320, 203]] },
    "magic-gardens": { facing: "left", ground: [204, 142], route: [[-20, -20, 103], [130, 120, 112], [286, 192, 154], [430, 165, 178], [540, 120, 205], [680, 100, 260]] },
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
