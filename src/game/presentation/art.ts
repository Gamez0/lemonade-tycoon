import Phaser from "phaser";

// Original, code-authored pixel assets. Coordinates are logical pixels (2× display).
export function createArt(scene: Phaser.Scene): void {
    const g = scene.make.graphics({ x: 0, y: 0 });
    const rect = (x: number, y: number, w: number, h: number, c: number) => g.fillStyle(c).fillRect(x, y, w, h);
    const poly = (points: number[], color: number) => {
        g.fillStyle(color).fillPoints(Array.from({ length: points.length / 2 }, (_, i) =>
            new Phaser.Geom.Point(points[i * 2], points[i * 2 + 1])), true);
    };
    rect(0, 0, 320, 220, 0x9bc77e);
    for (let i = 0; i < 160; i++) rect((i * 47) % 320, (i * 29) % 220, 2, 1, i % 2 ? 0xadd38d : 0x8bb770);
    rect(0, 136, 320, 41, 0xe6d9b9);
    rect(0, 176, 320, 4, 0xbcb29b);
    rect(0, 180, 320, 40, 0x727e7c);
    rect(0, 184, 320, 2, 0x87918c);
    for (let x = 0; x < 320; x += 23) { rect(x, 137, 1, 39, 0xc9c0a6); rect(x + 4, 205, 12, 2, 0xe3d7ae); }
    rect(0, 157, 320, 1, 0xd1c6ae);
    // Two compact homes, pitched roofs and shaded side walls establish an elevated view.
    const house = (x: number, y: number, wall: number, roof: number) => {
        rect(x + 5, y + 47, 75, 8, 0x7da269);
        rect(x + 8, y + 16, 58, 35, wall);
        poly([x + 66,y + 16,x + 80,y + 8,x + 80,y + 44,x + 66,y + 51], 0xb28b63);
        poly([x,y + 18,x + 28,y - 6,x + 72,y - 6,x + 66,y + 18], roof);
        poly([x + 66,y + 18,x + 72,y - 6,x + 85,y + 8,x + 80,y + 11], 0x665d52);
        rect(x + 28, y + 27, 12, 24, 0x755d49);
        rect(x + 36, y + 38, 2, 2, 0xf7d477);
        for (const wx of [x + 14, x + 46]) {
            rect(wx, y + 25, 13, 15, 0xf5e6c4); rect(wx + 2, y + 27, 9, 10, 0x769fa2);
            rect(wx + 6, y + 27, 1, 10, 0xf5e6c4); rect(wx + 2, y + 32, 9, 1, 0xf5e6c4);
        }
        rect(x + 28, y + 51, 14, 3, 0xe6d9b9);
    };
    house(12, 24, 0xf0cb97, 0xb86e53); house(226, 18, 0xe8dcaf, 0x648c88);
    rect(41, 78, 13, 58, 0xd2cba8); rect(254, 72, 13, 64, 0xd2cba8);
    // Picket fence, a bench, flowers and mailbox; keep the walking lane clear.
    rect(0, 98, 89, 3, 0xf0e5c4);
    for (let x = 0; x < 90; x += 7) rect(x, 92, 3, 18, 0xf4e9ce);
    rect(82, 119, 27, 4, 0x8a6142); rect(82, 125, 27, 3, 0xb88753);
    rect(85, 128, 2, 7, 0x5d5a45); rect(104, 128, 2, 7, 0x5d5a45);
    rect(60, 117, 2, 17, 0x6b6b53); rect(55, 115, 13, 7, 0x587e83);
    const tree = (x: number, y: number) => {
        rect(x - 10, y + 24, 27, 4, 0x82ac6d); rect(x, y + 8, 4, 20, 0x805d40);
        rect(x - 13, y - 4, 29, 20, 0x4f8655); rect(x - 9, y - 10, 20, 30, 0x4f8655);
        rect(x - 10, y - 6, 19, 20, 0x6d9f5e); rect(x - 5, y - 8, 11, 6, 0x88b56d);
        rect(x - 11, y + 4, 5, 5, 0x82ad65);
    };
    tree(15, 119); tree(304, 118); tree(113, 43); tree(205, 25);
    for (const x of [73, 119, 270, 283]) {
        rect(x, 128, 2, 5, 0x588954); rect(x - 1, 126, 4, 3, 0xf4d46d);
    }
    g.generateTexture("neighborhood", 320, 220); g.clear();
    // Stand: timber counter, lemon badge, striped canvas and visible pitcher.
    rect(3, 49, 53, 5, 0x799660);
    rect(8, 11, 3, 34, 0x765737); rect(48, 11, 3, 34, 0x765737);
    rect(8, 31, 44, 20, 0x8e653c); rect(10, 33, 40, 16, 0xe0b85d);
    for (let x = 13; x < 50; x += 8) rect(x, 34, 1, 14, 0xc59847);
    rect(6, 29, 48, 4, 0xf3d481); rect(8, 49, 5, 4, 0x765737); rect(46, 49, 5, 4, 0x765737);
    rect(5, 5, 49, 8, 0xf0cb54); rect(2, 13, 55, 6, 0xf6d975);
    for (let x = 9; x < 55; x += 14) { rect(x, 5, 6, 8, 0xf9edc9); rect(x - 2, 13, 8, 6, 0xf9edc9); }
    rect(2, 19, 55, 2, 0xb58a43);
    rect(23, 37, 15, 9, 0xf8edce); rect(26, 39, 9, 5, 0xf4ca45); rect(33, 37, 4, 2, 0x749959);
    rect(37, 22, 7, 7, 0xdaf0dc); rect(38, 24, 5, 5, 0xf2cc4d); rect(44, 23, 2, 4, 0xe4ebcf);
    rect(20, 25, 3, 4, 0xfff5de); rect(25, 25, 3, 4, 0xfff5de);
    // Vendor peeking above counter.
    rect(13, 20, 5, 5, 0xdeaa78); rect(12, 18, 7, 3, 0x6c5039); rect(12, 25, 7, 4, 0x5c9274);
    g.generateTexture("stand", 60, 56); g.clear();
    const shirts = [0xc87552, 0x618fba, 0x9a78a7];
    for (let profile = 0; profile < 3; profile++) {
        for (let pose = 0; pose < 4; pose++) {
            rect(2, 18, 10, 2, 0xada58d);
            rect(4, 2, 6, 5, profile === 2 ? 0xb9825c : 0xe4b68a);
            rect(3, 0, 7, 3, 0x614c3e); rect(9, 4, 2, 2, 0xe4b68a);
            rect(9, 3, 1, 1, 0x3f4742);
            rect(4, 7, 6, 7, shirts[profile]); rect(3, 8, 2, 5, 0xe4b68a);
            rect(5, 14, 2, pose === 1 ? 3 : 4, 0x4c6265); rect(pose === 1 ? 9 : 8, 14, 2, 4, 0x4c6265);
            rect(pose === 1 ? 3 : 4, 18, 4, 1, 0x424c4c); rect(8, 18, 4, 1, 0x424c4c);
            if (pose === 2) { rect(4, 2, 6, 4, 0x614c3e); rect(9, 4, 2, 2, 0x614c3e); }
            if (pose === 3) { rect(9, 9, 4, 2, 0xe4b68a); rect(11, 7, 3, 4, 0xfff0c7); rect(11, 8, 3, 2, 0xf4cc4c); }
            g.generateTexture(`customer-${profile}-${pose}`, 16, 20); g.clear();
        }
    }
    g.destroy();
}
