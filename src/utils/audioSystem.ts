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

  /**
   * Ambient laser hum while inspecting a machine
   */
  public startLaserHum(machineId: MachineId) {
    if (!useLabStore.getState().soundEnabled) return;
    this.stopLaserHum();
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.laserHumOsc = this.ctx.createOscillator();
    this.laserHumGain = this.ctx.createGain();

    // Specific frequency timbre per laser type
    if (machineId === 'CO2_LASER') {
      this.laserHumOsc.type = 'sawtooth';
      this.laserHumOsc.frequency.setValueAtTime(120, now); // 120Hz HV transformer hum
      this.laserHumGain.gain.setValueAtTime(0.001, now);
      this.laserHumGain.gain.linearRampToValueAtTime(0.02, now + 0.4);
    } else if (machineId === 'UV_LASER') {
      this.laserHumOsc.type = 'sine';
      this.laserHumOsc.frequency.setValueAtTime(2400, now); // High-pitch Q-switch whistle
      this.laserHumGain.gain.setValueAtTime(0.001, now);
      this.laserHumGain.gain.linearRampToValueAtTime(0.012, now + 0.4);
    } else if (machineId === 'FIBER_LASER') {
      this.laserHumOsc.type = 'triangle';
      this.laserHumOsc.frequency.setValueAtTime(440, now); // Galvo scan motor whine
      this.laserHumGain.gain.setValueAtTime(0.001, now);
      this.laserHumGain.gain.linearRampToValueAtTime(0.025, now + 0.4);
    } else {
      // Sensor station tick
      this.laserHumOsc.type = 'sine';
      this.laserHumOsc.frequency.setValueAtTime(60, now);
      this.laserHumGain.gain.setValueAtTime(0.001, now);
      this.laserHumGain.gain.linearRampToValueAtTime(0.015, now + 0.4);
    }

    this.laserHumOsc.connect(this.laserHumGain);
    this.laserHumGain.connect(this.ctx.destination);
    this.laserHumOsc.start(now);
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
    if (this.laserHumGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.laserHumGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
      setTimeout(() => {
        try {
          this.laserHumOsc?.stop();
          this.laserHumOsc?.disconnect();
          this.laserHumGain?.disconnect();
        } catch (_) {}
        this.laserHumOsc = null;
        this.laserHumGain = null;
      }, 350);
    }
  }
}

export const sound = new SoundSystem();

