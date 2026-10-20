// Keep source detail. Coordinates use a 300x240 authored grid, but that grid
// must never become an intermediate image resolution.
export function logicalMap(image: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
}

export function mapTexture(image: HTMLImageElement): HTMLCanvasElement {
    return logicalMap(image);
}

// Rental cards are tiny previews, never the world's backing texture.
export function mapThumbnail(image: HTMLImageElement): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = 300; canvas.height = 240;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
}
