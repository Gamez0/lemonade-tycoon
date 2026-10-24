import type { CustomerAction } from "../content/customer-facing";

type Point = readonly [number, number];
const palettes = {
    neighbor: ["#eee9d1", "#fff9df", "#b7b7a3", "#c69468", "#49372c", "#80684c", "#a38c65"],
    office: ["#747f89", "#9ba5a9", "#515d68", "#b88862", "#332f29", "#3f454a", "#62696b"],
    student: ["#719392", "#92aaa1", "#4d7374", "#d0a275", "#674b31", "#344f67", "#527690"],
} as const;

/** Independently drawn pixel clusters. No original sprite data is imported. */
export function paintClassicCustomer(target: CanvasRenderingContext2D, visual: keyof typeof palettes, rear: boolean, action: CustomerAction, phase: number): void {
    const source = document.createElement("canvas"); source.width = 32; source.height = 48;
    const ctx = source.getContext("2d")!;
    const [shirt, light, shade, skin, hair, pants, trouserLight] = palettes[visual];
    const edge = "#252a22", shoe = "#473e32";
    const walking = (action === "walk" || action === "cup") && phase < 4;
    const step = walking ? [2, 0, -2, 0][phase] : 0;
    const lift = walking ? [0, 1, 0, -1][phase] : 0;
    const bob = walking && (phase === 1 || phase === 3) ? 0 : .5;
    const point = (side: number, forward: number, z: number): Point =>
        [16 + side * 1.1 + forward * .75, 43.5 + side * .3 + forward * (rear ? -.4 : .4) - z];
    function polygon(points: readonly Point[], color: string): void {
        ctx.beginPath(); ctx.moveTo(Math.round(points[0][0]), Math.round(points[0][1]));
        for (const [x, y] of points.slice(1)) ctx.lineTo(Math.round(x), Math.round(y));
        ctx.closePath(); ctx.fillStyle = color; ctx.fill();
    }
    function rect(x: number, y: number, w: number, h: number, color: string): void {
        ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h);
    }
    function limb(points: readonly Point[], color: string, width: number): void {
        ctx.beginPath(); ctx.moveTo(Math.round(points[0][0]), Math.round(points[0][1]));
        for (const [x, y] of points.slice(1)) ctx.lineTo(Math.round(x), Math.round(y));
        ctx.lineWidth = width; ctx.lineCap = "butt"; ctx.lineJoin = "bevel"; ctx.strokeStyle = color; ctx.stroke();
    }
    rect(12, 43, 8, 1, "rgba(52,63,40,.18)");
    function leg(side: number): void {
        const forward = side * step, raised = Math.max(0, side * lift);
        const hip = point(side * 1.4, 0, 12), knee = point(side * 1.35, forward * .45, 6 + raised);
        const foot = point(side * 1.3, forward, 1 + raised);
        limb([hip, knee, foot], edge, 3.5);
        limb([hip, knee, foot], side < 0 ? pants : trouserLight, 2.5);
        const [x, y] = foot;
        polygon([[x - 1.5, y - 1], [x + 1, y - 1], [x + 3, y], [x + 2, y + 1], [x - 1.5, y + 1]], shoe);
    }
    function arm(side: number): void {
        const hasCup = action === "cup" && side > 0, ordering = action === "order" && side > 0;
        const shoulder = point(side * 3.4, 0, 23 + bob);
        const elbow = point(side * 3.4, hasCup ? 1.5 : ordering ? 1 : -side * step * .35, 18 + bob);
        const hand = point(side * (hasCup ? 1.8 : ordering ? 2.5 : 3.1),
            hasCup ? 4 : ordering ? 3 : -side * step * .6, (hasCup ? 23 : ordering ? 17 : 14) + bob);
        limb([shoulder, elbow, hand], side < 0 ? shade : skin, 2);
        limb([shoulder, elbow], side < 0 ? shade : shirt, 2.5);
        if (visual === "office") limb([elbow, hand], side < 0 ? shade : shirt, 2);
        rect(hand[0] - .5, hand[1] - .5, 1, 2, skin);
        if (hasCup) { rect(hand[0] - 1, hand[1] - 2, 3, 3, "#efe5c6"); rect(hand[0] - 1, hand[1] - 2, 3, 1, "#fff8e0"); }
        if (visual === "office" && side < 0 && !hasCup && !ordering) {
            rect(hand[0] - 2, hand[1] + 1, 5, 4, "#39372f"); rect(hand[0] - 1, hand[1] + 2, 3, 1, "#5f5947");
        }
    }
    arm(-1); leg(-1); leg(1);
    polygon([point(-3, 0, 24 + bob), point(2, 1, 24 + bob), point(3.3, 0, 22 + bob),
        point(2.6, 0, 12), point(-2.7, 0, 12), point(-3.4, 0, 21 + bob)], edge);
    polygon([point(-2.5, 0, 23 + bob), point(1.5, 1, 23 + bob), point(2.7, 0, 21 + bob),
        point(2.3, 0, 13), point(-2.4, 0, 13)], shirt);
    polygon([point(-2.4, 0, 23 + bob), point(-.3, 0, 23 + bob), point(-.3, 0, 13), point(-2.4, 0, 13)], light);
    polygon([point(1.4, 1, 23 + bob), point(2.7, 0, 21 + bob), point(2.3, 0, 13), point(1.2, 0, 13)], shade);
    if (visual === "office" && !rear) {
        const [x, y] = point(.5, 1, 23 + bob); rect(x - 1, y, 2, 4, "#e8e4cc"); rect(x, y + 1, 1, 6, "#494640");
    }
    if (visual === "student" && rear) {
        const [x, y] = point(-.5, -1, 22 + bob); rect(x - 2, y, 5, 7, "#786348"); rect(x - 1, y + 1, 3, 4, "#95815a");
    }
    arm(1);
    const [hx, hy] = point(.4, 0, 29 + bob);
    polygon([[hx - 2, hy], [hx + 1, hy - 1], [hx + 3, hy + 1], [hx + 2, hy + 5], [hx - 1, hy + 5], [hx - 2, hy + 3]], edge);
    rect(hx - 1, hy, 3, 4, rear ? hair : skin);
    if (rear) { rect(hx - 1, hy + 1, 3, 3, hair); rect(hx + 2, hy + 2, 1, 2, skin); }
    else { rect(hx - 1, hy, 3, 1, hair); rect(hx - 1, hy + 1, 1, 2, hair); rect(hx + 2, hy + 1, 1, 3, skin); }
    // The32x48 source is the drawing grid, not an antialiased vector miniature.
    // Resolve coverage here so scaling cannot turn joints into soft round beads.
    const pixels = ctx.getImageData(0, 0, source.width, source.height);
    for (let i = 3; i < pixels.data.length; i += 4) pixels.data[i] = pixels.data[i] < 128 ? 0 : 255;
    ctx.putImageData(pixels, 0, 0);
    target.imageSmoothingEnabled = false;
    target.drawImage(source, 0, 0, 64, 96);
}
