// AEROX · ZENITH UI Sound Engine (Web Audio API)
// Provides zero-latency, studio-grade tactile mechanical feedback without external network assets.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastTickTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const storedMute = localStorage.getItem('aerox_audio_muted');
      this.isMuted = storedMute === 'true';
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('aerox_audio_muted', String(muted));
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Subtle mechanical "tick" for hovers, slider detents, and micro-interactions.
   * Short, clean, high-frequency transient click (~10ms).
   */
  public playTick(volume = 0.16) {
    if (this.isMuted) return;
    try {
      // Throttle rapid hover ticks to at least 35ms apart
      const nowMs = Date.now();
      if (nowMs - this.lastTickTime < 35) return;
      this.lastTickTime = nowMs;

      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.012);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.Q.setValueAtTime(3.5, now);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.014);
    } catch {
      // Audio fail-safe
    }
  }

  /**
   * Crisp "clack" for button clicks, toggles, and dropdown selection.
   * Dual-layer mechanical switch click: body pitch drop + friction snap (~26ms).
   */
  public playClack(volume = 0.28) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 1. Lower body transient (downward sweep)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.026);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.026);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.028);

      // 2. High-frequency click snap
      const click = ctx.createOscillator();
      const clickGain = ctx.createGain();
      click.type = 'square';
      click.frequency.setValueAtTime(3400, now);
      click.frequency.exponentialRampToValueAtTime(1200, now + 0.008);

      clickGain.gain.setValueAtTime(volume * 0.45, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);

      click.connect(clickGain);
      clickGain.connect(ctx.destination);
      click.start(now);
      click.stop(now + 0.01);
    } catch {
      // Audio fail-safe
    }
  }

  /**
   * Soft "thud" for drag-and-drop landing, modal openings, and calendar deep-dive magnification.
   * Dampened low-frequency impact with smooth decay (~65ms).
   */
  public playThud(volume = 0.30) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(175, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.065);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.068);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.072);
    } catch {
      // Audio fail-safe
    }
  }
}

export const soundEngine = new SoundEngine();
