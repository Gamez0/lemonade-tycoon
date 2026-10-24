import Phaser from "phaser";
import { createArt } from "./art";
import type { StreetDay, WalkingVisitor } from "../simulation/street-day";
import type { State } from "../simulation/game";
import { LOCATIONS, LOCATION_IDS } from "../content/locations";
import type { LocationId } from "../content/locations";
import { tasteReaction } from "./taste-feedback";
import { MAP_ASSETS } from "./map-assets";
import { mapThumbnail } from "./map-raster";
import { MAP_LAYOUTS, mapPosition, queueProgress, moveQueueProgress, queueDistance, departureDistance } from "../content/map-layouts";
import { createStandArt, standSize, standFlip, STAND_ASSETS } from "./stand-art";
import { STAND_NAMES } from "../content/management";
import { customerAppearance, routeFacing, vectorFacing, type CustomerFacing, type CustomerAction } from "../content/customer-facing";
import { CUSTOMER_METRICS, customerTexture } from "./customer-art";
import { createMapOcclusion } from "./map-occlusion";

interface StreetHooks {
    state: () => State;
    street: () => StreetDay | null;
    tick: () => void;
    changed: () => void;
    paused?: () => boolean;
}

export class StreetScene extends Phaser.Scene {
    private hooks: StreetHooks;
    private people = new Map<number, Phaser.GameObjects.Sprite>();
    private facings = new Map<number, CustomerFacing>();
    private queueFeet = new Map<number, { progress: number; tick: number }>();
    private exits = new Map<number, { from: number; lead?: number; purpose: "service" | "through" | "depart" }>();
    private bubbles = new Map<number, Phaser.GameObjects.Text>();
    private sky?: Phaser.GameObjects.Rectangle;
    private background?: Phaser.GameObjects.Image;
    private occlusion: Phaser.GameObjects.Image[] = [];
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
        this.occlusion = createMapOcclusion(this);
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
        this.facings.clear();
        this.queueFeet.clear();
        this.exits.clear();
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

