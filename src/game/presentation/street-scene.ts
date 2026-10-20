import Phaser from "phaser";
import { createArt } from "./art";
import type { StreetDay, WalkingVisitor } from "../simulation/street-day";
import type { State } from "../simulation/game";
import { LOCATIONS, LOCATION_IDS } from "../content/locations";
import type { LocationId } from "../content/locations";
import { tasteReaction } from "./taste-feedback";
import { MAP_ASSETS } from "./map-assets";
import { mapThumbnail } from "./map-raster";
import { MAP_LAYOUTS, mapPosition, queueProgress } from "../content/map-layouts";
import { createStandArt, standSize, standFlip, STAND_ASSETS } from "./stand-art";
import { STAND_NAMES } from "../content/management";

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
    private sky?: Phaser.GameObjects.Rectangle;
    private background?: Phaser.GameObjects.Image;
    private cart?: Phaser.GameObjects.Image;
    private previews = new Map<LocationId, string>();
    private elapsed = 0;
    private speed = 1;
    private resize?: ResizeObserver;
    private motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    get finishing(): boolean {
        return (this.hooks.street()?.walking.length ?? 0) > 0;
    }

    constructor(hooks: StreetHooks) {
        super("Neighborhood");
        this.hooks = hooks;
    }

    preload(): void {
        for (const [key, url] of Object.entries(STAND_ASSETS)) this.load.image(key, url);
        for (const id of LOCATION_IDS) this.load.image(`map-source-${id}`, MAP_ASSETS[id]);
    }

    create(): void {
        this.cameras.main.setZoom(2).centerOn(320, 256);
        createArt(this);
        createStandArt(this);
        this.background = this.add.image(0, 0, this.hooks.state().location).setOrigin(0).setDisplaySize(640, 512);
        for (const id of LOCATION_IDS) {
            const source = this.textures.get(id).getSourceImage();
            const preview = mapThumbnail(source as HTMLImageElement);
            this.previews.set(id, preview.toDataURL());
            // The thumbnail string is enough; do not retain ten duplicate bitmaps.
            preview.width = 1; preview.height = 1;
        }
        const [x, y] = MAP_LAYOUTS[this.hooks.state().location].ground;
        this.cart = this.add.image(x * 640 / 300, y * 512 / 240, "stand-0").setOrigin(0.5, 1);
        this.sky = this.add.rectangle(0, 0, 640, 512, 0x536b83, 0).setOrigin(0).setDepth(1000);
        this.game.canvas.setAttribute("aria-label", "A lemonade stand on Willow Lane. Several people can walk, wait in line, buy, or leave.");
        this.game.canvas.setAttribute("role", "img");
        this.resize = new ResizeObserver(() => this.refresh());
        this.resize.observe(this.game.canvas.parentElement!);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.resize?.disconnect());
        this.hooks.changed();
    }

    // Static frames stay on the canvas; resume only when state or size changes.
    refresh(): void { if (this.game?.loop.started) this.game.loop.wake(); }

    setSpeed(speed: number): void { this.speed = speed; }
    thumbnail(id: LocationId): string | null { return this.previews.get(id) ?? null; }

    resetDay(): void {
        this.elapsed = 0;
        for (const person of this.people.values()) person.destroy();
        for (const bubble of this.bubbles.values()) bubble.destroy();
        this.people.clear();
        this.bubbles.clear();
    }

    private reaction(person: WalkingVisitor): string {
        switch (person.kind) {
            case "bought": return tasteReaction(person.tasteComplaints, person.satisfaction);
            case "price": return "$";
            case "sold-out": return "!";
            case "abandoned": return "...";
            default: return "";
        }
    }

    private drawPeople(day: StreetDay): void {
        const streetLayout = { stopX: 267 };
        const peopleScale = 1.4;
        const visible = new Set<number>();
        const show = (id: number, profile: number, pose: number, position: number,
            label?: string, facingStand = false, purpose: "service" | "through" | "depart" = "service") => {
            const [logicalX, logicalY] = mapPosition(this.hooks.state().location, position,
                purpose);
            const x = logicalX * 640 / 300, y = logicalY * 512 / 240;
            visible.add(id);
            let sprite = this.people.get(id);
            if (!sprite) {
                sprite = this.add.sprite(x, y, `customer-${profile}-${pose}`).setOrigin(0.5, 1);
                this.people.set(id, sprite);
            }
            sprite.setPosition(Math.round(x), Math.round(y)).setTexture(`customer-${profile}-${this.motion.matches ? 0 : pose}`)
                .setScale(peopleScale).setFlipX(facingStand && logicalX > MAP_LAYOUTS[this.hooks.state().location].ground[0]).setDepth(y);
            let bubble = this.bubbles.get(id);
            if (label) {
                if (!bubble) {
                    bubble = this.add.text(x, y - 48, label, {
                        fontFamily: "monospace", fontSize: "20px", color: "#284a3c",
                        backgroundColor: "#fff8df", padding: { x: 6, y: 2 },
                    }).setOrigin(0.5).setDepth(y + 40);
                    this.bubbles.set(id, bubble);
                }
                bubble.setText(label).setPosition(x, y - (peopleScale > 1 ? 64 : 48)).setVisible(true);
            } else bubble?.setVisible(false);
        };
        if (day.serving) {
            const { visitor } = day.serving;
            show(visitor.id, visitor.profile, 0, streetLayout.stopX + 19,
                undefined, true);
        }
        day.waiting.forEach((person, index) => {
            const target = queueProgress(this.hooks.state().location, index);
            const progress = this.motion.matches ? 1 : Math.min(1, (day.tick - person.joinedAt) / 3);
            const from = Math.max(660, target + 90);
            const x = from + (target - from) * progress;
            show(person.visitor.id, person.visitor.profile, progress < 1 ? day.tick % 2 : 0,
                x, undefined, progress >= 1);
        });
        for (const person of day.walking) {
            const progress = this.motion.matches ? 0.55 : (day.tick - person.startedAt) / (person.until - person.startedAt);
            const from = person.kind === "passed" || person.kind === "price" ? -20 : streetLayout.stopX + 19;
            const x = from + (680 - from) * progress;
            show(person.visitor.id, person.visitor.profile,
                person.kind === "bought" ? 3 : day.tick % 2, x,
                progress < 0.65 && person.kind !== "passed" ? this.reaction(person) : undefined,
                false, person.kind === "passed" || person.kind === "price" ? "through" : "depart");
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
        const ground = MAP_LAYOUTS[state.location].ground;
        const x = ground[0] * 640 / 300, y = ground[1] * 512 / 240;
        const level = state.management.upgrades.stand, size = standSize(level);
        const flip = standFlip(MAP_LAYOUTS[state.location].facing);
        this.cart?.setTexture(`stand-${level}`).setDisplaySize(size.width, size.height)
            .setOrigin(flip ? 1 - size.originX : size.originX, size.originY)
            .setFlipX(flip).setPosition(x, y).setDepth(y);
        this.game.canvas.setAttribute("data-stand-level", String(level));
        this.game.canvas.setAttribute("data-stand-texture", this.cart?.texture.key ?? "");
        this.game.canvas.setAttribute("data-stand-name", STAND_NAMES[level]);
        this.game.canvas.setAttribute("data-stand-facing", MAP_LAYOUTS[state.location].facing);
        this.game.canvas.setAttribute("data-map-source-width", String(this.textures.get(`map-source-${state.location}`).getSourceImage().width));
        this.game.canvas.setAttribute("data-map-texture-width", String(this.textures.get(state.location).getSourceImage().width));
        this.game.canvas.setAttribute("aria-label", `${STAND_NAMES[level]} at ${LOCATIONS[state.location].street}. People walk, queue, buy or leave.`);
        if (this.background?.texture.key !== state.location) {
            this.background?.setTexture(state.location).setDisplaySize(640, 512);
        }
        this.sky?.setAlpha(state.weather.label === "Rainy" ? 0.19 : state.weather.label === "Cloudy" ? 0.08 : 0);
        const street = this.hooks.street();
        if (!street || (street.game.phase !== "selling" && street.walking.length === 0)) {
            this.game.loop.sleep();
            return;
        }
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
