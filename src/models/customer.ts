export class Customer extends Phaser.Events.EventEmitter {
    private _character: Phaser.GameObjects.Sprite;
    private _paitence: number;

    // 아예 비싸면 줄에 서지 않음
    // 줄에 서있으면 patience가 줄어듬
    // patience가 0이 되면 줄에서 나감

    constructor(character: Phaser.GameObjects.Sprite, paitence: number) {
        super();
        this._character = character;
        this._paitence = paitence;
    }

    getCharacter = (): Phaser.GameObjects.Sprite => {
        return this._character;
    };

    getPaitence = (): number => {
        return this._paitence;
    };

    setPaitence = (value: number) => {
        this._paitence = value;
        this.emit("change", this._paitence);
    };

    setCharacter = (value: Phaser.GameObjects.Sprite) => {
        this._character = value;
        this.emit("change", this._character);
    };
}
