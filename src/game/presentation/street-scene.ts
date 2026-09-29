import Phaser from "phaser";
import { createArt } from "./art";
import type { CustomerEvent, State } from "../simulation/game";

interface StreetHooks {
    state: () => State;
    profile: () => number;
    arrive: () => CustomerEvent;
    changed: () => void;
}

export class StreetScene extends Phaser.Scene {
    private hooks: StreetHooks;
    private walker?: Phaser.GameObjects.Sprite;
    private bubble?: Phaser.GameObjects.Text;
    private sign?: Phaser.GameObjects.Text;
    private elapsed = 0;
    private resolved = false;
    private event?: CustomerEvent;
    private speed = 1;
    private sky?: Phaser.GameObjects.Rectangle;
    private profile?: number;

    get finishing(): boolean {
        return this.resolved;
    }

    constructor(hooks: StreetHooks) {
        super("Neighborhood");
        this.hooks = hooks;
    }

    create(): void {
        createArt(this);
        this.add.image(0, 0, "neighborhood").setOrigin(0).setScale(2);
        this.add.image(332, 158, "stand").setOrigin(0).setScale(2);
        this.sign = this.add
            .text(390, 202, "FRESH", {
                fontFamily: "monospace",
                fontSize: "10px",
                color: "#574b31",
                backgroundColor: "#fff0bd",
            })
            .setOrigin(0.5);
        this.add.text(20, 18, "WILLOW LANE", {
            fontFamily: "monospace",
            fontSize: "12px",
            color: "#456548",
            backgroundColor: "#edf0cb",
            padding: { x: 8, y: 5 },
        });
        this.sky = this.add.rectangle(0, 0, 640, 440, 0x536b83, 0).setOrigin(0);
        this.walker = this.add.sprite(-30, 306, "customer-0-0").setScale(2).setVisible(false);
        this.bubble = this.add
            .text(390, 269, "", {
                fontFamily: "sans-serif",
                fontSize: "14px",
                color: "#284a3c",
                backgroundColor: "#fff8df",
                padding: { x: 8, y: 5 },
            })
            .setOrigin(0.5)
            .setVisible(false);
        this.game.canvas.setAttribute(
            "aria-label",
            "A lemonade stand on Willow Lane. Customers walk, stop to buy, and carry a drink away.",
        );
        this.game.canvas.setAttribute("role", "img");
        this.hooks.changed();
    }

    setSpeed(speed: number): void {
        this.speed = speed;
    }
    resetDay(): void {
        this.elapsed = 0;
        this.resolved = false;
        this.event = undefined;
        this.profile = undefined;
        this.walker?.setVisible(false);
        this.bubble?.setVisible(false);
    }
    update(_time: number, delta: number): void {
        const s = this.hooks.state();
        this.sky?.setAlpha(s.weather.label === "Rainy" ? 0.19 : s.weather.label === "Cloudy" ? 0.08 : 0);
        this.sign?.setText(s.phase === "selling" ? "OPEN" : "FRESH");
        if (s.phase !== "selling" && !this.resolved) return;
        this.profile ??= this.hooks.profile();
        // A bounded accumulator avoids a tab-resume burst; no wall-clock time enters rules.
        this.elapsed += Math.min(delta, 100) * this.speed;
        if (this.elapsed >= 800 && !this.resolved && s.phase === "selling") {
            this.event = this.hooks.arrive();
            this.resolved = true;
            this.hooks.changed();
        }
        if (this.elapsed >= 1600) {
            this.elapsed -= 1600;
            this.resolved = false;
            this.event = undefined;
            this.profile = undefined;
            if (this.hooks.state().phase !== "selling") {
                this.resetDay();
                this.hooks.changed();
                return;
            }
            this.profile = this.hooks.profile();
        }
        const profile = this.profile;
        const waiting = this.elapsed >= 800 && this.elapsed < 1100;
        const bought = this.event?.kind === "bought";
        const pose = waiting ? 2 : bought && this.elapsed >= 1100 ? 3 : Math.floor(this.elapsed / 120) % 2;
        const x =
            this.elapsed < 800
                ? -20 + (this.elapsed / 800) * 410
                : this.elapsed < 1100
                  ? 390
                  : 390 + ((this.elapsed - 1100) / 500) * 280;
        this.walker?.setVisible(true).setPosition(Math.round(x), 292).setTexture(`customer-${profile}-${pose}`);
        const label =
            this.event?.kind === "bought"
                ? "One lemonade!"
                : this.event?.kind === "price"
                  ? "Too pricey"
                  : this.event?.kind === "sold-out"
                    ? "Sold out?"
                    : "Maybe later";
        this.bubble?.setText(label).setVisible(waiting);
    }
}
