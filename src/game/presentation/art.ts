import Phaser from "phaser";
import { neighborhoodRaster } from "./neighborhood-raster";

// Original code-authored artwork. Fine outlines and a shared 2:1 ground projection.
// No source-game image or sprite is embedded here.
export const STREET = { stopX: 267, pavementY: (x: number) => x / 2 + 112 };
export const CART = { x: 236, y: 167 };

export function createArt(scene: Phaser.Scene): void {
    const g = scene.make.graphics({ x: 0, y: 0 });
    const ink = 0x293e35;
    const rect = (x: number, y: number, w: number, h: number, c: number) =>
        g.fillStyle(c).fillRect(Math.round(x), Math.round(y), w, h);
    const line = (x: number, y: number, xx: number, yy: number, c = ink) =>
        g.lineStyle(1, c, 1).lineBetween(Math.round(x), Math.round(y), Math.round(xx), Math.round(yy));
    const poly = (coords: number[], color: number, outline = true) => {
        const points = Array.from(
            { length: coords.length / 2 },
            (_, i) => new Phaser.Geom.Point(Math.round(coords[i * 2]), Math.round(coords[i * 2 + 1])),
        );
        g.fillStyle(color).fillPoints(points, true);
        if (outline) g.lineStyle(1, ink, 1).strokePoints(points, true);
    };
    const ellipse = (x: number, y: number, w: number, h: number, color: number, outline = true) => {
        g.fillStyle(color).fillEllipse(x, y, w, h);
        if (outline) g.lineStyle(1, ink, 1).strokeEllipse(x, y, w, h);
    };
    const fence = (x: number, y: number, length: number, slope: number) => {
        for (let i = 0; i <= length; i += 7) {
            const yy = y + i * slope;
            poly([x + i, yy, x + i + 3, yy + 1, x + i + 3, yy - 15, x + i + 1, yy - 18, x + i, yy - 16], 0xc9b77c);
        }
        line(x, y - 6, x + length, y + length * slope - 6, 0x8a7d51);
        line(x, y - 12, x + length, y + length * slope - 12, 0xe6d799);
    };
    const tree = (x: number, y: number, size = 1) => {
        ellipse(x + 9, y, 29 * size, 10 * size, 0x328047, false);
        rect(x - 2, y - 28 * size, 5, 28 * size, 0x765a39);
        line(x, y - 28 * size, x, y - 1, 0xb5975f);
        ellipse(x, y - 36 * size, 32 * size, 36 * size, 0x237c47);
        ellipse(x - 4 * size, y - 40 * size, 25 * size, 27 * size, 0x4ca65a, false);
        ellipse(x - 7 * size, y - 44 * size, 14 * size, 15 * size, 0x70bb68, false);
        for (let n = 0; n < 14; n++)
            rect(x - 10 * size + ((n * 7) % 20) * size, y - 48 * size + ((n * 11) % 26) * size, 2, 1, 0x338c4c);
    };
    scene.textures.addCanvas("neighborhood", neighborhoodRaster());

    // Location scenes keep the cart and pedestrian route on the same ground plane.
    for (const id of ["park", "downtown"] as const) {
        const park = id === "park";
        rect(0, 0, 640, 512, park ? 0x479a55 : 0xb7b3a0);
        for (let i = 0; i < 1600; i++) rect((i * 137 + 17) % 640, (i * 79) % 512, 1, 1,
            park ? 0x67ac61 : 0xa6a695);
        poly([-20, 91, 660, 431, 660, 549, -20, 209], park ? 0xd0c49d : 0xcacbbe);
        poly([-20, 121, 660, 461, 660, 519, -20, 179], park ? 0xb5aa83 : 0x626665);
        for (let x = -20; x < 680; x += 30) {
            line(x, x / 2 + 94, x - 24, x / 2 + 106, 0x949786);
            line(x, x / 2 + 191, x - 24, x / 2 + 203, 0x949786);
        }
        if (park) {
            ellipse(423, 135, 220, 102, 0xb1c397);
            ellipse(423, 132, 202, 86, 0x6caba8);
            ellipse(407, 124, 154, 55, 0x8bc4ba, false);
            for (let i = 0; i < 5; i++) line(354 + i * 24, 130 + i % 2 * 12, 369 + i * 24, 130 + i % 2 * 12, 0xc7e1cc);
            for (const [x, y, size] of [[48, 80, 1.4], [153, 146, 1], [555, 191, 1.3], [202, 390, 1.4], [436, 440, 1.5]]) tree(x, y, size);
            const bench = (x: number, y: number) => {
                poly([x, y, x + 48, y + 24, x + 57, y + 19, x + 9, y - 5], 0xd1a664);
                poly([x, y - 17, x + 48, y + 7, x + 48, y + 16, x, y - 8], 0x9b754a);
                for (const dx of [5, 42]) line(x + dx, y + dx / 2, x + dx, y + dx / 2 + 13, 0x42554a);
            };
            bench(350, 229); bench(53, 294);
            fence(337, 458, 150, -0.5);
            poly([72, 357, 109, 375, 93, 383, 56, 365], 0x71563d);
            for (let i = 0; i < 9; i++) ellipse(62 + i * 5, 363 + i * 2, 5, 5, i % 2 ? 0xe5c969 : 0xc77c88, false);
        } else {
            const office = (x: number, y: number, w: number, d: number, h: number, color: number) => {
                poly([x, y - h, x + w, y + w / 2 - h, x + w, y + w / 2, x, y], color);
                poly([x + w, y + w / 2 - h, x + w + d, y + (w - d) / 2 - h,
                    x + w + d, y + (w - d) / 2, x + w, y + w / 2], 0x727d7d);
                poly([x, y - h, x + d, y - d / 2 - h, x + w + d, y + (w - d) / 2 - h,
                    x + w, y + w / 2 - h], 0xc8c5b0);
                for (let row = 26; row < h - 14; row += 30) for (let col = 10; col < w - 16; col += 26) {
                    const yy = y + col / 2 - row;
                    poly([x + col, yy, x + col + 16, yy + 8, x + col + 16, yy + 25, x + col, yy + 17], 0x8fc0c3);
                    line(x + col + 8, yy + 4, x + col + 8, yy + 21, 0xd3e5d4);
                }
                poly([x + 8, y - 12, x + w - 8, y + (w - 8) / 2 - 16,
                    x + w - 12, y + (w - 12) / 2 - 5, x + 4, y - 2], 0x306b69);
            };
            office(-35, 84, 104, 89, 124, 0xc6b489);
            office(349, 227, 108, 116, 156, 0xadb9af);
            office(-58, 429, 134, 90, 151, 0xc4a29a);
            for (const [x, y] of [[173, 145], [548, 215], [405, 446]]) {
                rect(x, y - 61, 3, 61, 0x40574d);
                ellipse(x + 4, y - 61, 20, 8, 0xe2dca6);
                ellipse(x + 1, y, 14, 6, 0x7f897b);
            }
            for (let x = 30; x < 640; x += 80)
                poly([x, x / 2 + 146, x + 25, x / 2 + 158.5, x + 23, x / 2 + 162, x - 2, x / 2 + 149.5], 0xe0d8b3, false);
            tree(316, 474, 1.1); tree(577, 408, 1);
            poly([444, 396, 502, 425, 523, 414, 465, 385], 0x526d86);
            poly([450, 390, 476, 403, 486, 398, 460, 385], 0xb2cbcb);
            ellipse(456, 405, 9, 12, 0x344c42); ellipse(500, 426, 9, 12, 0x344c42);
        }
        g.generateTexture(id, 640, 512);
        g.clear();
    }

    // Small wheeled lemonade cart with alternating parasol panels.
    ellipse(39, 78, 52, 14, 0x658653, false);
    poly([16, 51, 39, 61, 57, 52, 34, 42], 0xfff1a5);
    poly([16, 51, 39, 61, 39, 78, 16, 68], 0xf3d449);
    poly([39, 61, 57, 52, 57, 69, 39, 78], 0xba9c24);
    for (const x of [21, 48]) {
        ellipse(x, x === 21 ? 71 : 75, 9, 12, 0x344c42);
        ellipse(x, x === 21 ? 71 : 75, 3, 5, 0xa5b0a2);
    }
    line(21, 68, 35, 74, 0xffef93);
    ellipse(29, 63, 9, 6, 0xfff17b);
    line(48, 49, 63, 56, ink);
    // Vendor face, shirt, and pitcher remain distinct at the native game size.
    rect(16, 37, 8, 10, 0xd6a777);
    rect(14, 35, 11, 4, 0x664636);
    rect(14, 47, 12, 7, 0xf0e8cd);
    rect(21, 41, 1, 2, ink);
    rect(42, 45, 7, 10, 0xd9eee5);
    rect(43, 49, 5, 5, 0xebd640);
    rect(51, 49, 4, 6, 0xfffbe4);
    line(35, 19, 35, 56, 0x725a36);
    line(36, 19, 36, 56, 0xd4c58c);
    const peak = [35, 6];
    const rim = [
        [6, 26],
        [15, 14],
        [35, 11],
        [56, 20],
        [65, 34],
        [44, 40],
        [21, 35],
        [6, 26],
    ];
    for (let i = 0; i < rim.length - 1; i++) {
        poly([...peak, ...rim[i], ...rim[i + 1]], i % 2 ? 0xf0d747 : 0x477fba);
        line(peak[0], peak[1], rim[i][0], rim[i][1], 0xffed9c);
    }
    poly([6, 26, 21, 35, 44, 40, 65, 34, 65, 38, 44, 44, 21, 39, 6, 30], 0xdfc145);
    line(34, 4, 37, 4, ink);
    g.generateTexture("stand", 72, 88);
    g.clear();

    const shirts = [0xc96852, 0x536daf, 0xddba55];
    const skins = [0xe8bb92, 0xbe8b65, 0xe5b188];
    for (let profile = 0; profile < 3; profile++) {
        for (let pose = 0; pose < 4; pose++) {
            ellipse(9, 30, 15, 5, 0x81907e, false);
            const stride = pose === 1 ? 2 : 0;
            rect(6 - stride, 21, 3, 9, 0x344250);
            rect(10 + stride, 21, 3, 8, 0x465364);
            rect(5 - stride, 29, 5, 2, 0x263b37);
            rect(10 + stride, 28, 5, 2, 0x263b37);
            poly([5, 12, 11, 10, 14, 14, 13, 23, 5, 22, 3, 16], shirts[profile]);
            line(5, 15, 5, 21, 0xe2bea0);
            rect(5, 3, 7, 9, skins[profile]);
            rect(4, 2, 8, 4, profile === 2 ? 0x8d6239 : 0x453c34);
            rect(12, 7, 2, 3, skins[profile]);
            rect(11, 6, 1, 2, ink);
            if (profile === 1) {
                rect(3, 2, 10, 3, 0xd9ddc3);
                rect(10, 4, 5, 1, 0xd9ddc3);
            }
            if (pose === 2) {
                rect(5, 3, 7, 5, 0x453c34);
                line(5, 12, 11, 12, 0xf0deb3);
            }
            if (pose === 3) {
                rect(12, 14, 4, 3, skins[profile]);
                rect(14, 10, 4, 6, 0xfff5d3);
                rect(15, 11, 2, 2, 0xe8ce37);
            } else rect(12, 15 + stride, 3, 5, skins[profile]);
            g.generateTexture(`customer-${profile}-${pose}`, 20, 34);
            g.clear();
        }
    }
    g.destroy();
}
