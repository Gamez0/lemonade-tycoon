export class Customer extends Phaser.Events.EventEmitter {
    private _character: Phaser.GameObjects.Sprite;
    private _patience: number; // TODO: 얼마나 기다려주는지 확인하고 범위를 정해야 할듯.

    // 아예 비싸면 줄에 서지 않음
    // 줄에 서있으면 patience가 줄어듬
    // patience가 0이 되면 줄에서 나감

    constructor(character: Phaser.GameObjects.Sprite, patience: number) {
        super();
        this._character = character;
        this._patience = patience;
    }

    getCharacter = (): Phaser.GameObjects.Sprite => {
        return this._character;
    };

    getPatience = (): number => {
        return this._patience;
    };

    setPatience = (value: number) => {
        this._patience = value;
        this.emit("change", this._patience);
    };

    setCharacter = (value: Phaser.GameObjects.Sprite) => {
        this._character = value;
        this.emit("change", this._character);
    };
}
