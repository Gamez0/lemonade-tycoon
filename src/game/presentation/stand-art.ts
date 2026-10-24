import type Phaser from "phaser";

export const STAND_ASSETS = {
    "stand-source-basic": new URL("../assets/stand-basic-v2.png", import.meta.url).href,
    "stand-source-classic": new URL("../assets/stand-classic-v2.png", import.meta.url).href,
    "stand-source-lemon": new URL("../assets/stand-lemon-v2.png", import.meta.url).href,
    "stand-source-castle": new URL("../assets/stand-castle-v2.png", import.meta.url).href,
};

// The anchor is the center of the front floor edge, measured on each source.
// Transparent padding and different roof heights must never shift the floor.
const frames = [
    { source: "stand-source-basic", bounds: [382, 84, 730, 957], width: 30, anchor: [835, 925] },
    { source: "stand-source-classic", bounds: [300, 73, 879, 996], width: 46, anchor: [855, 925] },
    { source: "stand-source-lemon", bounds: [162, 147, 1146, 852], width: 52, anchor: [925, 900] },
    { source: "stand-source-castle", bounds: [223, 58, 1084, 1004], width: 60, anchor: [905, 945] },
] as const;

export function createStandArt(scene: Phaser.Scene): void {
    for (const [level, frame] of frames.entries()) {
        const canvas = document.createElement("canvas");
        canvas.width = frame.bounds[2];
        canvas.height = frame.bounds[3];
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        const [x, y, width, height] = frame.bounds;
        ctx.drawImage(scene.textures.get(frame.source).getSourceImage() as HTMLImageElement,
            x, y, width, height, 0, 0, canvas.width, canvas.height);
        scene.textures.addCanvas(`stand-${level}`, canvas);
    }
}

export function standSize(level: number) {
    const frame = frames[level];
    return { width: frame.width * 640 / 300,
        height: frame.width * frame.bounds[3] / frame.bounds[2] * 512 / 240,
        originX: (frame.anchor[0] - frame.bounds[0]) / frame.bounds[2],
        originY: (frame.anchor[1] - frame.bounds[1]) / frame.bounds[3] };
}

// All newly drawn stages share the same source projection and customer side.
export function standFlip(facing: "left" | "right"): boolean {
    return facing === "left";
}

// Reuse the native game artwork and crop, rather than enlarging the toolbar glyph.
export function standPreview(level: number): string {
    const frame = frames[level];
    return `<svg class="stand-preview" viewBox="${frame.bounds.join(" ")}" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><image href="${STAND_ASSETS[frame.source]}" width="1402" height="1122"/></svg>`;
}
