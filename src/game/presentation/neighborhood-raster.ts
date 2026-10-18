// Independently authored 300x240 scene. All edges are integer pixels, including
// polygon spans and outlines; no source-game image is loaded or sampled.
export function neighborhoodRaster(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = 300; canvas.height = 240;
    const ctx = canvas.getContext("2d")!;
    const ink = "#304436";
    const rect = (x: number, y: number, w: number, h: number, color: string) => {
        ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    };
    const line = (x: number, y: number, endX: number, endY: number, color = ink) => {
        x = Math.round(x); y = Math.round(y); endX = Math.round(endX); endY = Math.round(endY);
        const dx = Math.abs(endX - x), dy = -Math.abs(endY - y);
        const sx = x < endX ? 1 : -1, sy = y < endY ? 1 : -1;
        let error = dx + dy;
        for (;;) {
            rect(x, y, 1, 1, color);
            if (x === endX && y === endY) break;
            const twice = error * 2;
            if (twice >= dy) { error += dy; x += sx; }
            if (twice <= dx) { error += dx; y += sy; }
        }
    };
    const poly = (points: number[][], color: string, outline = true) => {
        const vertices = points.map(([x, y]) => [Math.round(x), Math.round(y)]);
        const low = Math.max(0, Math.min(...vertices.map(p => p[1])));
        const high = Math.min(239, Math.max(...vertices.map(p => p[1])));
        for (let y = low; y <= high; y++) {
            const crossings: number[] = [];
            vertices.forEach(([x1, y1], i) => {
                const [x2, y2] = vertices[(i + 1) % vertices.length];
                if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) crossings.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
            });
            crossings.sort((a, b) => a - b);
            for (let i = 0; i + 1 < crossings.length; i += 2) {
                const start = Math.ceil(crossings[i]), end = Math.floor(crossings[i + 1]);
                rect(start, y, end - start + 1, 1, color);
            }
        }
        if (outline) vertices.forEach(([x, y], i) => line(x, y, ...vertices[(i + 1) % vertices.length] as [number, number]));
    };
    rect(0, 0, 300, 240, "#258d45");
    for (let i = 0; i < 1750; i++) rect((i * 73 + 11) % 300, (i * 43 + Math.floor(i / 300) * 17) % 240,
        1, 1, i % 3 ? "#31984c" : "#187b3d");
    // Continuous pavement and asphalt outlines; the lower-left branch opens
    // into the through street without a curb running across its mouth.
    poly([[-12, 3], [312, 165], [312, 221], [216, 173], [-12, 287], [-12, 209], [168, 119], [-12, 59]], "#c7ccc5");
    poly([[-12, 17], [312, 179], [312, 207], [216, 159], [-12, 273], [-12, 237], [180, 141], [-12, 45]], "#494d4d");
    line(-12, 19, 312, 181, "#666b68");
    line(-12, 235, 180, 139, "#949a91");
    // Foot crossing connects the branch's inner pavement to the upper sidewalk.
    for (let i = 0; i < 6; i++) {
        const x = 158 + i * 7, y = 141 - i * 5.6;
        poly([[x, y], [x + 3, y - 2], [x + 9, y + 1], [x + 6, y + 3]], "#c5c7b6", false);
    }
    for (let x = -12; x < 320; x += 22) {
        line(x, x / 2 + 9, x - 12, x / 2 + 15, "#929b92");
        if (x < 168 || x > 240) line(x, x / 2 + 61, x - 12, x / 2 + 67, "#929b92");
        if (x < 180) line(x, 221 - x / 2, x + 12, 227 - x / 2, "#929b92");
        line(x, 259 - x / 2, x + 12, 265 - x / 2, "#929b92");
    }
    const hedge = (x: number, y: number, length: number) => {
        poly([[x, y], [x + length, y + length / 2], [x + length, y + length / 2 - 12], [x, y - 12]], "#23733a");
        poly([[x, y - 12], [x + 6, y - 15], [x + length + 6, y + length / 2 - 15], [x + length, y + length / 2 - 12]], "#3fa34b");
        for (let i = 4; i < length; i += 7) rect(x + i, y + i / 2 - 9, 2, 2, "#348d40");
    };
    const window = (x: number, y: number, slope: number, width = 10, height = 16) => {
        poly([[x, y], [x + width, y + width * slope], [x + width, y + width * slope + height], [x, y + height]], "#a3c8cd");
        line(x + 2, y + 2, x + width - 2, y + (width - 2) * slope + 2, "#eff3d8");
        line(x + width / 2, y + width / 2 * slope, x + width / 2, y + width / 2 * slope + height, "#566c66");
        line(x, y + height / 2, x + width, y + width * slope + height / 2, "#e1e7ca");
    };
    // Low houses across the upper street and their paths to the curb.
    hedge(76, 6, 65);
    poly([[156, 30], [170, 37], [183, 31], [169, 24]], "#bcc2b6");
    poly([[161, -10], [205, 12], [205, 51], [161, 29]], "#b28c56");
    poly([[205, 12], [240, -6], [240, 33], [205, 51]], "#897445");
    poly([[153, -15], [206, 12], [244, -7], [192, -34]], "#327149");
    window(174, 6, 0.5); window(220, 6, -0.5);
    poly([[197, 31], [204, 35], [204, 47], [197, 43]], "#526962");
    hedge(260, 76, 45);
    // Cropped tall left house frames the lawn rather than occupying its center.
    poly([[-14, 30], [77, 75], [77, 120], [-14, 165]], "#806486");
    poly([[-14, 30], [21, 12], [77, 40], [77, 120], [21, 148], [-14, 130]], "#947a9d");
    poly([[-23, 49], [38, -15], [94, 23], [81, 65], [10, 101]], "#b5a1a4");
    window(24, 101, -0.5, 13, 19); window(58, 84, -0.5, 11, 17);
    window(58, 56, -0.5, 11, 17);
    poly([[20, 127], [30, 122], [30, 141], [20, 146]], "#5a5145");
    poly([[16, 127], [22, 120], [35, 114], [32, 121]], "#c3abb0");
    poly([[15, 148], [30, 140], [42, 146], [27, 154]], "#b8c0b2");
    // Rounded tree silhouette still uses explicit integer spans, never ellipses.
    const tree = (x: number, y: number) => {
        rect(x, y - 8, 2, 12, "#665038");
        poly([[x - 7, y - 6], [x - 11, y - 14], [x - 8, y - 23], [x, y - 27], [x + 8, y - 23], [x + 10, y - 13], [x + 5, y - 6]], "#266d3e");
        poly([[x - 8, y - 16], [x - 5, y - 23], [x + 1, y - 25], [x + 6, y - 19], [x + 3, y - 12], [x - 4, y - 10]], "#3d9c50", false);
        for (let i = 0; i < 9; i++) rect(x - 5 + (i * 7) % 10, y - 21 + (i * 3) % 10, 1, 1, "#57ae5d");
    };
    tree(53, 171);
    rect(202, 45, 1, 10, "#354d43"); rect(200, 42, 5, 4, "#77a2a2");
    // Large foreground roof crops the lower right, leaving the service pavement clear.
    poly([[202, 201], [260, 172], [320, 202], [320, 260], [202, 260]], "#a0a16e");
    poly([[185, 202], [222, 144], [310, 187], [320, 228], [255, 260]], "#84a9a5");
    poly([[185, 202], [222, 144], [215, 218]], "#617e76");
    line(222, 144, 310, 187, "#b5d1be");
    poly([[208, 156], [216, 160], [216, 171], [208, 167]], "#8a7367");
    poly([[216, 160], [221, 157], [221, 168], [216, 171]], "#62584e");
    poly([[264, 196], [265, 177], [280, 193]], "#5f8581");
    window(265, 186, 0.5, 10, 11);
    hedge(121, 238, 34); tree(159, 244);
    // Service cover on the asphalt, not the customer's service stop.
    poly([[136, 186], [142, 183], [148, 186], [148, 190], [141, 193], [135, 190]], "#626964");
    line(138, 187, 145, 187, "#353f39"); line(138, 190, 145, 190, "#353f39");

    const display = document.createElement("canvas");
    display.width = 640; display.height = 512;
    const scaled = display.getContext("2d")!;
    scaled.imageSmoothingEnabled = false;
    scaled.drawImage(canvas, 0, 0, display.width, display.height);
    return display;
}
