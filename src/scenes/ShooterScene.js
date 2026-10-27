import { Sfx } from '../systems/Sfx.js';
// PROTOTIPO: fase de jefe 2D vertical (shoot'em up, vista cenital plana). Local, sin publicar.
const A = 'assets/modes/';
const FONT = { fontFamily: 'monospace', fontStyle: 'bold' };
export class ShooterScene extends Phaser.Scene {
  constructor() { super('Shoot'); }
  init(d) { this.d = d || { hpFrac: 1, k: 1 }; this.fin = false; this.endT = 0; }
  create() {
    const W = this.scale.width, H = this.scale.height; this.W = W; this.H = H; this.cameras.main.setBackgroundColor('#060912');
    const t = this.textures.get('sh_bg').getSourceImage(), s = W / t.width; this.bgH = t.height * s; this.bgs = [];
    for (let i = 0; i < 3; i++) { const im = this.add.image(W / 2, 0, 'sh_bg').setScale(s).setDepth(-10).setFlipY(i % 2 === 1); im.i = i; this.bgs.push(im); } this.scroll = 0;
    this.pl = { x: W / 2, y: H - 130, hp: Math.max(1, Math.round(100 * (this.d.hpFrac ?? 1))), inv: 0 };
    this.ps = this.add.image(0, 0, 'sp0').setDepth(5).setScale(0.8);
    this.boss = { x: W / 2, y: 150, hp: 1500, max: 1500, t: 0, hit: 0 };
    this.bs = this.add.image(0, 0, 'sb0').setDepth(4).setScale(0.95);
    this.mins = []; this.bul = []; this.eb = []; this.t = 0; this.fire = 0; this.sp = 0; this.score = 0;
    this.hpg = this.add.graphics().setDepth(20);
    this.add.text(W / 2, 10, 'BOSS: EL SERVIDOR DE PRODUCCIÓN', { ...FONT, fontSize: '14px', color: '#ff7a8a', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5, 0).setDepth(21);
    this.sc = this.add.text(12, H - 36, 'PUNTOS 0', { ...FONT, fontSize: '14px', color: '#ffd24a', stroke: '#000', strokeThickness: 4 }).setDepth(21);
    this.add.text(W - 12, H - 36, 'ESCUDO', { ...FONT, fontSize: '12px', color: '#7fffd4', stroke: '#000', strokeThickness: 3 }).setOrigin(1, 0).setDepth(21);
    this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,A,D,W,S'); Object.values(this.keys).forEach((q) => q.reset()); this.intro('¡JEFE!', 'EL SERVIDOR DE PRODUCCIÓN · 2D VERTICAL', '#ff7a8a'); Sfx.setMode && Sfx.setMode('boss');
    this.input.on('pointermove', (p) => { if (p.isDown) this.tgt = { x: p.x, y: p.y - 70 }; }); this.input.on('pointerdown', (p) => { this.tgt = { x: p.x, y: p.y - 70 }; }); this.input.on('pointerup', () => { this.tgt = null; });
  }
  intro(title, sub, col) {
    this.introT = 1.8; const W = this.scale.width, H = this.scale.height;
    this.ban = this.add.container(0, 0).setDepth(50).setScrollFactor(0);
    const sc = this.cameras.main.zoom;
    const bx = this.add.rectangle(this.cameras.main.midPoint.x, this.cameras.main.midPoint.y - 40 / sc, W / sc, 110 / sc, 0x000000, 0.7); const t1 = this.add.text(bx.x, bx.y - 14 / sc, title, { fontFamily: 'monospace', fontStyle: 'bold', fontSize: Math.round(26 / sc) + 'px', color: col, stroke: '#000', strokeThickness: 5 / sc }).setOrigin(0.5); const t2 = this.add.text(bx.x, bx.y + 22 / sc, sub, { fontFamily: 'monospace', fontStyle: 'bold', fontSize: Math.round(14 / sc) + 'px', color: '#ffffff' }).setOrigin(0.5);
    this.ban.add([bx, t1, t2]); this.cameras.main.fadeIn(350, 0, 0, 0);
  }
  checkEnd(dt, boss, p, cx, cy, WorldK) {
    if (this.fin) return; 
    if ((boss.hp <= 0 || p.hp <= 0) && !this.endT) { this.endT = 1.8; this.winF = boss.hp <= 0 && p.hp > 0; this.add.text(cx, cy, this.winF ? '¡JEFE DERROTADO!' : 'DERROTA', { fontFamily: 'monospace', fontStyle: 'bold', fontSize: Math.round(30 / (this.cameras.main.zoom)) + 'px', color: this.winF ? '#ffd24a' : '#ff5a6a', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5).setDepth(60); try { Sfx.play(this.winF ? 'boom' : 'lose'); } catch (e) {} }
    if (this.endT) { this.endT -= dt; if (this.endT <= 0) this.finish(this.winF, Math.max(0, p.hp) / 100); }
  }
  finish(win, frac) {
    if (this.fin) return; this.fin = true; const g = this.d.game; this.cameras.main.fadeOut(350, 0, 0, 0);
    this.time.delayedCall(380, () => { if (!g) { this.scene.restart(this.d); return; } this.scene.stop(); this.scene.wake('Game'); this.scene.wake('UI'); g.modeDone(win, frac, this.d.i); });
  }
  boom(x, y, col, n = 8) { const c = this.add.circle(x, y, 8, col, 0.9).setDepth(9).setBlendMode(Phaser.BlendModes.ADD); this.tweens.add({ targets: c, scale: 3, alpha: 0, duration: 260, onComplete: () => c.destroy() }); for (let i = 0; i < n; i++) { const r = this.add.rectangle(x, y, 4, 4, col).setDepth(9); this.tweens.add({ targets: r, x: x + Phaser.Math.Between(-40, 40), y: y + Phaser.Math.Between(-40, 40), alpha: 0, duration: 380, onComplete: () => r.destroy() }); } }
  update(_, dms) {
    const dt = Math.min(dms, 50) / 1000; if (this.introT > 0) { this.introT -= dt; if (this.introT <= 0) this.ban.destroy(); return; }
    const  p = this.pl, k = this.keys, b = this.boss; this.t += dt;
    this.scroll = (this.scroll + 170 * dt) % (this.bgH * 2);
    for (const im of this.bgs) { let y = ((im.i * this.bgH + this.scroll) % (this.bgH * 3)) - this.bgH; im.setPosition(this.W / 2, y + this.bgH / 2 - (this.bgH - this.H) * 0); }
    const sp = 240; if (this.tgt) { p.x += Phaser.Math.Clamp(this.tgt.x - p.x, -sp * dt, sp * dt); p.y += Phaser.Math.Clamp(this.tgt.y - p.y, -sp * dt, sp * dt); }
    p.x += ((k.RIGHT.isDown || k.D.isDown ? 1 : 0) - (k.LEFT.isDown || k.A.isDown ? 1 : 0)) * sp * dt; p.y += ((k.DOWN.isDown || k.S.isDown ? 1 : 0) - (k.UP.isDown || k.W.isDown ? 1 : 0)) * sp * dt;
    p.x = Phaser.Math.Clamp(p.x, 40, this.W - 40); p.y = Phaser.Math.Clamp(p.y, 230, this.H - 70); p.inv = Math.max(0, p.inv - dt);
    this.ps.setPosition(p.x, p.y).setTexture(p.hp < 35 ? 'sp3' : 'sp' + (Math.floor(this.t * 12) % 3)).setAlpha(p.inv > 0 && Math.floor(p.inv * 20) % 2 ? 0.4 : 1);
    this.fire -= dt; if (this.fire <= 0 && !this.endT) { this.fire = 0.13; for (const o of [-14, 14]) this.bul.push({ x: p.x + o, y: p.y - 34, s: this.add.image(0, 0, 'bl0').setScale(0.38).setDepth(6) }); }
    b.t += dt; b.hit = Math.max(0, b.hit - dt); b.x = this.W / 2 + Math.sin(b.t * 0.8) * (this.W / 2 - 110); this.bs.setPosition(b.x, b.y + Math.sin(b.t * 3) * 6).setTexture('sb' + (b.hp < b.max / 2 ? 1 : 0)).setTint(b.hit > 0 ? 0xff9999 : 0xffffff);
    this.sp -= dt; if (this.sp <= 0 && !this.endT) { this.sp = 1.1; const n = 9; for (let i = 0; i < n; i++) { const a = Math.PI / 2 + (i - (n - 1) / 2) * 0.3 + Math.sin(b.t) * 0.2; this.eb.push({ x: b.x, y: b.y + 60, vx: Math.cos(a) * 130, vy: Math.sin(a) * 130, s: this.add.image(0, 0, i % 4 === 2 ? 'bl3' : 'bl1').setScale(0.3).setDepth(6) }); } }
    if (Math.floor(this.t * 0.8) !== this.lm) { this.lm = Math.floor(this.t * 0.8); const kind = ['lock', 'mail', 'flop'][this.lm % 3], x = 70 + (this.lm * 97) % (this.W - 140); const s = this.add.image(x, -30, kind + '0').setDepth(4).setScale(1.1); this.mins.push({ x, y: -30, s, kind, t: 0, hp: 3, x0: x }); }
    for (const q of this.bul) { q.y -= 560 * dt; q.s.setPosition(q.x, q.y); if (q.y < -20) q.dead = 1; else if (Math.abs(q.x - b.x) < 70 && Math.abs(q.y - b.y) < 65) { q.dead = 1; b.hp = Math.max(0, b.hp - 5 * (this.d.k || 1)); b.hit = 0.08; this.boom(q.x, q.y, 0x3df2ff, 2); } else for (const m of this.mins) if (!m.dead && Math.abs(q.x - m.x) < 26 && Math.abs(q.y - m.y) < 28) { q.dead = 1; if (--m.hp <= 0) { m.dead = 1; this.score += 100; this.boom(m.x, m.y, 0xffaa33); } } }
    for (const m of this.mins) { m.t += dt; m.y += 95 * dt; m.x = m.x0 + Math.sin(m.t * 2.2) * 50; m.s.setPosition(m.x, m.y); if (m.kind !== 'mail') m.s.setTexture(m.kind + (Math.floor(m.t * 6) & 1)); if (m.y > this.H + 40) m.dead = 1; if (p.inv <= 0 && Math.abs(m.x - p.x) < 28 && Math.abs(m.y - p.y) < 30) { m.dead = 1; p.hp -= 10; p.inv = 1; this.boom(m.x, m.y, 0xff2a3a); } }
    for (const q of this.eb) { q.x += q.vx * dt; q.y += q.vy * dt; q.s.setPosition(q.x, q.y); if (q.y > this.H + 20 || q.x < 0 || q.x > this.W) q.dead = 1; else if (p.inv <= 0 && Math.hypot(q.x - p.x, q.y - p.y) < 18) { q.dead = 1; p.hp -= 8; p.inv = 1; this.boom(p.x, p.y, 0xff2a3a, 6); this.cameras.main.shake(100, 0.004); } }
    for (const a of [this.bul, this.eb, this.mins]) for (let i = a.length - 1; i >= 0; i--) if (a[i].dead) { a[i].s.destroy(); a.splice(i, 1); }
    this.sc.setText('PUNTOS ' + this.score);
    const h = this.hpg; h.clear(); h.fillStyle(0, 0.75).fillRect(30, 32, this.W - 60, 14); h.fillStyle(0xff2a3a, 1).fillRect(32, 34, (this.W - 64) * b.hp / b.max, 10); h.fillStyle(0xffffff, 0.3).fillRect(32, 34, (this.W - 64) * b.hp / b.max, 3); h.lineStyle(2, 0xff7a8a, 1).strokeRect(30, 32, this.W - 60, 14);
    for (let i = 0; i < 10; i++) { h.fillStyle(p.hp > i * 10 ? 0x3df2ff : 0x1a2450, 1).fillRect(this.W - 12 - (10 - i) * 11, this.H - 20, 9, 10); }
    if (b.hp <= 0) this.eb.forEach((q) => q.dead = 1);
    this.checkEnd(dt, b, p, this.W / 2, this.H / 2);
  }
}
