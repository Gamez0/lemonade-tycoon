import { TextButton } from "./text-button";

export class MinusButton extends TextButton {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, '-', { fontSize: '24px' });
    }
}