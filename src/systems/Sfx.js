// Audio 100% sintetizado con WebAudio: sin ficheros externos.
import { Save } from './Save.js';
const N = (m) => 440 * Math.pow(2, (m - 69) / 12);
class SfxSystem {
  constructor() { this.ctx = null; this.muted = false; this.last = {}; this.musicOn = false; this.mode = 'normal'; this.step = 0; this.nextT = 0; this.timer = null; }
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.6; this.master.connect(this.ctx.destination);
    this.sfxG = this.ctx.createGain(); this.sfxG.gain.value = 0.7; this.sfxG.connect(this.master);
    this.musG = this.ctx.createGain(); this.musG.gain.value = 0.22; this.musG.connect(this.master);
    const len = this.ctx.sampleRate; this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  setMuted(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 0.6; }
  tone(type, f0, f1, dur, vol = 0.3, delay = 0, dest) {
    const c = this.ctx; if (!c) return; const t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.sfxG); o.start(t); o.stop(t + dur + 0.02);
  }
  noise(dur, vol = 0.3, freq = 2000, q = 1, type = 'bandpass', delay = 0, dest, sweepTo) {
    const c = this.ctx; if (!c) return; const t = c.currentTime + delay;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.sfxG); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  play(name) {
    if (!this.ctx || this.muted) return;
    const now = performance.now(); const gap = { key: 45, mouse: 45, hit: 35, gem: 30, hurt: 120, printer: 220 }[name] || 60;
    if (this.last[name] && now - this.last[name] < gap) return; this.last[name] = now;
    switch (name) {
      case 'key': this.noise(0.04, 0.5, 3200, 2, 'highpass'); this.tone('square', 1000, 700, 0.03, 0.08); break;
      case 'mouse': this.tone('sine', 1300, 2100, 0.07, 0.18); break;
      case 'hit': this.noise(0.05, 0.25, 900, 1.2); break;
      case 'kill': this.tone('triangle', 500, 250, 0.08, 0.14); break;
      case 'hurt': this.tone('sawtooth', 240, 70, 0.22, 0.35); this.noise(0.12, 0.3, 500, 1); break;
      case 'ding': this.tone('sine', 880, 880, 0.18, 0.3); this.tone('sine', 1320, 1320, 0.3, 0.3, 0.12); break;
      case 'mail': this.tone('sine', 700, 700, 0.1, 0.2); this.tone('sine', 1050, 1050, 0.2, 0.2, 0.08); break;
      case 'levelup': [60, 64, 67, 72, 76].forEach((m, i) => this.tone('square', N(m), N(m), 0.16, 0.2, i * 0.07)); break;
      case 'printer': for (let i = 0; i < 5; i++) this.noise(0.05, 0.25, 1800 + (i % 2) * 500, 3, 'bandpass', i * 0.06); break;
      case 'hammer': this.tone('sine', 150, 40, 0.3, 0.6); this.noise(0.25, 0.5, 400, 1, 'lowpass'); break;
      case 'boom': this.noise(0.4, 0.55, 1200, 1, 'lowpass', 0, null, 120); this.tone('sine', 110, 35, 0.35, 0.4); break;
      case 'boss': this.tone('sawtooth', 110, 45, 0.9, 0.4); this.tone('square', 82, 41, 0.9, 0.2); break;
      case 'bsod': for (let i = 0; i < 4; i++) this.tone('square', 440, 440, 0.09, 0.2, i * 0.14); break;
      case 'cut': this.tone('sawtooth', 1800, 90, 0.5, 0.25); break;
      case 'zap': this.tone('sawtooth', 900, 300, 0.06, 0.12); break;
      case 'gem': this.tone('triangle', 1200, 1600, 0.05, 0.1); break;
      case 'coin': this.tone('square', 988, 988, 0.06, 0.15); this.tone('square', 1319, 1319, 0.14, 0.15, 0.06); break;
      case 'block': this.tone('square', 200, 120, 0.3, 0.25); break;
      case 'click': this.tone('square', 600, 800, 0.05, 0.15); break;
      case 'win': [60, 64, 67, 72, 67, 72, 76, 79].forEach((m, i) => this.tone('square', N(m), N(m), 0.22, 0.22, i * 0.12)); break;
      case 'lose': [67, 64, 60, 55].forEach((m, i) => this.tone('sawtooth', N(m), N(m - 1), 0.4, 0.22, i * 0.25)); break;
      case 'say': this.tone('square', 300 + Math.random() * 200, 250, 0.05, 0.07); break;
    }
  }
  // Música chiptune "oficina caótica"
  startMusic(mode = 'normal') {
    this.mode = mode; if (!this.ctx) return; if (this.musicOn) return; this.musicOn = true;
    this.step = 0; this.nextT = this.ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.sched(), 30);
  }
  stopMusic() { this.musicOn = false; clearInterval(this.timer); }
  sched() {
    const c = this.ctx; if (!c || !this.musicOn) return;
    const bpm = this.mode === 'boss' ? 152 : 128; const sd = 60 / bpm / 4;
    const bass = [45, 0, 45, 45, 0, 45, 48, 0, 43, 0, 43, 43, 0, 43, 47, 0];
    const lead = [69, 0, 72, 0, 76, 0, 72, 69, 67, 0, 71, 0, 74, 0, 71, 67, 69, 72, 76, 0, 81, 79, 76, 0, 74, 0, 71, 67, 71, 0, 0, 0];
    const bossLead = [57, 60, 63, 60, 57, 60, 64, 60, 55, 58, 62, 58, 55, 58, 61, 58];
    while (this.nextT < c.currentTime + 0.18) {
      const s = this.step, t = this.nextT - c.currentTime;
      const b = bass[s % 16]; if (b) this.tone('triangle', N(b), N(b), sd * 1.6, 0.5, t, this.musG);
      if (this.mode === 'boss') { const l = bossLead[s % 16]; if (l) this.tone('square', N(l + 12), N(l + 12), sd * 0.9, 0.18, t, this.musG); }
      else { const l = lead[s % 32]; if (l && (Math.floor(s / 32) % 4 !== 3 || s % 2 === 0)) this.tone('square', N(l), N(l), sd * 1.5, 0.16, t, this.musG); }
      if (s % 2 === 0) this.noise(0.03, s % 4 === 0 ? 0.25 : 0.12, 7000, 1, 'highpass', t, this.musG);
      if (s % 8 === 4) this.noise(0.1, 0.25, 1800, 1, 'bandpass', t, this.musG);
      if (s % 8 === 0) this.tone('sine', 140, 45, 0.12, 0.7, t, this.musG);
      this.step++; this.nextT += sd;
    }
  }
  setMode(m) { this.mode = m; }
}
export const Sfx = new SfxSystem();
