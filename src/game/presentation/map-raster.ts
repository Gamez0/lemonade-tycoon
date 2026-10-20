// One logical raster is reused by the scene and map-review tooling.
export function logicalMap(image: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = 300; canvas.height = 240;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
}

export function mapTexture(image: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = 640; canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(logicalMap(image), 0, 0, canvas.width, canvas.height);
    return canvas;
}
