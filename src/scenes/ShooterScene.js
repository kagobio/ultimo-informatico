import { Sfx } from '../systems/Sfx.js';
// PROTOTIPO: fase de jefe 2D vertical (shoot'em up, vista cenital plana). Local, sin publicar.
const A = 'assets/modes/';
const FONT = { fontFamily: 'monospace', fontStyle: 'bold' };
export class ShooterScene extends Phaser.Scene {
  constructor() { super('Shoot'); }
  init(d) { this.d = d || { hpFrac: 1, k: 1 }; this.fin = false; this.endT = 0; }
  create() {
    const SW = this.scale.width, SH = this.scale.height, z = SH / 560, W = Math.min(SW / z, 700), H = 560; this.W = W; this.H = H; this.z = z; this.vx = (SW - W * z) / 2; const cm = this.cameras.main; cm.setViewport(this.vx, 0, W * z, SH).setZoom(z).setScroll(W / 2 - W * z / 2 / z * 0, 0); cm.setScroll(0, 0); cm.centerOn(W / 2, H / 2); this.cameras.main.setBackgroundColor('#060912');
    const t = this.textures.get('sh_bg').getSourceImage(), s = W / t.width; this.bgH = t.height * s; this.bgs = [];
    for (let i = 0; i < 3; i++) { const im = this.add.image(W / 2, 0, 'sh_bg').setScale(s).setDepth(-10).setFlipY(i % 2 === 1); im.i = i; this.bgs.push(im); } this.scroll = 0;
    this.pl = { x: W / 2, y: H - 130, hp: Math.max(1, Math.round(100 * (this.d.hpFrac ?? 1))), inv: 0 };
    this.ps = this.add.image(0, 0, 'sp0').setDepth(5).setScale(0.8);
    this.boss = { x: W / 2, y: 150, hp: 1500, max: 1500, t: 0, hit: 0, phase: 1, inv: 0, spA: 0, laser: null, lt: 5 };
    this.sl = 1;
    this.bs = this.add.image(0, 0, 'sb0').setDepth(4).setScale(0.95);
    this.mins = []; this.bul = []; this.eb = []; this.t = 0; this.fire = 0; this.sp = 0; this.score = 0;
    this.hpg = this.add.graphics().setDepth(20);
    this.add.text(W / 2, 10, 'BOSS: EL SERVIDOR DE PRODUCCIÓN', { ...FONT, fontSize: '14px', color: '#ff7a8a', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5, 0).setDepth(21);
    this.sc = this.add.text(12, H - 36, 'PUNTOS 0', { ...FONT, fontSize: '14px', color: '#ffd24a', stroke: '#000', strokeThickness: 4 }).setDepth(21);
    this.add.text(W - 12, H - 36, 'ESCUDO', { ...FONT, fontSize: '12px', color: '#7fffd4', stroke: '#000', strokeThickness: 3 }).setOrigin(1, 0).setDepth(21);
    this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,A,D,W,S'); Object.values(this.keys).forEach((q) => q.reset()); this.intro('¡JEFE!', 'EL SERVIDOR DE PRODUCCIÓN · 2D VERTICAL', '#ff7a8a'); Sfx.setMode && Sfx.setMode('boss');
    const pw = (p) => ({ x: (p.x - this.vx) / this.z, y: p.y / this.z - 70 }); this.input.on('pointermove', (p) => { if (p.isDown) this.tgt = pw(p); }); this.input.on('pointerdown', (p) => { this.tgt = pw(p); }); this.input.on('pointerup', () => { this.tgt = null; });
  }
  intro(title, sub, col) {
    this.introT = 1.8; const W = this.W, H = this.H;
    this.ban = this.add.container(0, 0).setDepth(50).setScrollFactor(0);
    const sc = this.cameras.main.zoom;
    const bx = this.add.rectangle(this.cameras.main.midPoint.x, this.cameras.main.midPoint.y - 40 / sc, W, 110 / sc, 0x000000, 0.7); const t1 = this.add.text(bx.x, bx.y - 14 / sc, title, { fontFamily: 'monospace', fontStyle: 'bold', fontSize: Math.round(26 / sc) + 'px', color: col, stroke: '#000', strokeThickness: 5 / sc }).setOrigin(0.5); const t2 = this.add.text(bx.x, bx.y + 22 / sc, sub, { fontFamily: 'monospace', fontStyle: 'bold', fontSize: Math.round(14 / sc) + 'px', color: '#ffffff' }).setOrigin(0.5);
    this.ban.add([bx, t1, t2]); this.cameras.main.fadeIn(350, 0, 0, 0);
  }
  checkEnd(dt, boss, p, cx, cy, WorldK) {
    if (this.fin) return; 
    if ((boss.hp <= 0 || p.hp <= 0) && !this.endT) { this.endT = this.fin ? 0 : (boss.hp <= 0 && p.hp > 0 ? 2.6 : 1.8); this.winF = boss.hp <= 0 && p.hp > 0; this.add.text(cx, cy, this.winF ? '¡JEFE DERROTADO!' : 'DERROTA', { fontFamily: 'monospace', fontStyle: 'bold', fontSize: Math.round(30 / (this.cameras.main.zoom)) + 'px', color: this.winF ? '#ffd24a' : '#ff5a6a', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5).setDepth(60); try { Sfx.play(this.winF ? 'boom' : 'lose'); } catch (e) {} }
    if (this.endT) { this.endT -= dt; if (this.endT <= 0) this.finish(this.winF, Math.max(0, p.hp) / 100); }
  }
  finish(win, frac) {
    if (this.fin) return; this.fin = true; const g = this.d.game; this.cameras.main.fadeOut(350, 0, 0, 0);
    this.time.delayedCall(380, () => { if (!g) { this.scene.restart(this.d); return; } this.scene.stop(); this.scene.wake('Game'); this.scene.wake('UI'); g.modeDone(win, frac, this.d.i); });
  }
  ebul(x, y, a, v, tex, sc) { this.eb.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: this.add.image(0, 0, tex).setScale(sc || 0.3).setDepth(6) }); }
  patterns(dt, b, p) {
    if (this.endT) return;
    // cambio de fase
    const ph = b.hp < b.max * 0.34 ? 3 : b.hp < b.max * 0.67 ? 2 : 1;
    if (ph > b.phase) { b.phase = ph; b.inv = 1.4; b.laser = null; this.eb.forEach((q) => { q.dead = 1; this.boom(q.x, q.y, 0xffffff, 1); }); const c = this.cameras.main; c.flash(400, 255, 255, 255); c.shake(500, 0.012); this.ring(b.x, b.y, 0xff7a8a); this.ring(b.x, b.y, 0xffd24a, 0.2); this.sl = 0.35; this.time.delayedCall(450, () => { this.sl = 1; });
      const t = this.add.text(this.W / 2, this.H / 2 - 40, ph === 2 ? 'FASE 2: ¡SOBRECARGA!' : 'FASE 3: ¡KERNEL PANIC!', { ...FONT, fontSize: '22px', color: '#ff7a8a', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5).setDepth(60); this.tweens.add({ targets: t, alpha: 0, y: t.y - 50, duration: 1800, onComplete: () => t.destroy() }); Sfx.play('boss'); }
    if (b.inv > 0) { b.inv -= dt; return; }
    this.sp -= dt;
    if (b.phase === 1) { if (this.sp <= 0) { this.sp = 1.1; const n = 9; for (let i = 0; i < n; i++) this.ebul(b.x, b.y + 60, Math.PI / 2 + (i - (n - 1) / 2) * 0.3 + Math.sin(b.t) * 0.2, 130, i % 4 === 2 ? 'bl3' : 'bl1'); } }
    else if (b.phase === 2) { // espiral giratoria + disparo dirigido
      b.spA += dt * 2.6; if (this.sp <= 0) { this.sp = 0.09; for (const o of [0, Math.PI]) this.ebul(b.x, b.y + 50, b.spA + o, 150, 'bl1', 0.28); }
      this.aim = (this.aim || 0) - dt; if (this.aim <= 0) { this.aim = 1.6; const a = Math.atan2(p.y - b.y, p.x - b.x); for (let i = -1; i <= 1; i++) this.ebul(b.x, b.y + 50, a + i * 0.16, 230, 'bl3', 0.34); }
    } else { // fase 3: láser con aviso + anillos + espiral lenta
      if (this.sp <= 0) { this.sp = 0.16; this.ebul(b.x, b.y + 50, (b.spA += 0.5), 130, 'bl1', 0.26); }
      this.rg = (this.rg || 0) - dt; if (this.rg <= 0) { this.rg = 2.4; for (let i = 0; i < 14; i++) this.ebul(b.x, b.y + 50, (i / 14) * 6.283 + b.t, 120, 'bl3', 0.3); }
      b.lt -= dt; if (!b.laser && b.lt <= 0) { b.laser = { x: Phaser.Math.Clamp(p.x, 60, this.W - 60), t: 0, hot: false }; b.lt = 4.2; }
    }
    const L = b.laser; if (L) { L.t += dt; L.hot = L.t > 1.1; if (L.t > 1.9) b.laser = null; else if (L.hot && p.inv <= 0 && Math.abs(p.x - L.x) < 22) { p.hp -= 14; p.inv = 1; this.boom(p.x, p.y, 0xff2a3a, 8); this.cameras.main.shake(160, 0.008); } if (L.hot && Math.random() < 0.5) this.boom(L.x + Phaser.Math.Between(-12, 12), Phaser.Math.Between(120, this.H), 0xff5a6a, 1); }
  }
  ring(x, y, col, d = 0.3) { const c = this.add.circle(x, y, 20, 0, 0).setStrokeStyle(5, col, 1).setDepth(30); this.tweens.add({ targets: c, scale: 14, alpha: 0, duration: 700 + d * 400, ease: 'Cubic.easeOut', onComplete: () => c.destroy() }); }
  boom(x, y, col, n = 8) { const c = this.add.circle(x, y, 8, col, 0.9).setDepth(9).setBlendMode(Phaser.BlendModes.ADD); this.tweens.add({ targets: c, scale: 3, alpha: 0, duration: 260, onComplete: () => c.destroy() }); for (let i = 0; i < n; i++) { const r = this.add.rectangle(x, y, 4, 4, col).setDepth(9); this.tweens.add({ targets: r, x: x + Phaser.Math.Between(-40, 40), y: y + Phaser.Math.Between(-40, 40), alpha: 0, duration: 380, onComplete: () => r.destroy() }); } }
  update(_, dms) {
    const dt = Math.min(dms, 50) / 1000 * (this.sl || 1); if (this.introT > 0) { this.introT -= dt; if (this.introT <= 0) this.ban.destroy(); return; }
    const  p = this.pl, k = this.keys, b = this.boss; this.t += dt;
    this.scroll = (this.scroll + 170 * dt) % (this.bgH * 2);
    for (const im of this.bgs) { let y = ((im.i * this.bgH + this.scroll) % (this.bgH * 3)) - this.bgH; im.setPosition(this.W / 2, y + this.bgH / 2 - (this.bgH - this.H) * 0); }
    const sp = 240; if (this.tgt) { p.x += Phaser.Math.Clamp(this.tgt.x - p.x, -sp * dt, sp * dt); p.y += Phaser.Math.Clamp(this.tgt.y - p.y, -sp * dt, sp * dt); }
    p.x += ((k.RIGHT.isDown || k.D.isDown ? 1 : 0) - (k.LEFT.isDown || k.A.isDown ? 1 : 0)) * sp * dt; p.y += ((k.DOWN.isDown || k.S.isDown ? 1 : 0) - (k.UP.isDown || k.W.isDown ? 1 : 0)) * sp * dt;
    p.x = Phaser.Math.Clamp(p.x, 40, this.W - 40); p.y = Phaser.Math.Clamp(p.y, 230, this.H - 70); p.inv = Math.max(0, p.inv - dt);
    this.ps.setPosition(p.x, p.y).setTexture(p.hp < 35 ? 'sp3' : 'sp' + (Math.floor(this.t * 12) % 3)).setAlpha(p.inv > 0 && Math.floor(p.inv * 20) % 2 ? 0.4 : 1);
    this.fire -= dt; if (this.fire <= 0 && !this.endT) { this.fire = 0.13; for (const o of [-14, 14]) this.bul.push({ x: p.x + o, y: p.y - 34, s: this.add.image(0, 0, 'bl0').setScale(0.38).setDepth(6) }); }
    b.t += dt; b.hit = Math.max(0, b.hit - dt); b.x = this.W / 2 + Math.sin(b.t * 0.8) * (this.W / 2 - 110); this.bs.setPosition(b.x, b.y + Math.sin(b.t * 3) * 6).setTexture('sb' + (b.hp < b.max / 2 ? 1 : 0)).setTint(b.hit > 0 ? 0xff9999 : 0xffffff);
    this.patterns(dt, b, p);
    if (Math.floor(this.t * 0.8) !== this.lm) { this.lm = Math.floor(this.t * 0.8); const kind = ['lock', 'mail', 'flop'][this.lm % 3], x = 70 + (this.lm * 97) % (this.W - 140); const s = this.add.image(x, -30, kind + '0').setDepth(4).setScale(1.1); this.mins.push({ x, y: -30, s, kind, t: 0, hp: 3, x0: x }); }
    for (const q of this.bul) { q.y -= 560 * dt; q.s.setPosition(q.x, q.y); if (q.y < -20) q.dead = 1; else if (Math.abs(q.x - b.x) < 70 && Math.abs(q.y - b.y) < 65) { q.dead = 1; if (b.inv <= 0) b.hp = Math.max(b.phase < 3 ? b.max * (b.phase === 1 ? 0.66 : 0.33) - 1 : 0, b.hp - 5 * (this.d.k || 1)); b.hit = 0.08; this.boom(q.x, q.y, 0x3df2ff, 2); } else for (const m of this.mins) if (!m.dead && Math.abs(q.x - m.x) < 26 && Math.abs(q.y - m.y) < 28) { q.dead = 1; if (--m.hp <= 0) { m.dead = 1; this.score += 100; this.boom(m.x, m.y, 0xffaa33); } } }
    for (const m of this.mins) { m.t += dt; m.y += 95 * dt; m.x = m.x0 + Math.sin(m.t * 2.2) * 50; m.s.setPosition(m.x, m.y); if (m.kind !== 'mail') m.s.setTexture(m.kind + (Math.floor(m.t * 6) & 1)); if (m.y > this.H + 40) m.dead = 1; if (p.inv <= 0 && Math.abs(m.x - p.x) < 28 && Math.abs(m.y - p.y) < 30) { m.dead = 1; p.hp -= 10; p.inv = 1; this.boom(m.x, m.y, 0xff2a3a); } }
    for (const q of this.eb) { q.x += q.vx * dt; q.y += q.vy * dt; q.s.setPosition(q.x, q.y); if (q.y > this.H + 20 || q.x < 0 || q.x > this.W) q.dead = 1; else if (p.inv <= 0 && Math.hypot(q.x - p.x, q.y - p.y) < 18) { q.dead = 1; p.hp -= 8; p.inv = 1; this.boom(p.x, p.y, 0xff2a3a, 6); this.cameras.main.shake(100, 0.004); } }
    for (const a of [this.bul, this.eb, this.mins]) for (let i = a.length - 1; i >= 0; i--) if (a[i].dead) { a[i].s.destroy(); a.splice(i, 1); }
    this.sc.setText('PUNTOS ' + this.score);
    const h = this.hpg; h.clear(); h.fillStyle(0, 0.75).fillRect(30, 32, this.W - 60, 14); h.fillStyle(0xff2a3a, 1).fillRect(32, 34, (this.W - 64) * b.hp / b.max, 10); h.fillStyle(0xffffff, 0.3).fillRect(32, 34, (this.W - 64) * b.hp / b.max, 3); h.lineStyle(2, 0xff7a8a, 1).strokeRect(30, 32, this.W - 60, 14);
    for (let i = 0; i < 10; i++) { h.fillStyle(p.hp > i * 10 ? 0x3df2ff : 0x1a2450, 1).fillRect(this.W - 12 - (10 - i) * 11, this.H - 20, 9, 10); }
    const Lz = b.laser; if (Lz) { const w = Lz.hot ? 30 + Math.sin(this.t * 60) * 4 : 6 + Lz.t * 6; h.fillStyle(Lz.hot ? 0xff2a3a : 0xffd24a, Lz.hot ? 0.8 : 0.35).fillRect(Lz.x - w / 2, b.y + 40, w, this.H); if (Lz.hot) h.fillStyle(0xffffff, 0.9).fillRect(Lz.x - 6, b.y + 40, 12, this.H); }
    for (let i = 1; i <= 2; i++) h.fillStyle(0xffffff, 1).fillRect(32 + (this.W - 64) * (i === 1 ? 0.33 : 0.66), 32, 2, 14);
    if (b.inv > 0) this.bs.setTint(0xffffff).setAlpha(Math.floor(b.inv * 16) % 2 ? 0.5 : 1); else this.bs.setAlpha(1);
    if (this.endT && this.winF) { this.bs.setPosition(b.x + Math.sin(this.t * 70) * 4, b.y); if (Math.random() < 0.5) this.boom(b.x + Phaser.Math.Between(-70, 70), b.y + Phaser.Math.Between(-60, 60), [0xffaa33, 0xff4020, 0xffffff][Phaser.Math.Between(0, 2)], 6); }
    if (b.hp <= 0) this.eb.forEach((q) => q.dead = 1);
    this.checkEnd(dt, b, p, this.W / 2, this.H / 2);
  }
}
