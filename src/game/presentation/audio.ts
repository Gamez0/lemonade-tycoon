import { AUDIO_SCORES, AUDIO_STEP_SECONDS } from "../content/audio-scores";
export interface AudioSettings { music: number; effects: number; muted: boolean }
const KEY = "willow-lane.audio.v1";
export class GameAudio {
    settings: AudioSettings = { music: 0.25, effects: 0.35, muted: false };
    private context: AudioContext | null = null;
    private timer = 0;
    private lastEffect = 0;
    private note = 0;
    private phase = "preparation";
    private unlocked = false;
    constructor() {
        try {
            const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "null");
            if (value && typeof value === "object") {
                const s = value as AudioSettings;
                if ([s.music, s.effects].every(n => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1) && typeof s.muted === "boolean") this.settings = s;
            }
        } catch { /* Audio preferences never block the game. */ }
        document.addEventListener("visibilitychange", () => this.sync());
        window.addEventListener("blur", () => this.stop());
        window.addEventListener("focus", () => this.sync());
    }
    activate(): void {
        if (this.unlocked && this.context?.state === "running") return;
        this.unlocked = true;
        try {
            this.context ??= new AudioContext();
            void this.context.resume().then(() => this.sync()).catch(() => {});
        } catch { /* Unsupported sound leaves gameplay available. */ }
    }
    configure(settings: AudioSettings): void {
        this.settings = settings;
        try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* Session settings still work. */ }
        this.sync();
    }
    setPhase(phase: string): void {
        if (phase === this.phase) return;
        this.phase = phase; this.note = 0; this.stop(); this.sync();
    }
    private stop(): void { window.clearInterval(this.timer); this.timer = 0; }
    private sync(): void {
        this.stop();
        if (!this.unlocked || !this.context || this.settings.muted || document.hidden || !document.hasFocus()) return;
        // A focus return can follow a browser/device suspension. Restart the
        // context before scheduling notes; merely restarting the timer stays silent.
        if (this.context.state !== "running") {
            if (this.context.state === "closed") return;
            void this.context.resume().then(() => {
                if (this.context?.state === "running") this.sync();
            }).catch(() => { /* A later user gesture can retry without blocking play. */ });
            return;
        }
        // Original pentatonic miniatures: a slow porch tune, a brisk market tune,
        // and a short settling cadence. Timing is independent of simulation speed.
        this.timer = window.setInterval(() => {
            const score = AUDIO_SCORES[this.phase] ?? AUDIO_SCORES.preparation;
            const midi = score[this.note++ % score.length];
            if (midi) this.tone(440 * 2 ** ((midi - 69) / 12), this.settings.music * 0.12, 0.32, "triangle");
        }, (AUDIO_STEP_SECONDS[this.phase] ?? .48) * 1000);
    }
    effect(kind: "buy" | "sale" | "error" | "button"): void {
        if (this.settings.muted || document.hidden || !document.hasFocus() || performance.now() - this.lastEffect < 130) return;
        this.lastEffect = performance.now();
        this.tone({ buy: 660, sale: 880, error: 180, button: 440 }[kind], this.settings.effects * 0.08, 0.1, "sine");
    }
    private tone(frequency: number, volume: number, duration: number, type: "triangle" | "sine"): void {
        const context = this.context;
        if (!context || context.state !== "running" || volume === 0) return;
        const oscillator = context.createOscillator(), gain = context.createGain();
        const now = context.currentTime;
        oscillator.type = type; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.start(now); oscillator.stop(now + duration + 0.02);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    }
}
