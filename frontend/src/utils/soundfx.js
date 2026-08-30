/**
 * Vision Max Intelligence — Pro Sound Designer Procedural UI Audio Engine
 * Pure Web Audio API Synthesizer with Zero External Asset Dependency & 0ms Latency.
 */

class SoundDesignerEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('vm_ui_sounds_muted') === 'true';
    this.masterGain = null;
  }

  _initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.28, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('vm_ui_sounds_muted', String(this.isMuted));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.28, this.ctx.currentTime);
    }
    if (!this.isMuted) {
      this.playTabSwitch();
    }
    return this.isMuted;
  }

  getMutedStatus() {
    return this.isMuted;
  }

  /**
   * 1. Tab Switch / Navigation Sound:
   * "Tactile Acoustic Glass Pop with Shimmer Harmonic"
   */
  playTabSwitch() {
    if (this.isMuted) return;
    this._initContext();
    const t = this.ctx.currentTime;

    // Transient oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    // Harmonic Sparkle
    const harmonic = this.ctx.createOscillator();
    const harmGain = this.ctx.createGain();
    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(1040, t);
    harmonic.frequency.exponentialRampToValueAtTime(880, t + 0.06);

    harmGain.gain.setValueAtTime(0.12, t);
    harmGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    harmonic.connect(harmGain);
    harmGain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.09);
    harmonic.start(t);
    harmonic.stop(t + 0.07);
  }

  /**
   * 2. Tactile Button Click / Menu Interaction:
   * "Micro-Acoustic Wooden/Ceramic Tap"
   */
  playButtonClick() {
    if (this.isMuted) return;
    this._initContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.04);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * 3. Speech / Script Generation Start:
   * "Sci-Fi Quantum Engine Charge Up"
   */
  playGenerateStart() {
    if (this.isMuted) return;
    this._initContext();
    const t = this.ctx.currentTime;

    // Sub-bass sweep
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(140, t);
    osc1.frequency.exponentialRampToValueAtTime(480, t + 0.35);

    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(400, t);
    filter1.frequency.exponentialRampToValueAtTime(2200, t + 0.35);

    gain1.gain.setValueAtTime(0.01, t);
    gain1.gain.linearRampToValueAtTime(0.28, t + 0.15);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    // Chime sweep
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(587.33, t); // D5
    osc2.frequency.exponentialRampToValueAtTime(1174.66, t + 0.3); // D6

    gain2.gain.setValueAtTime(0.01, t);
    gain2.gain.linearRampToValueAtTime(0.18, t + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(this.masterGain);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);

    osc1.start(t);
    osc1.stop(t + 0.4);
    osc2.start(t);
    osc2.stop(t + 0.36);
  }

  /**
   * 4. Speech / Story Generation Complete (Fanfare):
   * "Ethereal Major 9th Celestial Chime Chord"
   */
  playSuccessFanfare() {
    if (this.isMuted) return;
    this._initContext();
    const t = this.ctx.currentTime;

    // Frequencies for C Major 9th: C5, E5, G5, B5, D6
    const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66];
    const delays = [0, 0.06, 0.12, 0.18, 0.24];

    freqs.forEach((f, idx) => {
      const noteTime = t + delays[idx];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.65);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.7);
    });
  }

  /**
   * 5. User Account Registration & Google Sign-In:
   * "Heroic Studio Welcome Swell & Warm Resonance"
   */
  playAccountCreated() {
    if (this.isMuted) return;
    this._initContext();
    const t = this.ctx.currentTime;

    // Warm sub-bass swell
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(110, t);
    sub.frequency.exponentialRampToValueAtTime(220, t + 0.4);
    subGain.gain.setValueAtTime(0.01, t);
    subGain.gain.linearRampToValueAtTime(0.35, t + 0.15);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(t);
    sub.stop(t + 0.65);

    // Radiant Arpeggio: A4, C#5, E5, A5
    const chord = [440, 554.37, 659.25, 880];
    chord.forEach((freq, i) => {
      const start = t + 0.08 * i;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.01, start);
      gain.gain.linearRampToValueAtTime(0.24, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + 0.6);
    });
  }

  /**
   * 6. Voice / Persona Selector Pluck:
   * "Organic Marimba / Kalimba Timbre"
   */
  playVoicePluck(voiceIndex = 0) {
    if (this.isMuted) return;
    this._initContext();
    const t = this.ctx.currentTime;

    // Pentatonic scale frequency mapping
    const pentatonic = [392.00, 440.00, 493.88, 587.33, 659.25, 783.99, 880.00];
    const freq = pentatonic[voiceIndex % pentatonic.length];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  /**
   * 7. Lossless Audio Download Trigger:
   * "High-Tech Data Laser Beam / Digital Transfer"
   */
  playDownloadBeep() {
    if (this.isMuted) return;
    this._initContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(2400, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 0.16);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  /**
   * 8. Playback Transport Play / Pause:
   * "Analog Master Tape Click"
   */
  playTransport(isPlaying = true) {
    if (this.isMuted) return;
    this._initContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    if (isPlaying) {
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);
    } else {
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);
    }

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  /**
   * 9. Gentle Error / Notice Thud:
   * "Warm Subdued Double-Thud"
   */
  playErrorThud() {
    if (this.isMuted) return;
    this._initContext();
    const t = this.ctx.currentTime;

    [0, 0.08].forEach((offset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, t + offset);
      osc.frequency.exponentialRampToValueAtTime(80, t + offset + 0.06);

      gain.gain.setValueAtTime(0.25, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + offset);
      osc.stop(t + offset + 0.08);
    });
  }
}

// Global Singleton Export
export const soundFx = new SoundDesignerEngine();
