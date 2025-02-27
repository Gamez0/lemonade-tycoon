import { Customer } from "./customer";

export default class CustomerQueue extends Phaser.Events.EventEmitter {
    private _queue: Customer[];
    private _maxQueueLength: number;

    constructor(maxQueueLength: number = 5) {
        super();
        this._queue = [];
        this._maxQueueLength = maxQueueLength;
    }

    get queue() {
        return this._queue;
    }

    get maxQueueLength() {
        return this._maxQueueLength;
    }

    get length() {
        return this._queue.length;
    }

    enqueue(customer: Customer) {
        if (this._queue.length < this._maxQueueLength) {
            this._queue.push(customer);
            this.emit("change", this._queue);
        }
    }

    dequeue() {
        if (this._queue.length > 0) {
            this._queue.shift();
            this.emit("change", this._queue);
        }
    }

    [Symbol.iterator]() {
        return this._queue[Symbol.iterator]();
    }

    map(callbackfn: (value: Customer, index: number, array: Customer[]) => unknown) {
        return this._queue.map(callbackfn);
    }

    forEach(callbackfn: (value: Customer, index: number, array: Customer[]) => void) {
        this._queue.forEach(callbackfn);
    }
}
