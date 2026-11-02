import { useLabStore } from '../store/useLabStore';
import { MachineId } from '../types/lab';

class SoundSystem {
  private ctx: AudioContext | null = null;
  private laserHumGain: GainNode | null = null;
  private laserHumOsc: OscillatorNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Short crisp UI button click
   */
  public playClick() {
    if (!useLabStore.getState().soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  /**
   * Industrial Relay Clack (when toggling laser power or entering inspection)
   */
  public playRelayClick() {
    if (!useLabStore.getState().soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // First click
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(320, now);
    osc1.frequency.exponentialRampToValueAtTime(80, now + 0.025);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.03);

    // Second bounce click 40ms later
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(450, now + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(120, now + 0.07);
    gain2.gain.setValueAtTime(0.15, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.075);
  }

  /**
   * Smooth camera whoosh / transition sweep
   */
  public playWhoosh() {
    if (!useLabStore.getState().soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.5);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.52);
  }

  private activeContinuousNodes: {
    sources: (AudioNode | AudioBufferSourceNode | OscillatorNode)[];
    gains: GainNode[];
  }[] = [];

  /**
   * Ambient laser operating acoustic simulation (Coaxial gas assist + Galvo scan flutter + Chiller hum)
   * Completely avoids harsh pure sine waves and prevents stuck oscillator loops.
   */
  public startLaserHum(machineId: MachineId) {
    if (!useLabStore.getState().soundEnabled) return;
    this.stopLaserHum();
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const currentSources: (AudioNode | AudioBufferSourceNode | OscillatorNode)[] = [];
    const currentGains: GainNode[] = [];

    // 1. Gas Assist Jet (Coaxial O2/N2 stream through cutting nozzle)
    // Synthesized via Bandpass Filtered Noise
    const sampleRate = this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, sampleRate, sampleRate);
    const channelData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < sampleRate; i++) {
      channelData[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const gasFilter = this.ctx.createBiquadFilter();
    gasFilter.type = 'bandpass';

    const gasGain = this.ctx.createGain();

    if (machineId === 'CO2_LASER') {
      // CO2: Heavy gas assist (1.6 kHz, gentle hiss)
      gasFilter.frequency.setValueAtTime(1600, now);
      gasFilter.Q.setValueAtTime(1.2, now);
      gasGain.gain.setValueAtTime(0.0001, now);
      gasGain.gain.linearRampToValueAtTime(0.025, now + 0.15);
    } else if (machineId === 'FIBER_LASER') {
      // Fiber: High-speed Galvo flutter (2200 Hz with slight resonance)
      gasFilter.frequency.setValueAtTime(2200, now);
      gasFilter.Q.setValueAtTime(1.8, now);
      gasGain.gain.setValueAtTime(0.0001, now);
      gasGain.gain.linearRampToValueAtTime(0.02, now + 0.15);
    } else if (machineId === 'UV_LASER') {
      // UV: Cold ablation micro-pulse hiss (3200 Hz, soft)
      gasFilter.frequency.setValueAtTime(3200, now);
      gasFilter.Q.setValueAtTime(1.5, now);
      gasGain.gain.setValueAtTime(0.0001, now);
      gasGain.gain.linearRampToValueAtTime(0.015, now + 0.15);
    } else {
      gasFilter.frequency.setValueAtTime(1200, now);
      gasFilter.Q.setValueAtTime(1.0, now);
      gasGain.gain.setValueAtTime(0.0001, now);
      gasGain.gain.linearRampToValueAtTime(0.01, now + 0.15);
    }

    noiseSource.connect(gasFilter);
    gasFilter.connect(gasGain);
    gasGain.connect(this.ctx.destination);
    noiseSource.start(now);

    currentSources.push(noiseSource);
    currentGains.push(gasGain);

    // 2. Chiller & Sub-harmonic Power Transformer Hum (Warm 60Hz/100Hz undertone, NOT harsh)
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(machineId === 'CO2_LASER' ? 100 : 75, now);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.linearRampToValueAtTime(0.008, now + 0.2);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);

    currentSources.push(subOsc);
    currentGains.push(subGain);

    this.activeContinuousNodes.push({
      sources: currentSources,
      gains: currentGains,
    });
  }

  /**
   * Mechanical pneumatic strut / lid hinge open/close sound
   */
  public playHingeSound(isOpen: boolean) {
    if (!useLabStore.getState().soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    if (isOpen) {
      // Ascending mechanical slide & latch release
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);
    } else {
      // Descending solid seal closure
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.16);
    }

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Workpiece drop / placement sound onto honeycomb or vacuum bed
   */
  public playMaterialPlaceSound() {
    if (!useLabStore.getState().soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Safety Interlock trip alarm beep (when lid opens while running)
   */
  public playInterlockTripSound() {
    if (!useLabStore.getState().soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Two rapid warning beeps (880Hz / A5)
    [0, 0.12].forEach((offset) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(980, now + offset);

      gain.gain.setValueAtTime(0.12, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.09);
    });
  }

  /**
   * Job complete chime
   */
  public playCutCompleteSound() {
    if (!useLabStore.getState().soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C - E - G - High C chord
    freqs.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.07);

      gain.gain.setValueAtTime(0.001, now + i * 0.07);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.4);
    });
  }

