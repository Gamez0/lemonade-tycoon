export class Customer extends Phaser.Events.EventEmitter {
    private _character: Phaser.GameObjects.Sprite;
    private _patient: number;

    // 아예 비싸면 줄에 서지 않음
    // 줄에 서있으면 patience가 줄어듬
    // patience가 0이 되면 줄에서 나감

    constructor(character: Phaser.GameObjects.Sprite, patient: number) {
        super();
        this._character = character;
        this._patient = patient;
    }

    getCharacter = (): Phaser.GameObjects.Sprite => {
        return this._character;
    };

    getPatient = (): number => {
        return this._patient;
    };

    setPatient = (value: number) => {
        this._patient = value;
        this.emit("change", this._patient);
    };

    setCharacter = (value: Phaser.GameObjects.Sprite) => {
        this._character = value;
        this.emit("change", this._character);
    };
}
