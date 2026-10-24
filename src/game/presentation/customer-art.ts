import Phaser from "phaser";
import type { CustomerAction } from "../content/customer-facing";

type Point = readonly [number, number];
const visuals = {
    neighbor: { shirt: "#c96852", shade: "#aa5442", skin: "#e8bb92", hair: "#453c34", pants: "#344250", light: "#465364", height: 1 },
    office: { shirt: "#536daf", shade: "#40578e", skin: "#be8b65", hair: "#332f2b", pants: "#424c58", light: "#596675", height: 1.02 },
    student: { shirt: "#ddba55", shade: "#b8953e", skin: "#e5b188", hair: "#8d6239", pants: "#40586a", light: "#567285", height: .96 },
} as const;
type CustomerVisual = keyof typeof visuals;
// Presentation families are separate from simulation identities (#228).
export const CUSTOMER_VISUAL_FOR_PROFILE = ["neighbor", "office", "student"] as const;
export function customerTexture(profile: number, pose: string): string {
    const visual = CUSTOMER_VISUAL_FOR_PROFILE[profile];
    if (!visual) throw new Error("Unsupported customer visual mapping");
    return `customer-${visual}-${pose}`;
}
export const CUSTOMER_METRICS = {
    width: 128, height: 192, originX: .5, originY: 87 / 96,
    // Calibrate the full contact pose against the26px original reference body.
    scale: (26 * 640 / 300) / (69 * 2), labelOffset: 80,
} as const;

