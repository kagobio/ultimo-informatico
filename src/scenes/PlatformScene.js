import { Sfx } from '../systems/Sfx.js';
// Fase de jefe en plataformas (vista de perfil): nivel con huecos, plataformas móviles, enemigos y jefe de 3 fases.
const FONT = { fontFamily: 'monospace', fontStyle: 'bold' };
const LW = 2260;
const GROUND = [[0, 430], [570, 860], [1130, 1400], [1880, 2260]];
const CHECK = [20, 600, 1160, 1900];
export class PlatformScene extends Phaser.Scene {
  constructor() { super('Plat'); }
  init(d) { this.d = d || { hpFrac: 1, k: 1 }; this.fin = false; this.endT = 0; this.introT = 0; }
  create() {
    const W = this.scale.width, H = this.scale.height, Z = W / 320; this.Z = Z; const VW = 320, VH = H / Z; this.VW = VW; this.VH = VH;
    const cam = this.cam = this.cameras.main; cam.setZoom(Z).setBackgroundColor('#060912');
    const GY = this.GY = Math.round(VH * 0.8);
    const bgi0 = this.textures.get('pl_bg').getSourceImage(), s = (VH * 1.1) / bgi0.height, tw = bgi0.width * s, bgY = GY - 0.94 * bgi0.height * s + bgi0.height * s / 2;
    for (let i = 0; i < Math.ceil((LW * 0.55 + VW) / tw) + 3; i++) { const im = this.add.image(i * tw + tw / 2 - tw, bgY, 'pl_bg').setScale(s).setDepth(-10).setScrollFactor(0.55, 1).setFlipX(i % 2 === 1); }
    // suelo y huecos
    const g = this.add.graphics().setDepth(1);
    for (const [a, b] of GROUND) { g.fillStyle(0x10163a, 1).fillRect(a, GY, b - a, VH - GY + 40); g.fillStyle(0x3df2ff, 1).fillRect(a, GY, b - a, 4); g.fillStyle(0x3df2ff, 0.18).fillRect(a, GY + 4, b - a, 14); for (let x = a; x < b; x += 44) g.fillStyle(0x0a0f26, 1).fillRect(x, GY + 24, 2, VH); }
    for (let i = 0; i < GROUND.length - 1; i++) { const a = GROUND[i][1], b = GROUND[i + 1][0]; g.fillStyle(0x05060f, 1).fillRect(a, GY, b - a, VH - GY + 40); const gl = this.add.rectangle((a + b) / 2, VH - 16, b - a, 40, 0xff1a2a, 0.55).setDepth(2).setBlendMode(Phaser.BlendModes.ADD); this.tweens.add({ targets: gl, alpha: 0.2, duration: 400, yoyo: true, repeat: -1 }); g.fillStyle(0xff3040, 1).fillRect(a, GY, 3, VH - GY); g.fillStyle(0xff3040, 1).fillRect(b - 3, GY, 3, VH - GY); }
    // plataformas fijas (se cruzan desde abajo): [x, ancho, altura sobre el suelo]
    this.plats = []; const fixed = [[140, 100, 110], [650, 100, 120], [1410, 90, 100], [1530, 90, 200], [1770, 150, 260], [1960, 100, 120], [2110, 100, 230], [2260, 100, 120]];
    for (const [x, w, h] of fixed) this.addPlat(x, GY - h, w, g, false);
    this.movers = [{ x: 0, y: GY - 22, w: 100, kind: 'h', cx: 960, amp: 90, sp: 0.9, ph: 0 }, { x: 0, y: 0, w: 90, kind: 'v', cx: 1650, base: GY - 190, amp: 70, sp: 1.1, ph: 1 }];
    for (const m of this.movers) { m.s = this.add.rectangle(0, 0, m.w, 12, 0x0a0f26).setOrigin(0, 0).setDepth(3).setStrokeStyle(3, 0xffd24a); m.gl = this.add.rectangle(0, 0, m.w + 4, 8, 0xffd24a, 0.35).setOrigin(0, 0).setDepth(2).setBlendMode(Phaser.BlendModes.ADD); this.plats.push(m); m.mover = true; }
    // hitos y carteles
    this.flags = CHECK.map((x, i) => { const f = this.add.rectangle(x + (i ? 0 : 10), GY - 46, 4, 46, 0x3a4a80).setOrigin(0.5, 0).setDepth(2); const fl = this.add.triangle(x + (i ? 0 : 10) + 2, GY - 46, 0, 0, 22, 8, 0, 16, 0x3a4a80).setOrigin(0, 0).setDepth(2); return { f, fl, x, on: i === 0 }; });
    this.hint = this.add.text(300, GY - 120, '¡SALTA!', { ...FONT, fontSize: '18px', color: '#ffd24a', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5).setDepth(6); this.tweens.add({ targets: this.hint, y: GY - 108, duration: 400, yoyo: true, repeat: -1 });
    this.add.text(1000, GY - 160, 'PLATAFORMA MÓVIL ▶', { ...FONT, fontSize: '12px', color: '#ffd24a', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setDepth(6);
    this.add.text(1640, GY - 330, 'SUBE ▲', { ...FONT, fontSize: '14px', color: '#3df2ff', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setDepth(6);
    this.add.text(2140, GY - 330, '¡ZONA DEL JEFE!', { ...FONT, fontSize: '14px', color: '#ff7a8a', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setDepth(6);
    this.red = this.add.rectangle(0, VH / 2, VW + 40, VH, 0xff1a2a, 0.06).setDepth(8).setBlendMode(Phaser.BlendModes.ADD); this.tweens.add({ targets: this.red, alpha: 0.015, duration: 520, yoyo: true, repeat: -1 });
    // jugador
    const hp0 = Math.max(1, Math.round(100 * (this.d.hpFrac ?? 1)));
    this.pl = { x: 40, y: GY, vx: 0, vy: 0, on: true, face: 1, hp: hp0, t: 0, inv: 0, shot: 0, coy: 0, buf: 0, cp: 0, on_m: null };
    this.ps = this.add.image(0, 0, 'ph0').setOrigin(0.5, 1).setDepth(5).setScale(0.9);
    // jefe
    this.boss = { x: 2150, hp: 1400, max: 1400, t: 0, hit: 0, st: 'wait', stT: 2, phase: 1, inv: 0, dying: 0, face: -1, vx: 0, home: 2150, act: 'idle', n: 0 };
    this.bs = this.add.image(0, 0, 'pb0').setOrigin(0.5, 1).setDepth(4).setScale(1.25); this.bs.setVisible(true);
    this.bul = []; this.eb = []; this.waves = []; this.foes = []; this.zap = { st: 0, t: 0, side: 0 }; this.fxs = [];
    const mk = (kind, x, y) => ({ kind, x, y, y0: y, hp: kind === 'w' ? 24 : 16, dir: -1, t: Math.random() * 6, s: this.add.image(0, 0, kind === 'w' ? 'ew0' : 'em0').setOrigin(0.5, 1).setDepth(4).setScale(kind === 'w' ? 0.75 : 0.9), seg: kind === 'w' ? GROUND.findIndex(([a, b]) => x >= a && x <= b) : -1 });
    [[700, 'w'], [780, 'w'], [1220, 'w'], [330, 'm', GY - 130], [800, 'm', GY - 190], [1280, 'm', GY - 140]].forEach(([x, k, y]) => this.foes.push(mk(k, x, y || GY)));
    this.inArena = false; this.wallX = 0;
    this.hudObjs = [];
    this.hpg = this.add.graphics().setDepth(20);
    const T = (x, y, txt, size, col, org = [0.5, 0]) => { const t = this.add.text(0, 0, txt, { ...FONT, fontSize: size + 'px', color: col, stroke: '#000', strokeThickness: 4 }).setOrigin(...org).setDepth(21); this.hudObjs.push({ o: t, x, y }); return t; };
    this.tName = T(VW / 2, 12, 'SALA DE SERVIDORES', 14, '#3df2ff'); this.tTec = T(14, 54, 'TÉCNICO', 11, '#7fffd4', [0, 0]); this.tPh = T(VW / 2, 52, '', 12, '#ffd24a');
    this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,UP,SPACE,A,D,W,Z'); Object.values(this.keys).forEach((q) => q.reset());
    this.touch = { l: false, r: false, j: false, f: false };
    this.btn(36, VH - 40, '◀', 'l', 0x3df2ff); this.btn(98, VH - 40, '▶', 'r', 0x3df2ff); this.btn(VW - 98, VH - 40, 'SALTO', 'j', 0xffd24a); this.btn(VW - 36, VH - 40, 'FUEGO', 'f', 0xff3df0);
    this.camX = VW / 2; this.cam.centerOn(this.camX, VH / 2); this.intro('¡NIVEL DE JEFE!', 'CRUZA LOS HUECOS Y DERROTA A LA IMPRESORA', '#ffd24a'); if (Sfx.setMode) Sfx.setMode('boss');
    this.slow = 1;
  }
  addPlat(x, y, w, g) { this.plats.push({ x, y, w }); g.fillStyle(0x0a0f26, 1).fillRect(x, y, w, 12); g.fillStyle(0xff3df0, 1).fillRect(x, y, w, 3); g.fillStyle(0xff3df0, 0.22).fillRect(x - 2, y + 12, w + 4, 10); g.fillStyle(0x3df2ff, 0.9).fillRect(x + 6, y + 6, w - 12, 2); }
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
    const c = this.add.rectangle(0, 0, 56, 56, col, 0.16).setStrokeStyle(3, col, 0.95).setDepth(25).setInteractive();
    const t = this.add.text(0, 0, label, { ...FONT, fontSize: label.length > 2 ? '11px' : '22px', color: '#fff' }).setOrigin(0.5).setDepth(26); this.hudObjs.push({ o: c, x, y }, { o: t, x, y });
    c.on('pointerdown', () => { this.touch[key] = true; c.setFillStyle(col, 0.5); }); const up = () => { this.touch[key] = false; c.setFillStyle(col, 0.16); }; c.on('pointerup', up); c.on('pointerout', up);
  }
  spark(x, y, col, n = 6, sp = 30) { for (let i = 0; i < n; i++) { const s = this.add.rectangle(x, y, 4, 4, col).setDepth(9); this.tweens.add({ targets: s, x: x + Phaser.Math.Between(-sp, sp), y: y + Phaser.Math.Between(-sp, sp * 0.6), alpha: 0, duration: 320, onComplete: () => s.destroy() }); } }
  boom(x, y, col = 0xffaa33, big = 1) { const c = this.add.circle(x, y, 10 * big, col, 0.9).setDepth(9).setBlendMode(Phaser.BlendModes.ADD); this.tweens.add({ targets: c, scale: 3.2, alpha: 0, duration: 320, onComplete: () => c.destroy() }); this.spark(x, y, col, 10 * big, 50 * big); }
  hurt(n, kx) { const p = this.pl; if (p.inv > 0 || this.endT || this.fin) return; p.hp -= n; p.inv = 1; p.vy = -230; p.vx = kx * 140; p.on = false; this.spark(p.x, p.y - 40, 0xff2a3a, 8); this.cam.shake(140, 0.006); Sfx.play('hurt'); }
  respawn() { const p = this.pl; p.x = CHECK[p.cp]; p.y = this.GY; p.vx = p.vy = 0; p.inv = 1.5; this.boom(p.x, p.y - 30, 0x3df2ff); }
  solidAt(p) { return null; }
  say(txt, col) { const t = this.add.text(this.camX, this.GY - 200, txt, { ...FONT, fontSize: '20px', color: col, stroke: '#000', strokeThickness: 5 }).setOrigin(0.5).setDepth(40); this.tweens.add({ targets: t, y: t.y - 40, alpha: 0, duration: 1600, onComplete: () => t.destroy() }); }
  update(_, dms) {
    let dt = Math.min(dms, 50) / 1000; if (this.introT > 0) { this.introT -= dt; if (this.introT <= 0) this.ban.destroy(); return; }
    const p = this.pl, b = this.boss, GY = this.GY, k = this.keys, T = this.touch, VW = this.VW; dt *= this.slow;
    this.t = (this.t || 0) + dt; const t = this.t;
    // plataformas móviles
    for (const m of this.movers) { const ox = m.x, oy = m.y; if (m.kind === 'h') { m.x = m.cx + Math.sin(t * m.sp + m.ph) * m.amp - m.w / 2; m.dx = m.x - ox; m.dy = 0; } else { m.x = m.cx - m.w / 2; m.y = m.base + Math.sin(t * m.sp + m.ph) * m.amp; m.dx = 0; m.dy = m.y - oy; } m.s.setPosition(m.x, m.y); m.gl.setPosition(m.x - 2, m.y + 12); }
    // jugador
    const dead = this.endT > 0;
    const L = !dead && (k.LEFT.isDown || k.A.isDown || T.l), R = !dead && (k.RIGHT.isDown || k.D.isDown || T.r), J = !dead && (k.UP.isDown || k.W.isDown || T.j), F = !dead && (k.SPACE.isDown || k.Z.isDown || T.f);
    if (p.inv < 0.6) p.vx = ((R ? 1 : 0) - (L ? 1 : 0)) * 150; if ((R || L)) p.face = R ? 1 : -1;
    p.coy = p.on ? 0.09 : p.coy - dt; p.buf = J && !this.jHeld ? 0.1 : p.buf - dt; this.jHeld = J;
    if (p.buf > 0 && p.coy > 0) { p.vy = -560; p.on = false; p.coy = 0; p.buf = 0; p.on_m = null; Sfx.play('hit'); }
    if (!J && p.vy < -220) p.vy = -220;
    p.vy += 1100 * dt; const oy = p.y; p.x += p.vx * dt; if (p.on_m) p.x += p.on_m.dx || 0;
    p.x = Phaser.Math.Clamp(p.x, 14, LW - 14); if (this.inArena && p.x < this.wallX) p.x = this.wallX;
    p.y += p.vy * dt; const wasOn = p.on; p.on = false; p.on_m = null;
    if (p.vy >= 0 || (p.on_m)) {
      for (const pl of this.plats) { const top = pl.y; const prevTop = pl.mover && pl.dy ? top - pl.dy : top; if (p.x > pl.x - 4 && p.x < pl.x + pl.w + 4 && oy <= prevTop + 6 && p.y >= top) { p.y = top; p.vy = 0; p.on = true; p.on_m = pl.mover ? pl : null; } }
      for (const [a, c] of GROUND) if (p.x > a - 2 && p.x < c + 2 && oy <= GY + 6 && p.y >= GY) { p.y = GY; p.vy = 0; p.on = true; }
    }
    if (p.y > GY + 90 && !dead) { p.hp -= 15; Sfx.play('hurt'); this.cam.shake(200, 0.008); if (p.hp > 0) this.respawn(); else p.y = GY + 400; }
    for (let i = CHECK.length - 1; i > p.cp; i--) if (p.x > CHECK[i]) { p.cp = i; const f = this.flags[i]; if (!f.on) { f.on = true; f.f.setFillStyle(0x5df28a); f.fl.setFillStyle(0x5df28a); this.say('¡PUNTO DE CONTROL!', '#5df28a'); } }
    if (!this.inArena && p.x > 1965 && p.y >= GY - 2) { this.inArena = true; this.wallX = 1945; this.boss.st = 'wait'; this.boss.stT = 1.6; this.say('¡JEFE!', '#ff7a8a'); this.cam.flash(300, 255, 60, 60); Sfx.play('boss'); }
    p.t += dt * (p.vx && p.on ? 10 : 0); p.inv = Math.max(0, p.inv - dt); p.shot = Math.max(0, p.shot - dt);
    const fr = !p.on ? 4 : p.shot > 0 ? 5 : (Math.floor(p.t) & 3);
    this.ps.setPosition(p.x, p.y).setTexture('ph' + fr).setFlipX(p.face < 0).setAlpha(p.inv > 0 && Math.floor(p.inv * 20) % 2 ? 0.4 : 1);
    this.fire = (this.fire || 0) - dt; if (F && this.fire <= 0) { this.fire = 0.22; p.shot = 0.12; this.bul.push({ x: p.x + p.face * 30, y: p.y - 46, vx: p.face * 460, s: this.add.image(0, 0, 'pbl0').setAngle(90).setScale(0.32).setDepth(6) }); Sfx.play('key'); }
    // enemigos
    for (const e of this.foes) { if (e.dead) continue; e.t += dt; if (e.kind === 'w') { const [a, c] = GROUND[e.seg]; e.x += e.dir * 45 * dt; if (e.x < a + 20) e.dir = 1; if (e.x > c - 20) e.dir = -1; e.s.setPosition(e.x, GY).setTexture('ew' + (Math.floor(e.t * 6) & 3)).setFlipX(e.dir > 0); } else { e.x += e.dir * 55 * dt; if (Math.abs(e.x - (e.x0 ||= e.x)) > 130) e.dir *= -1; e.y = e.y0 + Math.sin(e.t * 3) * 18; e.s.setPosition(e.x, e.y).setTexture('em' + (Math.floor(e.t * 8) % 3)).setFlipX(e.dir > 0); }
      const hh = e.kind === 'w' ? 70 : 36; if (Math.abs(e.x - p.x) < 24 && p.y - 20 > e.y - hh && p.y - 60 < e.y) this.hurt(8, p.x < e.x ? -1 : 1); }
    // balas del jugador
    for (const q of this.bul) { q.x += q.vx * dt; q.s.setPosition(q.x, q.y); if (q.x < 0 || q.x > LW) q.dead = 1; else {
      for (const e of this.foes) if (!e.dead && Math.abs(q.x - e.x) < 26 && q.y > e.y - (e.kind === 'w' ? 75 : 40) && q.y < e.y) { q.dead = 1; e.hp -= 12 * (this.d.k || 1); this.spark(q.x, q.y, 0x3df2ff); if (e.hp <= 0) { e.dead = 1; e.s.destroy(); this.boom(e.x, e.y - 30, 0xffaa33); } break; }
      if (!q.dead && this.inArena && b.dying <= 0 && Math.abs(q.x - b.x) < 55 && q.y > GY - 135 && q.y < GY) { q.dead = 1; if (b.inv <= 0) { b.hp = Math.max(0, b.hp - 12 * (this.d.k || 1)); b.hit = 0.1; Sfx.play('hit'); } this.spark(q.x, q.y, b.inv > 0 ? 0xffffff : 0xffd24a, 5); } } }
    this.updateBoss(dt);
    // proyectiles enemigos
    for (const q of this.eb) { q.vy += (q.g ?? 300) * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.s.setPosition(q.x, q.y).setAngle(q.x * 4); if (q.y > GY) { q.dead = 1; this.spark(q.x, GY, 0xffffff); } else if (Math.abs(q.x - p.x) < 16 && Math.abs(q.y - (p.y - 40)) < 40) { q.dead = 1; this.hurt(10, q.vx > 0 ? 1 : -1); } }
    for (const w of this.waves) { w.x += w.dir * w.sp * dt; w.life -= dt; w.s.setPosition(w.x, GY).setAlpha(Math.min(1, w.life)); if (w.life <= 0) w.dead = 1; else if (Math.abs(w.x - p.x) < 24 && p.y > GY - 30) this.hurt(12, w.dir); }
    for (const a of [this.bul, this.eb, this.waves]) for (let i = a.length - 1; i >= 0; i--) if (a[i].dead) { a[i].s.destroy(); a.splice(i, 1); }
    if (p.hp <= 0 && !this.endT) { p.hp = 0; this.eb.forEach((q) => q.dead = 1); }
    // cámara
    const tgt = this.inArena ? LW - VW / 2 : Phaser.Math.Clamp(p.x + p.face * 30, VW / 2, LW - VW / 2 - 40); this.camX += (tgt - this.camX) * Math.min(1, dt * 7); this.cam.centerOn(this.camX, this.VH / 2);
    this.red.setPosition(this.camX, this.VH / 2);
    // HUD
    const ox = this.camX - VW / 2; for (const h of this.hudObjs) h.o.setPosition(ox + h.x, h.y);
    const h = this.hpg; h.clear(); h.fillStyle(0, 0.75).fillRect(ox + 12, 68, 130, 12); h.fillStyle(0x5df28a, 1).fillRect(ox + 14, 70, 126 * Math.max(0, p.hp) / 100, 8); h.lineStyle(2, 0x7fffd4, 1).strokeRect(ox + 12, 68, 130, 12);
    if (this.inArena) { this.tName.setText('LA IMPRESORA POSEÍDA').setColor('#ffd24a'); h.fillStyle(0, 0.75).fillRect(ox + 20, 34, VW - 40, 14); h.fillStyle(b.inv > 0 ? 0x888888 : 0xff2a3a, 1).fillRect(ox + 22, 36, (VW - 44) * b.hp / b.max, 10); h.fillStyle(0xffffff, 0.3).fillRect(ox + 22, 36, (VW - 44) * b.hp / b.max, 3); h.lineStyle(2, 0xffd24a, 1).strokeRect(ox + 20, 34, VW - 40, 14); for (const f of [0.66, 0.33]) h.fillStyle(0xffffff, 1).fillRect(ox + 22 + (VW - 44) * f, 34, 2, 14); this.tPh.setText('FASE ' + b.phase); }
    else { this.tName.setText('SALA DE SERVIDORES').setColor('#3df2ff'); h.fillStyle(0, 0.6).fillRect(ox + 20, 34, VW - 40, 8); h.fillStyle(0x3df2ff, 1).fillRect(ox + 22, 35, (VW - 44) * Math.min(1, p.x / 1900), 6); this.tPh.setText(''); }
    // zap visual
    if (this.zapG) this.zapG.clear(); else this.zapG = this.add.graphics().setDepth(3);
    if (this.zap.st) { const z = this.zapG, [x0, x1] = this.zapRange(); if (this.zap.st === 1) { z.fillStyle(0xffd24a, Math.floor(this.t * 12) % 2 ? 0.45 : 0.15).fillRect(x0, GY - 6, x1 - x0, 12); } else { z.fillStyle(0xffe14a, 0.6).fillRect(x0, GY - 14, x1 - x0, 14); z.lineStyle(3, 0xffffff, 1); for (let x = x0; x < x1; x += 30) { z.beginPath(); z.moveTo(x, GY); z.lineTo(x + 10, GY - 10 - Math.random() * 30); z.lineTo(x + 20, GY - Math.random() * 10); z.strokePath(); } } }
    this.checkEnd(dt / this.slow, b.dying > 0 || b.hp > 0 ? { hp: b.dying > 0 || b.hp > 0 ? 1 : 0 } : b, p, this.camX, this.VH / 2);
  }
  zapRange() { const z = this.zap; if (!this.boss) return [1945, 2260]; const m = (1945 + 2260) / 2; return z.side === 0 ? [1945, 2260] : z.side === 1 ? [1945, m] : [m, 2260]; }
  updateBoss(dt) {
    const b = this.boss, p = this.pl, GY = this.GY; b.t += dt; b.hit = Math.max(0, b.hit - dt); b.inv = Math.max(0, b.inv - dt);
    const sp = 1 + (b.phase - 1) * 0.25;
    if (b.dying > 0) { b.dying -= dt; if (Math.random() < 0.25) this.boom(b.x + Phaser.Math.Between(-60, 60), GY - Phaser.Math.Between(10, 120), [0xffaa33, 0xff4020, 0xffffff][Phaser.Math.Between(0, 2)], 1.4); this.bs.setPosition(b.x + Math.sin(b.t * 60) * 3, GY).setTint(0xff9999); if (b.dying <= 0) { b.hp = 0; this.slow = 1; this.cam.flash(500, 255, 255, 255); this.boom(b.x, GY - 60, 0xffd24a, 3); this.bs.setVisible(false); this.dead = true; this.endT = 0.01; this.winF = true; this.add.text(this.camX, this.GY - 200, '¡JEFE DERROTADO!', { ...FONT, fontSize: '30px', color: '#ffd24a', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5).setDepth(60); Sfx.play('boom'); this.endT = 2; } return; }
    if (b.hp <= 0 && !b.dead) { b.dying = 2.4; this.slow = 0.45; this.waves.forEach((w) => w.dead = 1); this.eb.forEach((q) => q.dead = 1); this.zap.st = 0; this.cam.shake(2000, 0.01); this.foes.filter((e) => e.kind === 'm' && !e.dead).forEach((e) => { e.dead = 1; e.s.destroy(); }); return; }
    if (b.dead) return;
    const ph = b.hp / b.max < 0.33 ? 3 : b.hp / b.max < 0.66 ? 2 : 1;
    if (ph !== b.phase) { b.phase = ph; b.inv = 1.4; b.st = 'wait'; b.stT = 1.6; b.vx = 0; this.zap.st = 0; this.waves.forEach((w) => w.dead = 1); this.slow = 0.35; this.time.delayedCall(260, () => { this.slow = 1; }); this.cam.flash(400, 255, 255, 255); this.cam.shake(500, 0.012); this.boom(b.x, GY - 70, 0xff4020, 2.2); this.say('¡FASE ' + ph + '!', ph === 3 ? '#ff2a3a' : '#ffd24a'); Sfx.play('boss'); }
    if (!this.inArena) { this.bs.setPosition(b.x, GY).setTexture('pb' + (Math.floor(b.t * 3) % 3)).setFlipX(false); return; }
    const near = Math.abs(p.x - b.x);
    b.stT -= dt * sp;
    if (b.st === 'wait') { b.face = p.x < b.x ? -1 : 1; if (b.stT <= 0) { const pool = ['volley', 'stomp', 'charge']; if (b.phase >= 2) pool.push('zap', 'summon'); if (b.phase === 3) pool.push('stomp', 'volley'); let a; do { a = pool[Phaser.Math.Between(0, pool.length - 1)]; } while (a === b.act && pool.length > 1); b.act = a; b.st = 'tele'; b.stT = a === 'charge' ? 0.9 : a === 'zap' ? 0.4 : 0.65; if (a === 'charge') { this.say('¡SALTA!', '#ff7a8a'); } } }
    else if (b.st === 'tele') { if (b.stT <= 0) { b.st = 'act'; this.doAct(); } }
    else if (b.st === 'act') {
      if (b.act === 'charge') { b.x += b.vx * dt * sp; if (b.x < 1990 && b.vx < 0) { b.vx = 130; this.cam.shake(250, 0.01); this.spark(b.x, GY, 0xffffff, 10, 50); } if (b.x > b.home && b.vx > 0) { b.x = b.home; b.st = 'wait'; b.stT = 1.1; b.vx = 0; } if (Math.abs(p.x - b.x) < 62 && p.y > GY - 70) this.hurt(15, p.x < b.x ? -1 : 1); }
      else if (b.act === 'zap') { this.zap.t -= dt; if (this.zap.st === 1 && this.zap.t <= 0) { this.zap.st = 2; this.zap.t = 1.6; this.cam.shake(300, 0.006); Sfx.play('zap'); } else if (this.zap.st === 2) { const [x0, x1] = this.zapRange(); this.zap.tick = (this.zap.tick || 0) - dt; if (p.on && !p.on_m && p.y >= GY - 1 && p.x > x0 && p.x < x1 && this.zap.tick <= 0) { this.hurt(10, 0); this.zap.tick = 0.5; } if (this.zap.t <= 0) { this.zap.st = 0; b.st = 'wait'; b.stT = 1.2; } } }
      else { if (b.stT <= -0.9) { b.st = 'wait'; b.stT = 1.1; } }
    }
    // dibujo del jefe
    const atk = b.st === 'tele' || (b.st === 'act' && b.act !== 'charge'); const fl = b.st === 'tele' && b.act === 'charge' && Math.floor(this.t * 14) % 2;
    const tex = atk ? 'pb3' : 'pb' + (Math.floor(b.t * (b.act === 'charge' && b.st === 'act' ? 10 : 4)) % 3);
    this.bs.setPosition(b.x, GY + Math.sin(b.t * 7) * 2).setTexture(tex).setFlipX(b.face > 0).setTint(b.inv > 0 && Math.floor(this.t * 20) % 2 ? 0x8888ff : fl ? 0xff4444 : b.hit > 0 ? 0xff9999 : 0xffffff);
    if (b.phase === 3) this.bs.setTint(b.hit > 0 ? 0xffffff : 0xffaaaa);
  }
  doAct() {
    const b = this.boss, GY = this.GY, p = this.pl;
    if (b.act === 'volley') { const n = b.phase === 3 ? 5 : b.phase === 2 ? 4 : 3; for (let i = 0; i < n; i++) { const a = Math.PI + (b.face > 0 ? Math.PI : 0) + (i - (n - 1) / 2) * 0.3; const dirx = b.face; this.eb.push({ x: b.x + dirx * 50, y: GY - 90, vx: dirx * (150 + i * 28), vy: -80 - i * 45, g: 300, s: this.add.image(0, 0, 'pbl2').setScale(0.3).setDepth(6) }); } Sfx.play('printer'); }
    else if (b.act === 'stomp') { this.cam.shake(300, 0.012); Sfx.play('hammer'); this.boom(b.x, GY, 0xffffff, 1.4); for (const d of [-1, 1]) { const r = this.add.image(0, 0, 'es0').setOrigin(0.5, 1).setScale(1.1).setDepth(6); this.waves.push({ x: b.x + d * 40, dir: d, sp: 200 + b.phase * 30, life: 4, s: r }); } if (b.phase === 3) this.time.delayedCall(700, () => { if (!b.dead && b.dying <= 0) for (const d of [-1, 1]) { const r = this.add.image(0, 0, 'es0').setOrigin(0.5, 1).setScale(1.3).setTint(0xff7a3a).setDepth(6); this.waves.push({ x: b.x + d * 40, dir: d, sp: 260, life: 4, s: r }); } }); b.st = 'act'; b.stT = 0; ; this.time.delayedCall(900, () => { if (b.st === 'act' && b.act === 'stomp') { b.st = 'wait'; b.stT = 1.0; } }); }
    else if (b.act === 'charge') { b.vx = -300; Sfx.play('boss'); }
    else if (b.act === 'zap') { this.zap.st = 1; this.zap.t = 1.1; this.zap.side = b.phase === 3 ? Phaser.Math.Between(1, 2) : 0; this.say('¡A LAS PLATAFORMAS!', '#ffd24a'); }
    else if (b.act === 'summon') { for (let i = 0; i < 2; i++) { const y = GY - 70 - i * 90; const e = { kind: 'm', x: b.x - 20, x0: b.x - 20, y, y0: y, hp: 16, dir: -1, t: Math.random() * 6, s: this.add.image(0, 0, 'em0').setOrigin(0.5, 1).setDepth(4).setScale(0.9), seg: -1, big: 1 }; this.foes.push(e); } this.boom(b.x, GY - 110, 0xff3df0, 1); }
  }
}
