// Thin Howler wrapper for the two channels used everywhere in the project:
// "music" (looping ambience/score) and "sfx" (one-shots). Real audio files
// don't exist yet (Phase 10 ships the manifest) — every method degrades to
// a silent no-op when a source 404s, so components can call `play`/`fadeIn`
// today without caring whether the asset has landed.
import { Howl, Howler } from "howler";

export type SoundChannel = "music" | "sfx";

export interface TrackConfig {
  /** One or more URLs, in order of preference (see Howler's `src`). */
  src: string[];
  loop?: boolean;
  volume?: number;
}

const CHANNEL_DEFAULTS: Record<SoundChannel, { loop: boolean; html5: boolean }> = {
  music: { loop: true, html5: true },
  sfx: { loop: false, html5: false },
};

class SoundManager {
  private tracks = new Map<string, Howl>();
  private failed = new Set<string>();
  private warned = new Set<string>();

  private warnOnce(id: string, message: string) {
    if (process.env.NODE_ENV === "production" || this.warned.has(id)) return;
    this.warned.add(id);
    console.warn(`[sound] ${message}`);
  }

  private get(id: string, channel: SoundChannel, config: TrackConfig): Howl | null {
    if (this.failed.has(id)) return null;

    const existing = this.tracks.get(id);
    if (existing) return existing;

    const defaults = CHANNEL_DEFAULTS[channel];
    const howl = new Howl({
      src: config.src,
      loop: config.loop ?? defaults.loop,
      html5: defaults.html5,
      volume: config.volume ?? 1,
      onloaderror: () => {
        this.failed.add(id);
        this.tracks.delete(id);
        this.warnOnce(id, `"${id}" failed to load (${config.src.join(", ")}) — skipping.`);
      },
    });

    this.tracks.set(id, howl);
    return howl;
  }

  /** Play a track once (or looping, per config/channel default). No-ops if the source is missing. */
  play(id: string, channel: SoundChannel, config: TrackConfig) {
    this.get(id, channel, config)?.play();
  }

  stop(id: string) {
    this.tracks.get(id)?.stop();
  }

  /** Fade a track in from silence to its target volume over `duration` ms. */
  fadeIn(id: string, channel: SoundChannel, config: TrackConfig, duration = 800) {
    const howl = this.get(id, channel, config);
    if (!howl) return;
    const target = config.volume ?? 1;
    howl.volume(0);
    howl.play();
    howl.fade(0, target, duration);
  }

  /** Fade a track out to silence over `duration` ms, then stop it. */
  fadeOut(id: string, duration = 800) {
    const howl = this.tracks.get(id);
    if (!howl) return;
    const from = typeof howl.volume() === "number" ? (howl.volume() as number) : 1;
    howl.fade(from, 0, duration);
    setTimeout(() => howl.stop(), duration);
  }

  /** Global mute switch — used by <SoundButton/> via src/store/sound.ts. */
  setMuted(muted: boolean) {
    Howler.mute(muted);
  }

  /** Resume the WebAudio context on the first user gesture (autoplay policy). */
  unlock() {
    if (Howler.ctx?.state === "suspended") {
      void Howler.ctx.resume();
    }
  }
}

export const sound = new SoundManager();