  public stopLaserHum() {
    if (!this.ctx || this.activeContinuousNodes.length === 0) return;
    const now = this.ctx.currentTime;

    const toClean = [...this.activeContinuousNodes];
    this.activeContinuousNodes = [];

    toClean.forEach(({ sources, gains }) => {
      gains.forEach((g) => {
        try {
          g.gain.cancelScheduledValues(now);
          g.gain.setValueAtTime(g.gain.value, now);
          g.gain.linearRampToValueAtTime(0.0001, now + 0.08);
        } catch (_) {}
      });

      setTimeout(() => {
        sources.forEach((s) => {
          try {
            if ('stop' in s && typeof (s as any).stop === 'function') {
              (s as any).stop();
            }
            s.disconnect();
          } catch (_) {}
        });
        gains.forEach((g) => {
          try {
            g.disconnect();
          } catch (_) {}
        });
      }, 100);
    });
  }

  /**
   * Immediately terminates all ongoing continuous sounds across the simulation
   */
  public stopAllAudio() {
    this.stopLaserHum();
    this.stopSpraySound();
    this.stopAlarmBuzzer();
  }

  private alarmOsc: OscillatorNode | null = null;
  private alarmGain: GainNode | null = null;

  /**
   * Safety Interlock Alarm Siren / Buzzer
   */
  public startAlarmBuzzer() {
    if (!useLabStore.getState().soundEnabled) return;
    this.stopAlarmBuzzer();
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);

    this.alarmOsc = osc;
    this.alarmGain = gain;
  }

  public stopAlarmBuzzer() {
    if (this.alarmGain && this.ctx) {
      const now = this.ctx.currentTime;
      try {
        this.alarmGain.gain.linearRampToValueAtTime(0.0001, now + 0.05);
        setTimeout(() => {
          this.alarmOsc?.stop();
          this.alarmOsc?.disconnect();
          this.alarmGain?.disconnect();
          this.alarmOsc = null;
          this.alarmGain = null;
        }, 60);
      } catch (_) {}
    }
  }

  private sprayGain: GainNode | null = null;
  private spraySource: AudioBufferSourceNode | null = null;

  public startSpraySound() {
    if (!useLabStore.getState().soundEnabled) return;
    this.initCtx();
    if (!this.ctx || this.spraySource) return;

    // Generate white noise for pneumatic air spray hiss
    const bufferSize = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.4, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.14, this.ctx.currentTime + 0.08);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    source.start();
    this.spraySource = source;
    this.sprayGain = gain;
  }

  public stopSpraySound() {
    if (this.sprayGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.sprayGain.gain.linearRampToValueAtTime(0.001, now + 0.1);
      setTimeout(() => {
        try {
          this.spraySource?.stop();
          this.spraySource?.disconnect();
          this.sprayGain?.disconnect();
        } catch (_) {}
        this.spraySource = null;
        this.sprayGain = null;
      }, 120);
    }
  }
}

export const sound = new SoundSystem();

