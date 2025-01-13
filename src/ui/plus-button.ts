import { TextButton } from "./text-button";

export class PlusButton extends TextButton {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, '+', { fontSize: '24px' });
    }
}