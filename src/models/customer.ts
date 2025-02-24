export class Customer extends Phaser.Events.EventEmitter {
    private _characterIndex: number;
    private _patience: number; // TODO: 얼마나 기다려주는지 확인하고 범위를 정해야 할듯.

    // 아예 비싸면 줄에 서지 않음
    // 줄에 서있으면 patience가 줄어듬
    // patience가 0이 되면 줄에서 나감

    constructor(characterIndex: number, patience: number) {
        super();
        this._characterIndex = characterIndex;
        this._patience = patience;
    }

    getCharacterIndex = (): number => {
        return this._characterIndex;
    };

    getPatience = (): number => {
        return this._patience;
    };

    setCharacterIndex = (value: number) => {
        this._characterIndex = value;
        this.emit("change", this._characterIndex);
    };

    setPatience = (value: number) => {
        this._patience = value;
        this.emit("change", this._patience);
    };
}
