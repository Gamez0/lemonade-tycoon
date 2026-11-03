import { MusicPlayer } from "./music-player";
export interface AudioSettings { music: number; effects: number; muted: boolean }
const KEY = "willow-lane.audio.v1";
export class GameAudio {
    settings: AudioSettings = { music: 0.25, effects: 0.35, muted: false };
    private context: AudioContext | null = null;
    private music: MusicPlayer | null = null;
    private lastEffect = 0;
    private phase: "preparation" | "selling" = "preparation";
    private completionCue = false;
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
        window.addEventListener("blur", () => this.sync());
        window.addEventListener("focus", () => this.sync());
    }
    activate(): void {
        this.unlocked = true;
        if (!this.settings.muted && (this.settings.music > 0 || this.settings.effects > 0)) {
            try {
                if (!this.context || this.context.state === "closed") {
                    this.music?.pause();
                    this.context = new AudioContext({ sampleRate: 44100 });
                    this.music = new MusicPlayer(this.context, () => { this.completionCue = false; this.sync(); });
                }
            } catch { /* Unsupported audio leaves gameplay available. */ }
        }
        this.sync();
    }
    configure(settings: AudioSettings): void {
        this.settings = settings;
        try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* Session settings still work. */ }
        if (this.unlocked) this.activate();
    }
    setPhase(phase: string): void {
        const next = phase === "selling" ? "selling" : "preparation";
        if (next === "selling") this.completionCue = false;
        if (next === this.phase) return;
        this.phase = next; this.sync();
    }
    completeDay(): void {
        // Career advances before render. Browsing an old report is not a new cue.
        this.completionCue = this.canPlayMusic(); this.sync();
    }
    private canPlayMusic(): boolean {
        return this.unlocked && !this.settings.muted && this.settings.music > 0 && !document.hidden && document.hasFocus();
    }
    private sync(): void {
        if (!this.unlocked || !this.context) return;
        const silent = this.settings.muted || document.hidden || !document.hasFocus() || (this.settings.music === 0 && this.settings.effects === 0);
        if (silent) {
            this.music?.pause(); this.completionCue = false;
            if (this.context.state === "running") void this.context.suspend().catch(() => {});
            return;
        }
        if (this.context.state !== "running") {
            if (this.context.state !== "closed") void this.context.resume().then(() => this.sync()).catch(() => {});
            return;
        }
        if (this.settings.music > 0) {
            this.music?.volume(this.settings.music);
            this.music?.play(this.completionCue ? "results" : this.phase);
        } else { this.music?.pause(); this.completionCue = false; }
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
