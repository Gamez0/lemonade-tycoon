import type Phaser from "phaser";

// The authored background is flattened. Restore this foreground silhouette so
// pedestrians on the far sidewalk pass behind the house rather than on its roof.
// Coordinates describe our own shipped map; no original game pixels are used.
export function createMapOcclusion(scene: Phaser.Scene): Phaser.GameObjects.Image[] {
    const key = "neighborhood-house-occlusion";
    const source = scene.textures.get("map-source-neighborhood").getSourceImage() as HTMLImageElement;
    if (!scene.textures.exists(key)) {
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(80 * source.width / 300);
        canvas.height = Math.ceil(164 * source.height / 240);
        const ctx = canvas.getContext("2d")!;
        const polygon = [[0, 57], [55.6, 26.3], [80, 60.8], [79.7, 65], [75.7, 67],
            [75.7, 124.3], [43, 143], [47.3, 155], [32, 164], [0, 150]];
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
        .setDisplaySize(texture.width * 640 / source.width, texture.height * 512 / source.height)
        .setDepth(164 * 512 / 240).setVisible(false)];
}
