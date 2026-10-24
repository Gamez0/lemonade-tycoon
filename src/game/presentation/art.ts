import Phaser from "phaser";
import { createMapArt } from "./map-assets";

// Code-authored characters and original independently generated map assets.
// Fine outlines and a shared 2:1 ground projection.
// No source-game image or sprite is embedded here.
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
    createMapArt(scene);

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
        for (let pose = 0; pose < 6; pose++) {
            ellipse(9, 30, 15, 5, 0x81907e, false);
            const stride = pose === 1 || pose === 4 ? 2 : 0;
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
            if (pose === 2 || pose >= 4) {
                rect(5, 3, 7, 5, 0x453c34);
                line(5, 12, 11, 12, 0xf0deb3);
            }
            if (pose === 3 || pose === 5) {
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
