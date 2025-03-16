export class Review {
    private characterIndex: number;
    private text: string;
    private star: number;

    constructor(characterIndex: number, text: string, star: number) {
        this.characterIndex = characterIndex;
        this.text = text;
        this.star = star;
    }

    getCharacterIndex() {
        return this.characterIndex;
    }

    getText() {
        return this.text;
    }

    setText(text: string) {
        this.text = text;
    }

    getStar() {
        return this.star;
    }

    setStar(star: number) {
        this.star = star;
    }
}

export default class Reviews extends Phaser.Events.EventEmitter {
    private _reviews: Review[];

    constructor() {
        super();
        this._reviews = [];
    }

    get reviews() {
        return this._reviews;
    }

    addReview(review: Review) {
        this._reviews.push(review);
        this.emit("reviewAdded", review);
    }

    getLatestReview(): Review | undefined {
        return this.reviews.length > 0 ? this._reviews[this._reviews.length - 1] : undefined;
    }
}
