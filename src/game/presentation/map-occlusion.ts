import type Phaser from "phaser";

// The authored background is flattened. Restore this foreground silhouette so
// pedestrians on the far sidewalk pass behind the house rather than on its roof.
// Coordinates describe our own shipped map; no original game pixels are used.
export function createMapOcclusion(scene: Phaser.Scene): Phaser.GameObjects.Image[] {
    const key = "neighborhood-house-occlusion";
    const source = scene.textures.get("map-source-neighborhood").getSourceImage() as HTMLImageElement;
    if (!scene.textures.exists(key)) {
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(80 * 1280 / 300);
        canvas.height = Math.ceil(100 * 1024 / 240);
        const ctx = canvas.getContext("2d")!;
        ctx.scale(1280 / source.width, 1024 / source.height);
        const polygon = [[0, 57], [55.6, 26.3], [80, 60.8], [79.7, 65], [10.5, 99], [0, 93]];
        ctx.beginPath();
        for (const [i, [x, y]] of polygon.entries()) {
            if (i === 0) ctx.moveTo(x * source.width / 300, y * source.height / 240);
            else ctx.lineTo(x * source.width / 300, y * source.height / 240);
        }
        ctx.closePath(); ctx.clip(); ctx.drawImage(source, 0, 0);
        scene.textures.addCanvas(key, canvas);
    }
    const texture = scene.textures.get(key).getSourceImage();
    return [scene.add.image(0, 0, key).setOrigin(0)
        .setDisplaySize(texture.width / 2, texture.height / 2)
        .setDepth(164 * 512 / 240).setVisible(false)];
}
