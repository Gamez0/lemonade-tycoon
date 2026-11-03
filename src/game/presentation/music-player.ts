import { MUSIC_TRACKS, type MusicCue } from "./music-tracks";
interface Voice {
    cue: MusicCue; gain: GainNode; buffers: Map<number, AudioBuffer>;
    pending: Map<number, Promise<AudioBuffer>>; sources: Set<AudioBufferSourceNode>;
    controller: AbortController;
    origin: number; nextAt: number; nextIndex: number; timer: number; disposed: boolean;
}
/** Decode at most the playing/next four-bar segments, never whole long songs. */
export class MusicPlayer {
    private output: GainNode;
    private current: Voice | null = null;
    private retiring: Voice | null = null;
    private failed = new Set<MusicCue>();
    private positions: Partial<Record<MusicCue, number>> = {};
    constructor(private context: AudioContext, private completed: () => void) {
        this.output = context.createGain(); this.output.connect(context.destination);
    }
    volume(value: number): void { this.output.gain.setTargetAtTime(value, this.context.currentTime, 0.03); }
    private remember(voice: Voice): void {
        if (!Number.isFinite(voice.origin) || !MUSIC_TRACKS[voice.cue].loop) return;
        const seconds = MUSIC_TRACKS[voice.cue].seconds;
        this.positions[voice.cue] = Math.max(0, this.context.currentTime - voice.origin) % seconds;
    }
    private dispose(voice: Voice): void {
        voice.disposed = true; window.clearInterval(voice.timer);
        voice.controller.abort();
        for (const source of voice.sources) {
            source.onended = null;
            try { source.stop(); } catch { /* Already ended. */ }
            source.disconnect();
            try { source.buffer = null; } catch { /* Older engines can retain it until GC. */ }
        }
        voice.sources.clear(); voice.buffers.clear(); voice.pending.clear(); voice.gain.disconnect();
        if (this.current === voice) this.current = null;
        if (this.retiring === voice) this.retiring = null;
    }
    pause(): void {
        if (this.current) { this.remember(this.current); this.dispose(this.current); }
        if (this.retiring) this.dispose(this.retiring);
    }
    private fail(voice: Voice): void {
        if (voice.disposed) return;
        this.failed.add(voice.cue); this.remember(voice); this.dispose(voice);
        if (this.retiring) this.dispose(this.retiring);
        if (voice.cue === "results") this.completed();
    }
    private async load(voice: Voice, index: number): Promise<AudioBuffer> {
        const cached = voice.buffers.get(index); if (cached) return cached;
        const pending = voice.pending.get(index); if (pending) return pending;
        const track = MUSIC_TRACKS[voice.cue];
        const promise = (async () => {
            const response = await fetch(track.segments[index], { cache: "no-store", signal: voice.controller.signal });
            if (!response.ok) throw new Error("Music segment unavailable");
            const data = await response.arrayBuffer();
            if (voice.disposed) throw new Error("Music voice stopped before decoding");
            const buffer = await this.context.decodeAudioData(data);
            const duration = Math.min(track.segmentSeconds, track.seconds - index * track.segmentSeconds);
            if (Math.abs(buffer.duration - duration) > 0.002) throw new Error("Music segment duration differs");
            if (!voice.disposed) voice.buffers.set(index, buffer);
            voice.pending.delete(index); return buffer;
        })();
        voice.pending.set(index, promise); return promise;
    }
    private prefetch(voice: Voice): void {
        if (voice.nextIndex < 0 || voice.disposed) return;
        void this.load(voice, voice.nextIndex).catch(() => this.fail(voice));
    }
    private schedule(voice: Voice, index: number, when: number, offset: number): void {
        const track = MUSIC_TRACKS[voice.cue], buffer = voice.buffers.get(index);
        if (!buffer || voice.disposed) return;
        const duration = Math.min(track.segmentSeconds, track.seconds - index * track.segmentSeconds) - offset;
        const source = this.context.createBufferSource(); source.buffer = buffer; source.connect(voice.gain);
        voice.sources.add(source);
        source.onended = () => {
            voice.sources.delete(source); source.disconnect();
            source.buffer = null;
            if (voice.disposed) return;
            voice.buffers.delete(index);
            if (!track.loop && voice.nextIndex < 0 && voice.sources.size === 0) {
                this.dispose(voice); this.completed(); return;
            }
            this.prefetch(voice);
        };
        source.start(when, offset, duration);
    }
    private pump(voice: Voice): void {
        if (voice.disposed || this.context.state !== "running" || voice.nextIndex < 0) return;
        const track = MUSIC_TRACKS[voice.cue], index = voice.nextIndex;
        if (voice.nextAt - this.context.currentTime > 0.4 || !voice.buffers.has(index)) return;
        const duration = Math.min(track.segmentSeconds, track.seconds - index * track.segmentSeconds);
        const when = Math.max(voice.nextAt, this.context.currentTime + 0.01);
        const offset = when - voice.nextAt;
        if (offset < duration) this.schedule(voice, index, when, offset);
        else voice.buffers.delete(index); // Never replay a backlog after a long stall.
        voice.nextAt += duration;
        voice.nextIndex = index + 1 < track.segments.length ? index + 1 : track.loop ? 0 : -1;
        if (voice.sources.size < 2) this.prefetch(voice);
    }
    play(cue: MusicCue): void {
        if (this.current?.cue === cue) return;
        if (this.failed.has(cue)) { this.pause(); return; }
        if (this.retiring) this.dispose(this.retiring);
        if (this.current) this.remember(this.current);
        this.retiring = this.current;
        const track = MUSIC_TRACKS[cue], offset = track.loop ? this.positions[cue] ?? 0 : 0;
        const gain = this.context.createGain(); gain.gain.value = 0; gain.connect(this.output);
        const voice: Voice = { cue, gain, buffers: new Map(), pending: new Map(), sources: new Set(),
            controller: new AbortController(),
            origin: NaN, nextAt: 0, nextIndex: -1, timer: 0, disposed: false };
        this.current = voice;
        const index = Math.floor(offset / track.segmentSeconds), within = offset - index * track.segmentSeconds;
        void this.load(voice, index).then(() => {
            if (voice.disposed) return;
            if (this.context.state !== "running") { this.pause(); return; }
            const start = this.context.currentTime + 0.04;
            voice.origin = start - offset;
            voice.nextIndex = index + 1 < track.segments.length ? index + 1 : track.loop ? 0 : -1;
            voice.nextAt = start + Math.min(track.segmentSeconds, track.seconds - index * track.segmentSeconds) - within;
            this.schedule(voice, index, start, within);
            gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(1, start + 0.3);
            const retiring = this.retiring;
            if (retiring) {
                retiring.gain.gain.cancelScheduledValues(start);
                retiring.gain.gain.setValueAtTime(retiring.gain.gain.value, start);
                retiring.gain.gain.linearRampToValueAtTime(0, start + 0.3);
                window.setTimeout(() => { if (!retiring.disposed) this.dispose(retiring); }, 400);
            }
            this.prefetch(voice);
            voice.timer = window.setInterval(() => this.pump(voice), 100);
        }).catch(() => this.fail(voice));
    }
}
