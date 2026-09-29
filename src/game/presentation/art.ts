import Phaser from "phaser";

// Original code-authored artwork. Fine outlines and a shared 2:1 ground projection.
// No source-game image or sprite is embedded here.
export const STREET = { stopX: 267, pavementY: (x: number) => x / 2 + 112 };
export const CART = { x: 228, y: 155 };

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
    rect(0, 0, 640, 440, 0x3f9e56);
    for (let i = 0; i < 4100; i++) {
        const x = (i * 137 + 17) % 640,
            y = (i * 79 + Math.floor(i / 640) * 31) % 440;
        rect(x, y, 1, 1, i % 3 ? 0x51aa61 : 0x348b48);
    }
    // Diagonal street and two continuous pavement lanes.
    poly([-20, 91, 660, 431, 660, 549, -20, 209], 0xd4d5c6);
    poly([-20, 115, 660, 455, 660, 525, -20, 185], 0x626665);
    line(-20, 119, 660, 459, 0x90958d);
    line(-20, 181, 660, 521, 0x3f4948);
    for (let x = -40; x < 680; x += 27) {
        line(x, x / 2 + 101, x - 24, x / 2 + 113, 0x989f95);
        line(x, x / 2 + 195, x - 24, x / 2 + 207, 0x989f95);
    }
    for (let x = -10; x < 640; x += 83) {
        poly([x, x / 2 + 159, x + 28, x / 2 + 173, x + 26, x / 2 + 176, x - 2, x / 2 + 162], 0xd7d6bb, false);
    }
    // A side road turns out of the frame, creating a small residential junction.
    poly([460, 0, 565, 0, 238, 164, 133, 111], 0xd1d3c4);
    poly([489, 0, 539, 0, 216, 162, 166, 137], 0x626665);
    line(484, 3, 166, 162, 0x8a9088);
    for (let x = 245; x < 500; x += 58) line(x, 259 - x / 2, x + 17, 250.5 - x / 2, 0xd6d4b5);
    // Drain grate, street markings, service cover.
    ellipse(348, 320, 22, 11, 0x515c58);
    for (let k = -5; k <= 5; k += 3) line(340, 320 + k / 2, 356, 320 + k / 2, 0x778179);
    poly([85, 166, 101, 174, 96, 177, 80, 169], 0x3b4b46);
    for (let k = 0; k < 5; k++) line(83 + k * 3, 167 + k * 1.5, 80 + k * 3, 169 + k * 1.5, 0x9ba99b);

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
    const house = (
        x: number,
        y: number,
        w: number,
        d: number,
        h: number,
        front: number,
        side: number,
        roof: number,
    ) => {
        const rise = 30;
        poly([x, y, x + w, y + w / 2, x + w + d + 15, y + (w - d) / 2 + 8, x + d + 15, y - d / 2], 0x347b45, false);
        // Front and side walls follow the same ground axes.
        poly([x, y - h, x + w, y + w / 2 - h, x + w, y + w / 2, x, y], front);
        poly(
            [x + w, y + w / 2 - h, x + w + d, y + (w - d) / 2 - h, x + w + d, y + (w - d) / 2, x + w, y + w / 2],
            side,
        );
        line(x, y - 6, x + w, y + w / 2 - 6, 0xd8d3b5);
        line(x + w, y + w / 2 - 6, x + w + d, y + (w - d) / 2 - 6, 0x767568);
        // Window coordinates lie directly on each wall plane.
        const window = (offset: number, elevation: number, right: boolean) => {
            const wx = right ? x + w + offset : x + offset;
            const wy = right ? y + w / 2 - offset / 2 - elevation : y + offset / 2 - elevation;
            const slope = right ? -0.5 : 0.5;
            poly([wx, wy, wx + 16, wy + 16 * slope, wx + 16, wy + 16 * slope + 25, wx, wy + 25], 0xebe6c9);
            poly(
                [
                    wx + 3,
                    wy + 4,
                    wx + 13,
                    wy + 13 * slope + 3,
                    wx + 13,
                    wy + 13 * slope + 20,
                    wx + 3,
                    wy + 3 * slope + 21,
                ],
                0x609998,
            );
            line(wx + 8, wy + 8 * slope + 3, wx + 8, wy + 8 * slope + 22, 0xe2e8c9);
            line(wx + 2, wy + 13, wx + 14, wy + 13 + 12 * slope, 0xe2e8c9);
            line(wx - 2, wy + 26, wx + 18, wy + 26 + 20 * slope, ink);
        };
        for (const offset of [12, w - 27]) window(offset, h - 14, false);
        for (const offset of [16, d - 31]) window(offset, h - 18, true);
        if (h > 85) for (const offset of [12, w - 27]) window(offset, 45, false);
        const doorX = x + w / 2 - 8,
            doorY = y + (w / 2 - 8) / 2;
        poly([doorX, doorY - 35, doorX + 17, doorY - 26.5, doorX + 17, doorY + 8.5, doorX, doorY], 0x66594c);
        rect(doorX + 12, doorY - 10, 2, 2, 0xf4d975);
        poly([doorX, doorY, doorX + 17, doorY + 8.5, doorX + 9, doorY + 12.5, doorX - 8, doorY + 4], 0xc6c9bd);
        // Roof has gables, overhang, shingle seams and a brick chimney.
        poly([x, y - h, x + w / 2, y + w / 4 - h - rise, x + w, y + w / 2 - h], front);
        poly(
            [
                x - 5,
                y - h - 1,
                x + w / 2,
                y + w / 4 - h - rise - 3,
                x + w / 2 + d + 5,
                y + w / 4 - d / 2 - h - rise - 3,
                x + d,
                y - d / 2 - h - 3,
            ],
            roof,
        );
        poly(
            [
                x + w / 2,
                y + w / 4 - h - rise - 3,
                x + w + 5,
                y + w / 2 - h - 2,
                x + w + d + 5,
                y + (w - d) / 2 - h - 2,
                x + w / 2 + d + 5,
                y + w / 4 - d / 2 - h - rise - 3,
            ],
            0x547b7a,
        );
        for (let i = 1; i < 6; i++) {
            const t = i / 6;
            const xx = x + w / 2 + t * (w / 2 + 5),
                yy = y + w / 4 - h - rise - 3 + t * (w / 4 + rise + 1);
            line(xx, yy, xx + d + 5, yy - d / 2, 0x6c9390);
        }
        line(x + w / 2, y + w / 4 - h - rise - 4, x + w / 2 + d, y + w / 4 - d / 2 - h - rise - 4, 0xd6d4b8);
        const cx = x + w / 2 + d * 0.55,
            cy = y + w / 4 - d * 0.275 - h - rise + 8;
        poly([cx, cy, cx + 12, cy + 6, cx + 12, cy - 16, cx, cy - 22], 0xa77562);
        poly([cx + 12, cy + 6, cx + 20, cy + 2, cx + 20, cy - 20, cx + 12, cy - 16], 0x80594e);
        poly([cx, cy - 22, cx + 8, cy - 26, cx + 20, cy - 20, cx + 12, cy - 16], 0xd6b49b);
        line(cx + 2, cy - 11, cx + 11, cy - 6, 0x694c42);
    };
    fence(3, 100, 130, 0.5);
    fence(354, 208, 176, -0.5);
    tree(595, 153, 1.3);
    tree(568, 205, 1.05);
    house(-23, 88, 106, 93, 94, 0xbe9ac0, 0x906e95, 0xb9a7ad);
    house(361, 243, 108, 98, 109, 0xd1ad74, 0xa08658, 0x80aca8);
    // Path from the second front door to the sidewalk, edged flower bed.
    poly([394, 263, 414, 273, 392, 284, 372, 274], 0xc6c9b9);
    poly([327, 231, 350, 242, 337, 249, 314, 237], 0x6a6243);
    for (let i = 0; i < 7; i++) {
        rect(319 + i * 4, 233 + i * 2, 2, 5, 0x226b32);
        rect(318 + i * 4, 231 + i * 2, 4, 3, i % 2 ? 0xf2de64 : 0xd78ea1);
    }
    tree(153, 150, 0.8);
    tree(308, 232, 0.85);
    // Mailbox, bin and a modest street lamp along the verge.
    rect(182, 180, 3, 17, 0x596954);
    poly([175, 177, 183, 173, 192, 178, 184, 182], 0x639799);
    poly([175, 177, 184, 182, 184, 189, 175, 184], 0x416f79);
    poly([184, 182, 192, 178, 192, 185, 184, 189], 0x315c67);
    line(189, 177, 189, 172, 0xc7aa62);
    rect(92, 228, 3, 48, 0x40584f);
    poly([84, 227, 91, 219, 103, 223, 98, 232], 0x263e3c);
    poly([88, 225, 94, 222, 99, 224, 96, 229], 0xf0eab0);
    ellipse(94, 275, 13, 5, 0x7e9580);
    // Foreground garden and cropped house frame the street like a little diorama.
    fence(-12, 342, 173, 0.5);
    tree(188, 378, 1.3);
    house(-68, 438, 130, 103, 96, 0xdbc28c, 0xa99870, 0x82b2aa);
    tree(574, 414, 1.2);
    fence(560, 388, 90, -0.5);
    g.generateTexture("neighborhood", 640, 440);
    g.clear();

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