function paint(ctx: CanvasRenderingContext2D, visual: CustomerVisual, rear: boolean, action: CustomerAction, phase: number): void {
    const pal = visuals[visual], fx = rear ? 0 : 1, fy = rear ? -1 : 0;
    const lx = -fy, ly = fx, ink = "#354036";
    const walking = (action === "walk" || action === "cup") && phase < 4, theta = phase * Math.PI / 2;
    const stride = walking ? Math.cos(theta) : 0, bob = walking ? Math.abs(Math.sin(theta)) * .6 : 0;
    const project = (x: number, f: number, z: number): Point => {
        const xx = lx * x + fx * f, yy = ly * x + fy * f;
        return [32 + (xx - yy) * .866, 87 + (xx + yy) * .45 - z * pal.height - bob * Math.min(1, Math.max(0, z) / 25)];
    };
    function polygon(points: readonly Point[], fill: string): void {
        ctx.beginPath(); ctx.moveTo(...points[0]);
        for (const point of points.slice(1)) ctx.lineTo(...point);
        ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
        ctx.strokeStyle = ink; ctx.lineWidth = .75; ctx.stroke();
    }
    function ellipse(x: number, y: number, rx: number, ry: number, fill: string, outline = true): void {
        ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = fill; ctx.fill();
        if (outline) { ctx.strokeStyle = ink; ctx.lineWidth = .75; ctx.stroke(); }
    }
    function line(points: readonly Point[], color: string, width: number): void {
        const stroke = (paint: string, size: number) => {
            ctx.beginPath(); ctx.moveTo(...points[0]);
            for (const point of points.slice(1)) ctx.lineTo(...point);
            ctx.strokeStyle = paint; ctx.lineWidth = size;
            ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
        };
        stroke(ink, width + 1.2); stroke(color, width);
    }
    function arm(side: number): void {
        const raised = action === "cup" && side === 1, ordering = action === "order" && side === 1;
        const swing = -side * stride * 4;
        const shoulder = project(side * 6, 0, 46);
        const elbowX = side * (raised ? 7 : ordering ? 6.5 : 9.5);
        const elbowF = raised ? 10 : ordering ? 4 : swing * .5, elbowZ = raised ? 44 : 37;
        const elbow = project(elbowX, elbowF, elbowZ);
        const hand = project(side * (raised ? 2 : ordering ? 3 : 10.5),
            raised ? 4 : ordering ? 9 : swing, raised ? 54 : ordering ? 34 : 28);
        line([shoulder, elbow, hand], visual === "office" ? pal.shirt : pal.skin, 2.8);
        if (visual !== "office") line([shoulder, project(side * 6 + (elbowX - side * 6) * .45,
            elbowF * .45, 46 + (elbowZ - 46) * .45)], pal.shirt, 4);
        ellipse(hand[0], hand[1], 1.35, 1.65, pal.skin);
    }
    function cup(): void {
        if (action !== "cup") return;
        const [x, y] = project(2, 4, 55);
        polygon([[x - 2, y - 2], [x + 2, y - 2], [x + 1.5, y + 3], [x - 1.5, y + 3]], "#f5edcd");
        line([[x - 1, y + .5], [x + 1, y + .5]], "#e6cb4e", .8);
    }
    ellipse(32, 87, 8, 2, "rgba(61,83,60,.2)", false);
    arm(-1);
    for (const side of [-1, 1]) {
        const forward = side * stride * 10;
        const lift = walking ? Math.max(0, -side * Math.sin(theta)) * 5 : 0;
        line([project(side * 3, 0, 27), project(side * 3.5, forward * .55 + lift * .3, 14 + lift * .35),
            project(side * 3, forward, lift + 1)], side === 1 ? pal.light : pal.pants, 4.6);
        polygon([project(side * 3 - 1.8, forward - 1, lift), project(side * 3 + 1.8, forward - 1, lift),
            project(side * 3 + 1.8, forward + 3, lift), project(side * 3 - 1.8, forward + 3, lift)], "#514735");
    }
    line([project(0, 0, 49), project(0, 0, 53)], pal.skin, 3);
    const face = rear ? -1.4 : 1.4;
    polygon([project(-6, face, 48), project(6, face, 48), project(4.5, face, 27), project(-4.5, face, 27)], pal.shirt);
    polygon([project(3, face, 47), project(6, face, 48), project(4.5, face, 27), project(2, face, 28)], pal.shade);
    if (!rear) {
        line([project(-2, face, 48), project(0, face, 46), project(2, face, 48)], visual === "office" ? "#eee9d4" : pal.shade, .7);
        if (visual === "office") line([project(0, face, 45), project(0, face, 39)], ink, 1.1);
    }
    if (visual === "student") {
        if (rear) polygon([project(-4.2, -2, 47), project(4.2, -2, 47), project(4, -2, 31), project(-4, -2, 31)], "#527e7b");
        else for (const side of [-1, 1]) line([project(side * 3, face, 47), project(side * 3, face, 33)], "#527e7b", .9);
    }
    arm(1);
    if (rear) cup();
    const [hx, hy] = project(0, 0, 56);
    ellipse(hx, hy, 3.7, 5.1 * pal.height, rear ? pal.hair : pal.skin);
    if (rear) ellipse(hx + 3.3, hy + 1.2, .65, 1.1, pal.skin);
    else {
        polygon([[hx + 3, hy - 1], [hx + 4.5, hy + 1], [hx + 3, hy + 2]], pal.skin);
        ctx.beginPath(); ctx.moveTo(hx - 3.5, hy - 1);
        ctx.quadraticCurveTo(hx - 4.5, hy - 6, hx, hy - 6);
        ctx.quadraticCurveTo(hx + 5, hy - 6, hx + 3.5, hy - 2);
        ctx.lineTo(hx - .5, hy - 1); ctx.closePath(); ctx.fillStyle = pal.hair; ctx.fill();
        ellipse(hx + 2.2, hy + .2, .3, .3, ink, false);
    }
    if (!rear) cup();
}

export function createCustomerArt(scene: Phaser.Scene): void {
    const actions: readonly CustomerAction[] = ["idle", "walk", "order", "cup"];
    for (const visual of Object.keys(visuals) as CustomerVisual[]) for (const group of ["front", "rear"]) {
        for (const action of actions) for (let frame = 0; frame < (action === "walk" ? 4 : action === "cup" ? 5 : 1); frame++) {
            const key = `customer-${visual}-${group}-${action}-${frame}`;
            if (scene.textures.exists(key)) continue;
            const canvas = document.createElement("canvas");
            canvas.width = CUSTOMER_METRICS.width; canvas.height = CUSTOMER_METRICS.height;
            const ctx = canvas.getContext("2d")!; ctx.scale(2, 2);
            paint(ctx, visual, group === "rear", action, frame);
            const texture = scene.textures.addCanvas(key, canvas);
            if (!texture) throw new Error("Unable to register customer frame");
            texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }
    }
}
