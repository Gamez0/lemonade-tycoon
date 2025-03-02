export default class _Date extends Phaser.Events.EventEmitter {
    year: number;
    month: number;
    day: number;

    constructor(year: number, month: number, day: number) {
        super();
        this.year = year;
        this.month = month;
        this.day = day;
    }

    getYear = (): number => {
        return this.year;
    };

    getMonth = (): number => {
        return this.month;
    };

    getDay = (): number => {
        return this.day;
    };

    getDateString = (): string => {
        return `Year ${this.year} Month ${this.month} Day ${this.day}`;
    };

    getNextDay = (): _Date => {
        const date = new Date(this.year, this.month - 1, this.day);
        date.setDate(date.getDate() + 1);
        return new _Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
    };

    setYear = (value: number) => {
        this.year = value;
        this.emit("change", this.year);
    };

    setMonth = (value: number) => {
        this.month = value;
        this.emit("change", this.month);
    };

    setDay = (value: number) => {
        this.day = value;
        this.emit("change", this.day);
    };

    setDate = (year: number, month: number, day: number) => {
        this.setYear(year);
        this.setMonth(month);
        this.setDay(day);
    };

    setToNextDay = () => {
        const nextDay = this.getNextDay();
        this.setDate(nextDay.year, nextDay.month, nextDay.day);
    };
}
