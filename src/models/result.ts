export default class Result extends Phaser.Events.EventEmitter {
    private profit: number;
    private cupsSold: number;

    constructor(profit: number, cupsSold: number) {
        super();
        this.profit = profit;
        this.cupsSold = cupsSold;
    }

    getProfit() {
        return this.profit;
    }

    setProfit(profit: number) {
        this.profit = profit;
        this.emit("profitChanged", this.profit);
    }

    addProfit(profit: number) {
        this.profit += profit;
        this.emit("profitChanged", this.profit);
    }

    getCupsSold() {
        return this.cupsSold;
    }

    setCupsSold(cupsSold: number) {
        this.cupsSold = cupsSold;
        this.emit("cupsSoldChanged", this.cupsSold);
    }

    addCupsSold(cupsSold: number) {
        this.cupsSold += cupsSold;
        this.emit("cupsSoldChanged", this.cupsSold);
    }

    increaseCupsSold() {
        this.cupsSold++;
        this.emit("cupsSoldChanged", this.cupsSold);
    }
}
