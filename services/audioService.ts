
// synthesized audio effects to avoid external asset dependencies
class AudioService {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;

  constructor() {
    // Browser policy requires user interaction to resume context, handle in init
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.enabled = true;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createOscillator(type: OscillatorType, freq: number, duration: number, vol: number = 0.1) {
    if (!this.ctx || !this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playChipSound() {
    // High pitched metallic click
    this.createOscillator('sine', 2000, 0.1, 0.05);
    setTimeout(() => this.createOscillator('triangle', 1500, 0.1, 0.05), 50);
  }

  playCardSlide() {
    // Soft noise-like sound (simulated with low freq triangle)
    if (!this.ctx || !this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(300, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playCheckSound() {
    // Double tap
    this.createOscillator('square', 150, 0.05, 0.05);
    setTimeout(() => this.createOscillator('square', 150, 0.05, 0.05), 150);
  }

  playFoldSound() {
    // Sliding down
    this.createOscillator('sawtooth', 150, 0.3, 0.05);
  }

  playTurnAlert() {
    // Pleasant ding
    this.createOscillator('sine', 880, 0.5, 0.1);
  }

  playWinSound() {
    // Ascending arpeggio
    this.createOscillator('sine', 523.25, 0.2, 0.1);
    setTimeout(() => this.createOscillator('sine', 659.25, 0.2, 0.1), 150);
    setTimeout(() => this.createOscillator('sine', 783.99, 0.4, 0.1), 300);
  }
}

export const audioService = new AudioService();
