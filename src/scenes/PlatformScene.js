import { Sfx } from '../systems/Sfx.js';
// PROTOTIPO: fase de jefe en plataformas (scroll lateral, vista de perfil). Local, sin publicar.
const A = 'assets/modes/';
const FONT = { fontFamily: 'monospace', fontStyle: 'bold' };
export class PlatformScene extends Phaser.Scene {
  constructor() { super('Plat'); }
  init(d) { this.d = d || { hpFrac: 1, k: 1 }; this.fin = false; this.endT = 0; }
  create() {
    const W = this.scale.width, H = this.scale.height, Z = W / 480; this.Z = Z; const VW = 480, VH = H / Z; this.VW = VW; this.VH = VH;
    this.cameras.main.setZoom(Z).setBackgroundColor('#060912').centerOn(VW / 2, VH / 2);
    const bgi = this.add.image(VW / 2, VH / 2, 'pl_bg').setDepth(-10); bgi.setScale(Math.max(VW / bgi.width, VH / bgi.height));
    const GY = this.GY = Math.round(VH * 0.94), F2 = Math.round(VH * 0.675), F3 = Math.round(VH * 0.343);
    // plataformas: suelos del edificio (invisibles, el fondo ya los dibuja) + repisas neón
    this.plats = [{ x: 0, y: GY, w: VW }, { x: 190, y: F2, w: 300 }, { x: 0, y: F3, w: 300 }];
    const ledges = [[300, GY - 112], [20, GY - 200], [290, F2 - 88], [20, F2 - 178], [200, F2 - 250]];
    const g = this.add.graphics().setDepth(1);
    for (const [x, y] of ledges) { this.plats.push({ x, y, w: 160 }); g.fillStyle(0x0a0f26, 1).fillRect(x, y, 160, 12); g.fillStyle(0xff3df0, 1).fillRect(x, y, 160, 3); g.fillStyle(0xff3df0, 0.22).fillRect(x - 2, y + 12, 164, 10); g.fillStyle(0x3df2ff, 0.9).fillRect(x + 6, y + 6, 148, 2); }
    // luz de emergencia que parpadea + neblina
    this.red = this.add.rectangle(VW / 2, VH / 2, VW, VH, 0xff1a2a, 0.07).setDepth(8).setBlendMode(Phaser.BlendModes.ADD); this.tweens.add({ targets: this.red, alpha: 0.015, duration: 520, yoyo: true, repeat: -1 });
    this.pl = { x: 70, y: GY, vx: 0, vy: 0, on: true, face: 1, hp: Math.max(1, Math.round(100 * (this.d.hpFrac ?? 1))), t: 0, inv: 0, shot: 0 };
    this.ps = this.add.image(0, 0, 'ph0').setOrigin(0.5, 1).setDepth(5).setScale(0.9);
    this.boss = { x: 380, hp: 900, max: 900, t: 0, dir: -1, hit: 0, atk: 0, lt: -1 };
    this.bs = this.add.image(0, 0, 'pb0').setOrigin(0.5, 1).setDepth(4).setScale(1.25);
    this.bul = []; this.eb = []; this.won = false; this.fire = 0;
    // UI de plataformas: barras pixel arriba, panel de jefe
    this.hpg = this.add.graphics().setDepth(20);
    this.add.text(VW / 2, 12, 'LA IMPRESORA POSEÍDA', { ...FONT, fontSize: '16px', color: '#ffd24a', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5, 0).setDepth(21);
    this.add.text(14, 54, 'TÉCNICO', { ...FONT, fontSize: '11px', color: '#7fffd4', stroke: '#000', strokeThickness: 3 }).setDepth(21);
    this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,UP,SPACE,A,D,W,Z'); this.keys.SPACE.reset && Object.values(this.keys).forEach((q) => q.reset()); this.intro('¡JEFE!', 'LA IMPRESORA POSEÍDA · PLATAFORMAS', '#ffd24a'); Sfx.setMode && Sfx.setMode('boss');
    this.touch = { l: false, r: false, j: false, f: false };
    this.btn(48, VH - 44, '◀', 'l', 0x3df2ff); this.btn(122, VH - 44, '▶', 'r', 0x3df2ff); this.btn(VW - 124, VH - 44, 'SALTO', 'j', 0xffd24a); this.btn(VW - 48, VH - 44, 'FUEGO', 'f', 0xff3df0);
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
  btn(x, y, label, key, col) {
    const c = this.add.rectangle(x, y, 56, 56, col, 0.16).setStrokeStyle(3, col, 0.95).setDepth(25).setInteractive();
    this.add.text(x, y, label, { ...FONT, fontSize: label.length > 2 ? '11px' : '22px', color: '#fff' }).setOrigin(0.5).setDepth(26);
    c.on('pointerdown', () => { this.touch[key] = true; c.setFillStyle(col, 0.5); }); const up = () => { this.touch[key] = false; c.setFillStyle(col, 0.16); }; c.on('pointerup', up); c.on('pointerout', up);
  }
  spark(x, y, col) { for (let i = 0; i < 6; i++) { const s = this.add.rectangle(x, y, 4, 4, col).setDepth(9); this.tweens.add({ targets: s, x: x + Phaser.Math.Between(-30, 30), y: y + Phaser.Math.Between(-30, 20), alpha: 0, duration: 300, onComplete: () => s.destroy() }); } }
  update(_, dms) {
    const dt = Math.min(dms, 50) / 1000; if (this.introT > 0) { this.introT -= dt; if (this.introT <= 0) this.ban.destroy(); return; }
    const p = this.pl, k = this.keys, T = this.touch, b = this.boss, GY = this.GY;
    const L = k.LEFT.isDown || k.A.isDown || T.l, R = k.RIGHT.isDown || k.D.isDown || T.r, J = k.UP.isDown || k.W.isDown || T.j, F = k.SPACE.isDown || k.Z.isDown || T.f;
    p.vx = ((R ? 1 : 0) - (L ? 1 : 0)) * 150; if (p.vx) p.face = Math.sign(p.vx);
    if (J && p.on) { p.vy = -560; p.on = false; }
    if (this.endT) { p.vx = 0; } p.vy += 1100 * dt; const oy = p.y; p.x = Phaser.Math.Clamp(p.x + p.vx * dt, 20, this.VW - 20); p.y += p.vy * dt; p.on = false;
    for (const pl of this.plats) if (p.vy >= 0 && p.x > pl.x - 4 && p.x < pl.x + pl.w + 4 && oy <= pl.y + 2 && p.y >= pl.y) { p.y = pl.y; p.vy = 0; p.on = true; }
    p.t += dt * (p.vx ? 10 : 0); p.inv = Math.max(0, p.inv - dt); p.shot = Math.max(0, p.shot - dt);
    const fr = !p.on ? 4 : p.shot > 0 ? 5 : (Math.floor(p.t) & 3);
    this.ps.setPosition(p.x, p.y).setTexture('ph' + fr).setFlipX(p.face < 0).setAlpha(p.inv > 0 && Math.floor(p.inv * 20) % 2 ? 0.4 : 1);
    this.fire -= dt; if (F && this.fire <= 0 && !this.endT) { this.fire = 0.22; p.shot = 0.12; this.bul.push({ x: p.x + p.face * 30, y: p.y - 46, vx: p.face * 440, s: this.add.image(0, 0, 'pbl0').setAngle(90).setScale(0.32).setDepth(6) }); }
    // jefe: patrulla, y cada pocos segundos ataca lanzando papeles en abanico
    if (b.hp <= 0) { this.eb.forEach((q) => q.dead = 1); } b.t += dt; b.hit = Math.max(0, b.hit - dt); b.atk = Math.max(0, b.atk - dt);
    if (b.atk <= 0) { b.x += b.dir * 40 * dt; if (b.x < 230) b.dir = 1; if (b.x > 430) b.dir = -1; }
    this.bs.setPosition(b.x, GY + Math.sin(b.t * 7) * 2).setTexture(b.atk > 0 ? 'pb3' : 'pb' + (Math.floor(b.t * 4) % 3)).setFlipX(b.dir > 0).setTint(b.hit > 0 ? 0xff9999 : 0xffffff);
    const tick = Math.floor(b.t / 2.2); if (tick !== b.lt) { b.lt = tick; b.atk = 0.5; for (const a of [-0.35, -0.1, 0.15]) { const ang = (b.dir < 0 ? Math.PI : 0) + a * (b.dir < 0 ? 1 : -1); this.eb.push({ x: b.x + b.dir * 50, y: GY - 80, vx: Math.cos(ang) * 170, vy: Math.sin(ang) * 170 - 50, s: this.add.image(0, 0, 'pbl2').setScale(0.3).setDepth(6) }); } }
    for (const q of this.bul) { q.x += q.vx * dt; q.s.setPosition(q.x, q.y); if (q.x < -10 || q.x > this.VW + 10) q.dead = 1; else if (Math.abs(q.x - b.x) < 55 && q.y > GY - 130 && q.y < GY) { q.dead = 1; b.hp = Math.max(0, b.hp - 12 * (this.d.k || 1)); Sfx.play('hit'); b.hit = 0.1; this.spark(q.x, q.y, 0x3df2ff); } }
    for (const q of this.eb) { q.vy += 300 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.s.setPosition(q.x, q.y).setAngle(q.x * 4); if (q.y > GY) { q.dead = 1; this.spark(q.x, GY, 0xffffff); } else if (p.inv <= 0 && Math.abs(q.x - p.x) < 16 && Math.abs(q.y - (p.y - 40)) < 40) { q.dead = 1; p.hp -= 10; p.inv = 1; this.spark(q.x, q.y, 0xff2a3a); this.cameras.main.shake(120, 0.004); } }
    for (const a of [this.bul, this.eb]) for (let i = a.length - 1; i >= 0; i--) if (a[i].dead) { a[i].s.destroy(); a.splice(i, 1); }
    const h = this.hpg; h.clear();
    h.fillStyle(0, 0.75).fillRect(40, 34, 400, 14); h.fillStyle(0xff2a3a, 1).fillRect(42, 36, 396 * b.hp / b.max, 10); h.fillStyle(0xffffff, 0.3).fillRect(42, 36, 396 * b.hp / b.max, 3); h.lineStyle(2, 0xffd24a, 1).strokeRect(40, 34, 400, 14);
    h.fillStyle(0, 0.75).fillRect(12, 68, 130, 12); h.fillStyle(0x5df28a, 1).fillRect(14, 70, 126 * Math.max(0, p.hp) / 100, 8); h.lineStyle(2, 0x7fffd4, 1).strokeRect(12, 68, 130, 12);
    this.checkEnd(dt, b, p, this.VW / 2, this.VH / 2);
  }
}
