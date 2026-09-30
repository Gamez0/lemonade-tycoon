import Phaser from "phaser";
import { CART, createArt, STREET } from "./art";
import type { StreetDay, WalkingVisitor } from "../simulation/street-day";
import type { State } from "../simulation/game";

interface StreetHooks {
    state: () => State;
    street: () => StreetDay | null;
    tick: () => void;
    changed: () => void;
}

export class StreetScene extends Phaser.Scene {
    private hooks: StreetHooks;
    private people = new Map<number, Phaser.GameObjects.Sprite>();
    private bubbles = new Map<number, Phaser.GameObjects.Text>();
    private sign?: Phaser.GameObjects.Text;
    private sky?: Phaser.GameObjects.Rectangle;
    private elapsed = 0;
    private speed = 1;

    get finishing(): boolean {
        return (this.hooks.street()?.walking.length ?? 0) > 0;
    }

    constructor(hooks: StreetHooks) {
        super("Neighborhood");
        this.hooks = hooks;
    }

    create(): void {
        createArt(this);
        this.add.image(0, 0, "neighborhood").setOrigin(0);
        this.add.image(CART.x, CART.y, "stand").setOrigin(0).setScale(0.8);
        this.sign = this.add.text(CART.x + 23, CART.y + 53, "FRESH", {
            fontFamily: "monospace", fontSize: "7px", color: "#574b31", backgroundColor: "#fff0bd",
        }).setOrigin(0.5);
        this.sky = this.add.rectangle(0, 0, 640, 512, 0x536b83, 0).setOrigin(0).setDepth(1000);
        this.game.canvas.setAttribute("aria-label", "A lemonade stand on Willow Lane. Several people can walk, wait in line, buy, or leave.");
        this.game.canvas.setAttribute("role", "img");
        this.hooks.changed();
    }

    setSpeed(speed: number): void { this.speed = speed; }

    resetDay(): void {
        this.elapsed = 0;
        for (const person of this.people.values()) person.destroy();
        for (const bubble of this.bubbles.values()) bubble.destroy();
        this.people.clear();
        this.bubbles.clear();
    }

    private reaction(person: WalkingVisitor): string {
        switch (person.kind) {
            case "bought": return ":)";
            case "price": return "$";
            case "sold-out": return "!";
            case "abandoned": return "...";
            default: return "";
        }
    }

    private drawPeople(day: StreetDay): void {
        const visible = new Set<number>();
        const show = (id: number, profile: number, pose: number, x: number, y: number,
            label?: string, facingStand = false) => {
            visible.add(id);
            let sprite = this.people.get(id);
            if (!sprite) {
                sprite = this.add.sprite(x, y, `customer-${profile}-${pose}`).setOrigin(0.5, 1);
                this.people.set(id, sprite);
            }
            sprite.setPosition(Math.round(x), Math.round(y)).setTexture(`customer-${profile}-${pose}`)
                .setFlipX(facingStand).setDepth(y);
            let bubble = this.bubbles.get(id);
            if (label) {
                if (!bubble) {
                    bubble = this.add.text(x, y - 48, label, {
                        fontFamily: "monospace", fontSize: "20px", color: "#284a3c",
                        backgroundColor: "#fff8df", padding: { x: 6, y: 2 },
                    }).setOrigin(0.5).setDepth(y + 40);
                    this.bubbles.set(id, bubble);
                }
                bubble.setText(label).setPosition(x, y - 48).setVisible(true);
            } else bubble?.setVisible(false);
        };
        if (day.serving) {
            const { visitor } = day.serving;
            show(visitor.id, visitor.profile, 0, STREET.stopX + 19, STREET.pavementY(STREET.stopX + 19),
                undefined, true);
        }
        day.waiting.forEach((person, index) => {
            const target = STREET.stopX + 48 + index * 23;
            const progress = Math.min(1, (day.tick - person.joinedAt) / 4);
            const x = -20 + (target + 20) * progress;
            show(person.visitor.id, person.visitor.profile, progress < 1 ? day.tick % 2 : 0,
                x, STREET.pavementY(x), undefined, progress >= 1);
        });
        for (const person of day.walking) {
            const progress = (day.tick - person.startedAt) / (person.until - person.startedAt);
            const from = person.kind === "passed" || person.kind === "price" ? -20 : STREET.stopX + 19;
            const x = from + (680 - from) * progress;
            show(person.visitor.id, person.visitor.profile,
                person.kind === "bought" ? 3 : day.tick % 2, x, STREET.pavementY(x),
                progress < 0.65 && person.kind !== "passed" ? this.reaction(person) : undefined);
        }
        for (const [id, sprite] of this.people) if (!visible.has(id)) {
            sprite.destroy();
            this.people.delete(id);
            this.bubbles.get(id)?.destroy();
            this.bubbles.delete(id);
        }
    }

    update(_time: number, delta: number): void {
        const state = this.hooks.state();
        this.sky?.setAlpha(state.weather.label === "Rainy" ? 0.19 : state.weather.label === "Cloudy" ? 0.08 : 0);
        this.sign?.setText(state.phase === "selling" ? "OPEN" : "FRESH");
        const street = this.hooks.street();
        if (!street || (street.game.phase !== "selling" && street.walking.length === 0)) return;
        this.elapsed += Math.min(delta, 100) * this.speed;
        let changed = false;
        while (this.elapsed >= 100) {
            this.elapsed -= 100;
            this.hooks.tick();
            changed = true;
        }
        if (changed) {
            this.drawPeople(this.hooks.street()!);
            this.hooks.changed();
        }
    }
}
