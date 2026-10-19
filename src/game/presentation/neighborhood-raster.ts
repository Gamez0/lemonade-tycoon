import { paintedNeighborhood, type NeighborhoodImages } from "./painted-neighborhood";

// A 300x240 logical scene with integer street spans and optional painted sprites.
// No source-game image is loaded or sampled.
export function neighborhoodRaster(images?: NeighborhoodImages): HTMLCanvasElement {
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
    rect(0, 0, 300, 240, images ? "#328b48" : "#258d45");
    for (let i = 0; !images && i < 1750; i++) rect((i * 73 + 11) % 300, (i * 43 + Math.floor(i / 300) * 17) % 240,
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
    if (images) {
        // A seam belongs to the pavement, never the grass or the street.
        ctx.save();
        ctx.beginPath();
        for (const points of [
            [[-12, 3], [312, 165], [312, 221], [216, 173], [-12, 287], [-12, 209], [168, 119], [-12, 59]],
            [[-12, 17], [312, 179], [312, 207], [216, 159], [-12, 273], [-12, 237], [180, 141], [-12, 45]],
        ]) {
            points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
            ctx.closePath();
        }
        ctx.clip("evenodd");
    }
    for (let x = -12; x < 320; x += 22) {
        line(x, x / 2 + 9, x - 12, x / 2 + 15, "#929b92");
        if (x < 168 || x > 240) line(x, x / 2 + 61, x - 12, x / 2 + 67, "#929b92");
        if (x < 180) line(x, 221 - x / 2, x + 12, 227 - x / 2, "#929b92");
        line(x, 259 - x / 2, x + 12, 265 - x / 2, "#929b92");
    }
    const displayCanvas = () => {
        const display = document.createElement("canvas");
        display.width = 640; display.height = 512;
        const scaled = display.getContext("2d")!;
        scaled.imageSmoothingEnabled = false;
        scaled.drawImage(canvas, 0, 0, display.width, display.height);
        return display;
    };
    if (images) {
        ctx.restore();
        paintedNeighborhood(ctx, images);
        return displayCanvas();
    }
    const hedge = (x: number, y: number, length: number) => {
        poly([[x, y], [x + length, y + length / 2], [x + length, y + length / 2 - 12], [x, y - 12]], "#23733a");
        poly([[x, y - 12], [x + 6, y - 15], [x + length + 6, y + length / 2 - 15], [x + length, y + length / 2 - 12]], "#3fa34b");
        poly([[x + length, y + length / 2], [x + length + 6, y + length / 2 - 3],
            [x + length + 6, y + length / 2 - 15], [x + length, y + length / 2 - 12]], "#1a6034");
        for (let i = 3; i < length; i += 4) {
            rect(x + i, y + i / 2 - 10, 2, 2, "#348d40");
            rect(x + i + 1, y + i / 2 - 5, 1, 2, "#175d32");
            rect(x + i + 3, y + i / 2 - 14, 2, 1, "#5ca957");
        }
    };
    const window = (x: number, y: number, slope: number, width = 10, height = 16) => {
        const corners = (inset: number) => [[x + inset, y + inset + inset * slope],
            [x + width - inset, y + inset + (width - inset) * slope],
            [x + width - inset, y + height - inset + (width - inset) * slope],
            [x + inset, y + height - inset + inset * slope]];
        poly(corners(0), "#4c5554");
        poly(corners(1), "#ded7bd", false);
        poly(corners(2), "#6097a8", false);
        line(x + 2, y + height - 4 + 2 * slope, x + width - 3, y + 3 + (width - 3) * slope, "#acd6d5");
        line(x + width / 2, y + 1 + width / 2 * slope, x + width / 2, y + height - 2 + width / 2 * slope, "#e9e3cc");
        line(x + 1, y + height / 2 + slope, x + width - 1, y + height / 2 + (width - 1) * slope, "#e9e3cc");
        line(x - 1, y + height + 1 - slope, x + width + 1, y + height + 1 + (width + 1) * slope, "#e4d9c1");
    };
    // Upper bungalow: one continuous facade, a shaded end and an overhanging roof.
    hedge(76, 6, 65);
    poly([[191, 46], [203, 52], [212, 47], [200, 41]], "#bac0b2");
    poly([[161, -10], [205, 12], [205, 51], [161, 29]], "#b89c6b");
    poly([[205, 12], [240, -6], [240, 33], [205, 51]], "#8c784e");
    for (let y = 1; y < 34; y += 5) line(163, y, 203, y + 20, "#a58b5f");
    poly([[153, -15], [206, 12], [244, -7], [192, -34]], "#326c50");
    line(154, -14, 206, 13, "#d7d6b6"); line(206, 13, 243, -6, "#233e35");
    window(170, 4, 0.5, 12, 17); window(220, 6, -0.5, 11, 17);
    poly([[192, 23], [201, 27], [201, 47], [192, 43]], "#ded0ad");
    poly([[194, 26], [199, 29], [199, 45], [194, 42]], "#526f6d");
    rect(198, 36, 1, 1, "#d9bd71");
    poly([[189, 22], [193, 18], [205, 24], [202, 28]], "#426f59");
    hedge(260, 76, 45);
    // Left house: roof ridge and eaves share the facade's 1:2 direction.
    // Windows stay below the eave; the porch connects to a separate front step.
    poly([[-20, 108], [80, 58], [80, 123], [-20, 173]], "#8e7094");
    for (let y = 115; y < 170; y += 6) line(-18, y, 78, y - 48, "#85668b");
    line(78, 62, 78, 122, "#bea4b4");
    line(-18, 169, 80, 120, "#645468");
    poly([[-40, 51], [58, 2], [84, 60], [-16, 110]], "#b5a1a4");
    line(-39, 51, 58, 3, "#dbbfc0");
    line(-16, 111, 84, 61, "#55494f");
    line(-16, 108, 83, 59, "#d0b5b7");
    for (let row = 1; row < 5; row++) {
        const dx = row * 5, dy = row * 11;
        line(-40 + dx, 51 + dy, 58 + dx, 2 + dy, "#a49095");
    }
    window(20, 103, -0.5, 12, 18); window(57, 84, -0.5, 12, 18);
    window(48, 114, -0.5, 20, 18);
    // A shallow flower box has a visible top, shaded face and distinct blooms.
    poly([[47, 133], [69, 122], [72, 124], [50, 135]], "#73804a");
    poly([[50, 135], [72, 124], [72, 128], [50, 139]], "#725444");
    for (let i = 0; i < 6; i++) {
        rect(51 + i * 3, 132 - i * 1.5, 2, 2, i % 2 ? "#ddbd55" : "#e3a0a0");
    }
    poly([[14, 128], [28, 121], [28, 145], [14, 152]], "#d0bca7");
    poly([[17, 129], [26, 124], [26, 144], [17, 149]], "#65594e");
    window(19, 128, -0.5, 5, 8);
    rect(24, 140, 1, 1, "#d1b775");
    line(11, 131, 11, 153, "#c8b5a1"); line(31, 121, 31, 143, "#c8b5a1");
    poly([[8, 128], [14, 117], [30, 109], [35, 115]], "#c4aeb0");
    poly([[8, 128], [35, 115], [35, 118], [8, 131]], "#7b686d");
    poly([[10, 154], [29, 144], [39, 149], [20, 159]], "#b9bbaa");
    line(20, 160, 39, 150, "#777f73");
    // Integer ellipse spans keep foliage round at the authored resolution.
    const oval = (x: number, y: number, rx: number, ry: number, color: string) => {
        for (let row = -ry; row <= ry; row++) {
            const span = Math.floor(rx * Math.sqrt(1 - row * row / (ry * ry)));
            rect(x - span, y + row, span * 2 + 1, 1, color);
        }
    };
    const tree = (x: number, y: number) => {
        oval(x + 4, y + 3, 10, 3, "#26723e");
        rect(x - 1, y - 14, 4, 18, "#514a31");
        rect(x, y - 13, 2, 16, "#a5834c");
        line(x, y - 7, x - 5, y - 13, "#685437");
        oval(x, y - 19, 12, 14, "#245b36");
        oval(x - 2, y - 21, 10, 12, "#368d46");
        oval(x - 4, y - 24, 7, 8, "#459e50");
        for (let i = 0; i < 21; i++) {
            const px = (i * 7) % 17 - 8, py = (i * 11) % 19 - 9;
            if (px * px / 100 + py * py / 144 < 0.85)
                rect(x + px, y - 21 + py, 2, 1, i % 3 ? "#337e40" : "#68b15b");
        }
    };
    tree(53, 171);
    // Mailbox stands by its own curb approach, clear of the bungalow's doorway.
    rect(232, 91, 2, 11, "#6b5942");
    poly([[228, 88], [232, 86], [237, 88], [233, 91]], "#a6c6bc");
    poly([[228, 88], [233, 91], [233, 95], [228, 92]], "#628f8c");
    poly([[233, 91], [237, 88], [237, 92], [233, 95]], "#416a68");
    rect(235, 88, 1, 4, "#a8513d");
    // Foreground cottage: a gabled end supports a single continuous roof plane.
    poly([[185, 202], [273, 246], [273, 282], [185, 238]], "#b6b184");
    poly([[185, 202], [222, 144], [259, 181], [259, 239]], "#95966b");
    line(188, 205, 188, 238, "#d2cc9b");
    window(198, 216, 0.5, 14, 20);
    poly([[181, 203], [222, 142], [314, 188], [273, 249]], "#88aaa7");
    for (let row = 1; row < 7; row++) {
        const dx = -row * 5, dy = row * 8;
        line(222 + dx, 144 + dy, 311 + dx, 188 + dy, "#7d9e9b");
    }
    line(222, 142, 314, 188, "#bbd1c4");
    line(181, 203, 273, 249, "#45645e");
    line(183, 202, 274, 247, "#c0d2ba");
    // A dormer sits on the roof rather than appearing as a floating window.
    poly([[249, 205], [260, 183], [272, 211], [260, 217]], "#547b76");
    poly([[249, 205], [260, 192], [269, 215], [260, 219]], "#c8c5a4");
    window(254, 204, 0.5, 9, 10);
    line(247, 205, 259, 182, "#3d5b55");
    line(259, 182, 273, 210, "#b6d0bd");
    // Brick chimney has a dark open flue and a projecting cap.
    poly([[210, 156], [216, 159], [216, 174], [210, 171]], "#9a8171");
    poly([[216, 159], [222, 156], [222, 171], [216, 174]], "#715e55");
    for (let y = 162; y < 173; y += 4) line(211, y, 215, y + 2, "#c1a18a");
    poly([[208, 155], [215, 151], [224, 155], [216, 160]], "#b19b87");
    poly([[212, 155], [216, 153], [220, 155], [216, 157]], "#423e38");
    hedge(121, 238, 34); tree(159, 244);
    // Recessed oval service cover follows the road plane.
    oval(142, 188, 8, 4, "#303e38");
    oval(142, 187, 7, 3, "#737a70");
    oval(142, 187, 5, 2, "#4f5a53");
    for (let x = 138; x < 148; x += 3) line(x, 186, x - 2, 189, "#879085");

    return displayCanvas();
}
