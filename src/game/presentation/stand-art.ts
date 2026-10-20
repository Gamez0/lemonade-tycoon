import type Phaser from "phaser";

export const STAND_ASSETS = {
    "stand-source-basic": new URL("../assets/stand-basic.png", import.meta.url).href,
    "stand-source-classic": new URL("../assets/stand-classic.png", import.meta.url).href,
    "stand-source-lemon": new URL("../assets/stand-lemon.png", import.meta.url).href,
    "stand-source-castle": new URL("../assets/stand-castle.png", import.meta.url).href,
};

// Alpha bounds exclude transparent source padding. All frames share a bottom-center
// ground anchor; dimensions are logical map pixels, not raw generation resolution.
const frames = [
    { source: "stand-source-basic", bounds: [196, 110, 813, 1098], width: 28 },
    { source: "stand-source-classic", bounds: [315, 70, 797, 980], width: 36 },
    { source: "stand-source-lemon", bounds: [193, 82, 1035, 976], width: 42 },
    { source: "stand-source-castle", bounds: [287, 75, 908, 969], width: 44 },
] as const;

export function createStandArt(scene: Phaser.Scene): void {
    for (const [level, frame] of frames.entries()) {
        const canvas = document.createElement("canvas");
        canvas.width = frame.width;
        canvas.height = Math.round(frame.width * frame.bounds[3] / frame.bounds[2]);
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
        height: Math.round(frame.width * frame.bounds[3] / frame.bounds[2]) * 512 / 240 };
}