    private drawPeople(day: StreetDay, tickFraction = 0): void {
        const peopleScale = CUSTOMER_METRICS.scale;
        const visible = new Set<number>();
        const show = (id: number, profile: number, action: CustomerAction, position: number,
            label?: string, facingStand = false, purpose: "service" | "through" | "depart" = "service",
            travel: 1 | -1 = 1) => {
            const [logicalX, logicalY] = mapPosition(this.hooks.state().location, position,
                purpose);
            const x = logicalX * 640 / 300, y = logicalY * 512 / 240;
            const location = this.hooks.state().location;
            const previous = this.facings.get(id);
            const ground = MAP_LAYOUTS[location].ground;
            const facing = facingStand ? vectorFacing(ground[0] - logicalX, ground[1] - logicalY, previous) :
                routeFacing(location, position, purpose, travel, previous);
            this.facings.set(id, facing);
            const appearance = customerAppearance(facing, action, (day.tick + tickFraction) * .8 + id, this.motion.matches);
            visible.add(id);
            let sprite = this.people.get(id);
            if (!sprite) {
                sprite = this.add.sprite(x, y, customerTexture(profile, appearance.pose))
                    .setOrigin(CUSTOMER_METRICS.originX, CUSTOMER_METRICS.originY);
                this.people.set(id, sprite);
            }
            sprite.setPosition(Math.round(x), Math.round(y)).setTexture(customerTexture(profile, appearance.pose))
                .setScale(peopleScale).setFlipX(appearance.flipX).setDepth(y);
            let bubble = this.bubbles.get(id);
            if (label) {
                if (!bubble) {
                    bubble = this.add.text(x, y - CUSTOMER_METRICS.labelOffset, label, {
                        fontFamily: "monospace", fontSize: "20px", color: "#284a3c",
                        backgroundColor: "#fff8df", padding: { x: 6, y: 2 },
                    }).setOrigin(0.5).setDepth(y + 40);
                    this.bubbles.set(id, bubble);
                }
                bubble.setText(label).setPosition(x, y - CUSTOMER_METRICS.labelOffset).setDepth(y + 40).setVisible(true);
            } else bubble?.setVisible(false);
        };
        const now = day.tick + tickFraction;
        const queueFoot = (id: number, target: number, initial: number): number => {
            const last = this.queueFeet.get(id) ?? { progress: initial, tick: now };
            const progress = this.motion.matches ? target : moveQueueProgress(this.hooks.state().location,
                last.progress, target, Math.max(0, now - last.tick) * 4);
            this.queueFeet.set(id, { progress, tick: now });
            return progress;
        };
        if (day.serving) {
            const { visitor } = day.serving;
            const at = queueFoot(visitor.id, 286, 286);
            const moving = Math.abs(at - 286) > .01;
            show(visitor.id, visitor.profile, moving ? "walk" : "order", at,
                undefined, !moving, "service", -1);
        }
        day.waiting.forEach((person, index) => {
            const target = queueProgress(this.hooks.state().location, index);
            const at = queueFoot(person.visitor.id, target, queueProgress(this.hooks.state().location, index + 1));
            const moving = Math.abs(at - target) > .01;
            show(person.visitor.id, person.visitor.profile, moving ? "walk" : "idle",
                at, undefined, !moving, "service", -1);
        });
        for (const person of day.walking) {
            const progress = this.motion.matches ? .55 : Math.max(0, Math.min(1, (now - person.startedAt) / (person.until - person.startedAt)));
            const id = person.visitor.id;
            const location = this.hooks.state().location;
            let exit = this.exits.get(id);
            if (!exit) {
                const queued = this.queueFeet.get(id);
                exit = person.kind === "bought" ? { from: 286, lead: queued?.progress, purpose: "depart" } :
                    queued ? { from: queued.progress, purpose: "service" } : { from: -20, purpose: "through" };
                this.exits.set(id, exit);
            }
            let at = exit.from + (680 - exit.from) * progress;
            let purpose = exit.purpose, travel: 1 | -1 = 1;
            if (exit.lead !== undefined && exit.lead > 286) {
                const lead = queueDistance(location, exit.lead, 286), length = departureDistance(location);
                const distance = progress * (lead + length);
                if (distance < lead) { at = moveQueueProgress(location, exit.lead, 286, distance); purpose = "service"; travel = -1; }
                else at = 286 + 394 * (distance - lead) / length;
            }
            const approachingCounter = purpose === "service" && exit.purpose === "depart";
            show(id, person.visitor.profile, person.kind === "bought" && !approachingCounter ? "cup" : "walk", at,
                progress < .65 && person.kind !== "passed" && !approachingCounter ? this.reaction(person) : undefined,
                false, purpose, travel);
        }
        for (const [id, sprite] of this.people) if (!visible.has(id)) {
            sprite.destroy();
            this.people.delete(id);
            this.facings.delete(id);
            this.queueFeet.delete(id);
            this.exits.delete(id);
            this.bubbles.get(id)?.destroy();
            this.bubbles.delete(id);
        }
    }

    update(_time: number, delta: number): void {
        if (this.hooks.paused?.()) {
            this.game.loop.sleep();
            return;
        }
        const state = this.hooks.state();
        for (const image of this.occlusion) image.setVisible(state.location === "neighborhood");
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
        this.sky?.setAlpha(state.location === "mall" ? 0 : state.weather.label === "Rainy" ? 0.19 : state.weather.label === "Cloudy" ? 0.08 : 0);
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
        // Render between the unchanged100ms business ticks at the existing20fps
        // ceiling. Preparation/results still sleep and do not animate.
        const current = this.hooks.street();
        if (current) this.drawPeople(current, this.elapsed / 100);
        if (changed) this.hooks.changed();
    }
}
