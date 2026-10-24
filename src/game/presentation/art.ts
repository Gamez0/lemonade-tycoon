import Phaser from "phaser";
import { createMapArt } from "./map-assets";
import { createCustomerArt } from "./customer-art";

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

    g.destroy();
    createCustomerArt(scene);
}
