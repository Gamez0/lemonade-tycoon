/** Selected raster candidates, painted at the map's 300x240 logical resolution. */
export interface NeighborhoodImages {
    left: HTMLImageElement;
    cottage: HTMLImageElement;
    tree: HTMLImageElement;
    hedge: HTMLImageElement;
}

type Bounds = { x: number; y: number; w: number; h: number };
const bounds: Record<keyof NeighborhoodImages, Bounds> = {
    left: { x: 205, y: 79, w: 1003, h: 977 },
    cottage: { x: 186, y: 134, w: 1051, h: 891 },
    tree: { x: 295, y: 90, w: 815, h: 941 },
    hedge: { x: 175, y: 146, w: 1195, h: 789 },
};

export function paintedNeighborhood(ctx: CanvasRenderingContext2D, images: NeighborhoodImages): void {
    const polygon = (points: number[][]) => {
        ctx.beginPath();
        points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
        ctx.closePath();
        ctx.fill();
    };
    const place = (key: keyof NeighborhoodImages, width: number, anchor: number[], target: number[]) => {
        const image = images[key], source = bounds[key];
        const height = width * source.h / source.w;
        // Average the high-resolution source once onto the authored grid.
        // The finished map is then enlarged with nearest-neighbor sampling.
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(image, source.x, source.y, source.w, source.h,
            target[0] - anchor[0] * width, target[1] - anchor[1] * height, width, height);
        ctx.imageSmoothingEnabled = false;
    };
    ctx.fillStyle = "#c9c8b4";
    polygon([[194, 62], [202, 66], [158, 88], [150, 84]]);
    polygon([[292, 90], [300, 94], [235, 126.5], [227, 122.5]]);
    polygon([[40, 175], [48, 171], [56, 175], [48, 179]]);
    place("hedge", 70, [.03, .35], [76, 6]);
    place("hedge", 42, [.03, .35], [275, 122]);
    place("hedge", 40, [.03, .35], [121, 238]);
    place("left", 164, [.358, .994], [-18, 173]);
    place("cottage", 96, [.635, .995], [227, 74]);
    place("cottage", 88, [.635, .995], [322, 101]);
    place("cottage", 176, [.635, .995], [287, 293]);
    ctx.fillStyle = "#2c723e";
    for (const [x, y] of [[67, 163], [159, 246]]) {
        ctx.beginPath(); ctx.ellipse(x + 3, y + 1, 7, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    }
    place("tree", 28, [.56, .995], [67, 163]);
    place("tree", 30, [.56, .995], [159, 246]);
    ctx.fillStyle = "#343f38";
    ctx.beginPath(); ctx.ellipse(142, 188, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#778174";
    ctx.beginPath(); ctx.ellipse(142, 187, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#4e5d51";
    for (let i = 0; i < 3; i++) ctx.fillRect(139 + i * 2, 186, 1, 3);
    ctx.fillStyle = "#746043"; ctx.fillRect(213, 101, 1, 9);
    ctx.fillStyle = "#355b56"; ctx.fillRect(211, 98, 6, 4);
    ctx.fillStyle = "#b4c6bc"; ctx.fillRect(211, 97, 5, 3);
    ctx.fillStyle = "#b97052"; ctx.fillRect(216, 96, 1, 4);
}
