export class ReceipeContainer extends Phaser.GameObjects.Container {
    private title: Phaser.GameObjects.Text;
    private description: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.title = scene.add.text(0, 0, 'Receipe', { fontSize: '24px' });
        this.description = scene.add.text(0, 25, 'Tweak your receipe according to the temperature, adding more ice when needed. Always keep a good balance between all ingredients.', { fontSize: '16px' });

        this.add([this.title, this.description]);
        scene.add.existing(this);
    }
}
