import { drawVisitor, settleVisitor } from "./game";
import type { CustomerEvent, State, Visitor } from "./game";

export interface StreetRules {
    readonly arrivalEvery: number;
    readonly serviceTicks: number;
    readonly patienceTicks: number;
}
export interface WaitingVisitor {
    readonly visitor: Visitor;
    readonly joinedAt: number;
}
export interface Service {
    readonly visitor: Visitor;
    readonly doneAt: number;
}
export interface WalkingVisitor {
    readonly visitor: Visitor;
    readonly kind: CustomerEvent["kind"];
    readonly startedAt: number;
    readonly until: number;
}
export interface StreetDay {
    readonly game: State;
    readonly tick: number;
    readonly arrived: number;
    readonly waiting: readonly WaitingVisitor[];
    readonly serving: Service | null;
    readonly walking: readonly WalkingVisitor[];
    readonly rules: StreetRules;
}

export const DEFAULT_STREET_RULES: StreetRules = { arrivalEvery: 5, serviceTicks: 8, patienceTicks: 18 };

export function beginStreetDay(game: State, rules: StreetRules = DEFAULT_STREET_RULES): StreetDay {
    if (game.phase !== "selling") throw new Error("Open the stand before starting the street.");
    if ([rules.arrivalEvery, rules.serviceTicks, rules.patienceTicks].some(n => !Number.isSafeInteger(n) || n < 1))
        throw new Error("Street timing must use positive whole ticks.");
    return { game, tick: 0, arrived: 0, waiting: [], serving: null, walking: [], rules };
}

/** One fixed 100 ms business tick. Rendering and animation never change its decisions. */
export function tickStreet(day: StreetDay): { day: StreetDay; events: CustomerEvent[] } {
    const tick = day.tick + 1;
    let game = day.game;
    let arrived = day.arrived;
    let waiting = [...day.waiting];
    let serving = day.serving;
    const walking = day.walking.filter(person => person.until > tick);
    const events: CustomerEvent[] = [];
    const settle = (visitor: Visitor, outcome?: "abandoned") => {
        const result = settleVisitor(game, visitor, outcome);
        game = result.state;
        events.push(result.event);
        walking.push({ visitor, kind: result.event.kind, startedAt: tick, until: tick + 22 });
    };

    if (game.phase === "selling") {
        if (arrived < game.weather.traffic && (tick - 1) % day.rules.arrivalEvery === 0) {
            const draw = drawVisitor(game, arrived + 1);
            game = draw.state;
            arrived++;
            if (draw.visitor.intent === "buy") waiting.push({ visitor: draw.visitor, joinedAt: tick });
            else settle(draw.visitor);
        }
        const patient: WaitingVisitor[] = [];
        for (const person of waiting) {
            if (tick - person.joinedAt >= day.rules.patienceTicks) settle(person.visitor, "abandoned");
            else patient.push(person);
        }
        waiting = patient;
        if (serving && tick >= serving.doneAt) {
            settle(serving.visitor);
            serving = null;
        }
        if (!serving && waiting.length && game.phase === "selling") {
            const first = waiting.shift()!;
            serving = { visitor: first.visitor, doneAt: tick + day.rules.serviceTicks };
        }
    }
    return { day: { ...day, game, tick, arrived, waiting, serving, walking }, events };
}

export function finishStreetDay(day: StreetDay): { day: StreetDay; events: CustomerEvent[] } {
    const events: CustomerEvent[] = [];
    let current = day;
    // Bounded by traffic and rule durations; this guard catches a broken close condition.
    const limit = (day.game.weather.traffic + 1) * (day.rules.arrivalEvery + day.rules.serviceTicks + day.rules.patienceTicks + 8);
    for (let i = 0; i < limit && current.game.phase === "selling"; i++) {
        const next = tickStreet(current);
        current = next.day;
        events.push(...next.events);
    }
    if (current.game.phase !== "results") throw new Error("The street day did not finish.");
    return { day: { ...current, walking: [] }, events };
}
