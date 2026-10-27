import { ART } from '../sprites/Art.js';
import { Save } from '../systems/Save.js';
import { Sfx } from '../systems/Sfx.js';
import { txt, button, panel, fmtTime, uiScale, FONT } from '../systems/Widgets.js';
export class UIScene extends Phaser.Scene {
  constructor() { super('UI'); }
  init(d) { this.g = d.game; }
  create() {
    this.joy = null; this.portrait = null; this.bannerBg = null; this.tBanner = null; this.joyId = null; this.registry.set('joy', { x: 0, y: 0 }); this.overlay = null; this.pauseOv = null; this.bannerQ = [];
    this.gfx = this.add.graphics(); this.jg = this.add.graphics().setDepth(5);
    this.tTime = txt(this, 0, 0, '00:00', 26); this.tHp = txt(this, 0, 0, '', 13); this.tLv = txt(this, 0, 0, '', 14, '#ffd24a', { ox: 0 });
    this.tDmg = txt(this, 0, 0, '', 12, '#ffffff', { ox: 0 }); this.tBoss = txt(this, 0, 0, '', 13, '#ff8a8a'); this.tBanner = txt(this, 0, 0, '', 24, '#ffd24a').setAlpha(0).setDepth(20);
    this.tGoal = txt(this, 0, 0, '', 12, '#ffd24a'); this.tCombo = txt(this, 0, 0, '', 16, '#ff9ad0', { ox: 1 });
    this.dashBtn = this.add.circle(0, 0, 38, 0x1b2850, 0.7).setStrokeStyle(4, 0x7fd4ff).setInteractive().setDepth(6); this.dashTxt = txt(this, 0, 0, 'DASH', 13, '#ffffff').setDepth(7);
    this.dashBtn.on('pointerdown', () => { if (this.g.player && !this.overlay) this.g.player.dash(); });
    this.wIcons = []; this.pauseBtn = this.add.rectangle(0, 0, 10, 10, 0x1b2850, 0.9).setStrokeStyle(3, 0x9fd0ff).setInteractive(); this.pauseTxt = txt(this, 0, 0, '❚❚', 18);
    this.pauseBtn.on('pointerup', () => this.g.togglePause());
    this.input.on('pointerdown', (p, over) => { if (this.overlay || this.pauseOv || over.length || this.joyId !== null || this.g.over || p.x > this.scale.width * 0.62) return; this.joyId = p.id; this.joy = { x: p.x, y: p.y }; });
    this.input.on('pointermove', (p) => { if (this.joyId !== p.id || !this.joy) return; const R = 52 * this.u, dx = p.x - this.joy.x, dy = p.y - this.joy.y, d = Math.hypot(dx, dy); if (d > R) { this.joy.x = p.x - dx / d * R; this.joy.y = p.y - dy / d * R; } const m = Math.min(1, d / R); this.registry.set('joy', d < 6 ? { x: 0, y: 0 } : { x: dx / d * m, y: dy / d * m }); });
    const up = (p) => { if (p.id === this.joyId) { this.joyId = null; this.joy = null; this.registry.set('joy', { x: 0, y: 0 }); } };
    this.input.on('pointerup', up); this.input.on('pointerupoutside', up);
    ['ONE', 'TWO', 'THREE'].forEach((k, i) => this.input.keyboard.on('keydown-' + k, () => { if (this.cards && this.cards[i]) this.cards[i].fire(); }));
    this.layout(); this.scale.on('resize', this.layout, this); this.events.once('shutdown', () => this.scale.off('resize', this.layout, this));
  }
  layout() {
    const W = this.scale.width, H = this.scale.height, u = this.u = uiScale(this);
    this.tTime.setPosition(W / 2, 34 * u).setFontSize(22 * u); this.tLv.setPosition(58 * u, 25 * u).setFontSize(13 * u);
    this.tHp.setFontSize(12 * u); this.tDmg.setPosition(14 * u, 92 * u).setFontSize(12 * u); this.tBoss.setPosition(W / 2, 128 * u).setFontSize(13 * u);
    this.tGoal.setPosition(W / 2, 62 * u).setFontSize(12 * u); this.tCombo.setPosition(W - 14 * u, 64 * u).setFontSize(16 * u); this.dashBtn.setPosition(W - 74 * u, H - 78 * u).setRadius(38 * u); this.dashTxt.setPosition(W - 74 * u, H - 78 * u).setFontSize(12 * u);
    this.tBanner.setPosition(W / 2, H * 0.28).setFontSize(24 * u).setWordWrapWidth(W - 20); this.pauseBtn.setPosition(W - 28 * u, 26 * u).setSize(40 * u, 40 * u); this.pauseTxt.setPosition(W - 28 * u, 26 * u).setFontSize(16 * u);
  }
  banner(s) {
    if (!this.bannerBg) this.bannerBg = this.add.rectangle(0, 0, 10, 10, 0x0b1020, 0.82).setStrokeStyle(3, 0xffd24a).setDepth(19);
    this.tBanner.setText(s).setAlpha(1).setColor('#ffffff'); const bb = this.tBanner.getBounds();
    this.bannerBg.setPosition(this.tBanner.x, this.tBanner.y).setSize(bb.width + 28, bb.height + 18).setAlpha(1).setVisible(true);
    this.tweens.killTweensOf(this.tBanner); this.tweens.killTweensOf(this.bannerBg);
    this.tweens.add({ targets: [this.tBanner, this.bannerBg], alpha: 0, delay: 1800, duration: 500 });
  }
  update() {
    const g = this.g, p = g.player, W = this.scale.width, u = this.u, gf = this.gfx; if (!p) return; gf.clear();
    // XP (barra superior redondeada)
    const xw = W - 16 * u, xr = Phaser.Math.Clamp(p.xp / p.xpNext, 0, 1);
    gf.fillStyle(0x0a1020, 0.7).fillRoundedRect(8 * u, 5 * u, xw, 11 * u, 5 * u);
    if (xr > 0.01) { gf.fillGradientStyle(0x34e6ff, 0x34e6ff, 0x3b7bff, 0x3b7bff, 1).fillRoundedRect(9 * u, 6 * u, Math.max(10 * u, (xw - 2 * u) * xr), 9 * u, 4 * u); gf.fillStyle(0xffffff, 0.35).fillRoundedRect(12 * u, 7 * u, Math.max(6 * u, (xw - 8 * u) * xr), 2.5 * u, 1); }
    gf.lineStyle(2, 0x9fd0ff, 0.9).strokeRoundedRect(8 * u, 5 * u, xw, 11 * u, 5 * u);
    // Retrato + vida
    const hx = 58 * u, hy = 40 * u, hw = 86 * u, hh = 18 * u, low = p.hp / p.maxHp < 0.3, hr = Phaser.Math.Clamp(p.hp / p.maxHp, 0, 1);
    gf.fillStyle(0x0a1020, 0.75).fillRoundedRect(8 * u, 22 * u, hx + hw - 2 * u, 52 * u, 14 * u).lineStyle(2, 0x9fd0ff, 0.9).strokeRoundedRect(8 * u, 22 * u, hx + hw - 2 * u, 52 * u, 14 * u);
    gf.fillStyle(0x1b2850, 1).fillCircle(34 * u, 48 * u, 21 * u).lineStyle(3, 0xffd24a, 1).strokeCircle(34 * u, 48 * u, 21 * u);
    gf.fillStyle(0x3a0f18, 1).fillRoundedRect(hx, hy, hw, hh, 9 * u);
    if (hr > 0.01) { gf.fillGradientStyle(low ? 0xff6a5a : 0x7dff8a, low ? 0xff6a5a : 0x7dff8a, low ? 0xc01818 : 0x1fb04a, low ? 0xc01818 : 0x1fb04a, 1).fillRoundedRect(hx, hy, Math.max(12 * u, hw * hr), hh, 9 * u); gf.fillStyle(0xffffff, 0.3).fillRoundedRect(hx + 4 * u, hy + 2 * u, Math.max(6 * u, hw * hr - 8 * u), 4 * u, 2); }
    gf.lineStyle(2, 0x0a1020, 1).strokeRoundedRect(hx, hy, hw, hh, 9 * u);
    if (!this.portrait) this.portrait = this.add.image(0, 0, p.texKey + '_0').setDepth(2);
    this.portrait.setTexture(p.texKey + '_0'); const pi = this.textures.get(p.texKey + '_0').getSourceImage(); this.portrait.setPosition(34 * u, 48 * u).setScale(Math.min(34 * u / pi.width, 38 * u / pi.height) * (ART.has.has(p.texKey) ? 1.15 : 1)).setCrop(0, 0, pi.width, pi.height * 0.62);
    gf.fillStyle(0x0a1020, 0.7).fillRoundedRect(W / 2 - 46 * u, 18 * u, 92 * u, 32 * u, 14 * u).lineStyle(2, 0x9fd0ff, 0.9).strokeRoundedRect(W / 2 - 46 * u, 18 * u, 92 * u, 32 * u, 14 * u);
    gf.fillStyle(0x0a1020, 0.55).fillRoundedRect(8 * u, 78 * u, 104 * u, 34 * u, 10 * u);
    this.tHp.setPosition(hx + hw / 2, hy + hh / 2 + 1).setText(Math.ceil(p.hp) + ' / ' + Math.round(p.maxHp)); this.tLv.setText('NV ' + p.level);
    this.tTime.setText(fmtTime(g.t)); this.tDmg.setText('DAÑO ' + Math.round(p.damageDealt).toLocaleString('es-ES') + '\nBAJAS ' + g.kills);
    const b = g.bosses[0]; if (b && !b.dead) { const bw = Math.min(W * 0.7, 360 * u), bx = W / 2 - bw / 2, by = 140 * u; gf.fillStyle(0x000000, 0.7).fillRect(bx - 2, by - 2, bw + 4, 14 * u + 4); gf.fillStyle(0xd02030, 1).fillRect(bx, by, bw * Math.max(0, b.hp / b.maxHp), 14 * u); this.tBoss.setText(b.def.name).setVisible(true); } else this.tBoss.setVisible(false);
    // iconos de armas
    const ws = p.weapons; while (this.wIcons.length < ws.length) this.wIcons.push({ im: this.add.image(0, 0, 'gem'), t: txt(this, 0, 0, '', 11, '#ffd24a') });
    this.wIcons.forEach((o, i) => { const w = ws[i]; o.im.setVisible(!!w); o.t.setVisible(!!w); if (!w) return; const x = 24 * u + i * 38 * u, y = this.scale.height - 28 * u; o.im.setTexture(w.def.icon).setPosition(x, y).setScale(ART.fitS(this, w.def.icon, 30 * u, 2.4 * u)).setAlpha(w.blocked ? 0.3 : 1); o.t.setPosition(x + 10 * u, y + 14 * u).setText(w.evolved ? '★' : String(w.level)); });
    this.tGoal.setText(g.goalText || ''); this.tCombo.setText(g.combo >= 5 ? 'COMBO x' + g.combo : '').setAlpha(Math.min(1, g.comboT + 0.2));
    { const cd = Phaser.Math.Clamp((p.dashCd || 0) / 1.5, 0, 1), bx = this.dashBtn.x, by = this.dashBtn.y, br = 38 * u; this.dashBtn.setAlpha(cd > 0 ? 0.5 : 1).setStrokeStyle(4, cd > 0 ? 0x556080 : 0x7fd4ff); if (cd > 0) { gf.fillStyle(0x7fd4ff, 0.35).slice(bx, by, br, -Math.PI / 2, -Math.PI / 2 + (1 - cd) * Math.PI * 2, false).fillPath(); } }
    const jg = this.jg; jg.clear(); if (this.joy && this.joyId !== null) { const o = this.registry.get('joy'); const ox = this.joy.x - o.x * 52 * u, oy = this.joy.y - o.y * 52 * u; jg.lineStyle(3, 0xffffff, 0.5).strokeCircle(ox, oy, 52 * u); jg.fillStyle(0xffffff, 0.12).fillCircle(ox, oy, 52 * u); jg.fillStyle(0x7fd4ff, 0.6).fillCircle(this.joy.x, this.joy.y, 22 * u); }
  }
  showLevelUp(choices, cb) {
    const W = this.scale.width, H = this.scale.height, u = this.u, items = [];
    const dim = this.add.rectangle(0, 0, W, H, 0x050814, 0.82).setOrigin(0).setInteractive(); items.push(dim);
    const title = txt(this, W / 2, H * 0.1, '¡SUBES DE NIVEL!', 28 * u, '#ffd24a'); items.push(title);
    const land = W > H * 1.15, n = choices.length, cw = land ? Math.min(W / n - 20, 250 * u) : Math.min(W - 28, 420 * u), ch = land ? 230 * u : Math.min(110 * u, (H * 0.8 - 20) / n - 12);
    this.lockUntil = performance.now() + 800; this.cards = []; this.joyId = null; this.joy = null; this.registry.set('joy', { x: 0, y: 0 });
    choices.forEach((c, i) => {
      const x = land ? W / 2 + (i - (n - 1) / 2) * (cw + 14) : W / 2, y = land ? H * 0.52 : H * 0.2 + (i + 0.5) * (ch + 10) + 20 * u;
      const col = c.kind === 'evo' ? 0xffd24a : c.kind === 'weapon' || c.kind === 'new' ? 0x7fd4ff : c.kind === 'passive' ? 0xff9ad0 : 0x7aff9a;
      const bg = this.add.rectangle(x, y, cw, ch, 0x16233f, 0.98).setStrokeStyle(4, col).setInteractive({ useHandCursor: true });
      const ic = this.add.image(land ? x : x - cw / 2 + 42 * u, land ? y - ch * 0.28 : y, c.icon).setScale(ART.fitS(this, c.icon, 52 * u, 4.2 * u));
      const tag = txt(this, land ? x : x + cw / 2 - 8 * u, land ? y - ch / 2 + 14 * u : y - ch / 2 + 12 * u, c.tag + '  [' + (i + 1) + ']', 10 * u, '#' + col.toString(16).padStart(6, '0'), { ox: land ? 0.5 : 1 });
      const tt = txt(this, land ? x : x + 28 * u, land ? y + ch * 0.02 : y - 12 * u, c.title, 15 * u, '#ffffff', { style: { align: land ? 'center' : 'left', wordWrap: { width: land ? cw - 16 : cw - 110 * u } }, ox: land ? 0.5 : 0.5 });
      const dd = txt(this, land ? x : x + 28 * u, land ? y + ch * 0.28 : y + 18 * u, c.desc, 11 * u, '#cfe3ff', { style: { align: land ? 'center' : 'left', wordWrap: { width: land ? cw - 16 : cw - 110 * u }, strokeThickness: 2 } });
      let fired = false; const fire = () => { if (fired) return; fired = true; Sfx.play('click'); items.forEach((o) => o.destroy()); this.overlay = null; this.cards = null; cb(c); };
      let downId = null; bg.on('pointerdown', (p) => { downId = performance.now() < this.lockUntil ? null : p.id; }); bg.on('pointerout', () => { downId = null; }); bg.on('pointerup', (p) => { if (downId !== null && downId === p.id && performance.now() >= this.lockUntil) fire(); downId = null; }); this.cards.push(location.search.includes('debug') ? { fire, c } : { fire }); items.push(bg, ic, tag, tt, dd);
    });
    items.forEach((o, i) => o.setDepth(30 + (i > 1 ? 1 : 0))); this.overlay = items; items.forEach((o, i) => { if (i > 1 && o.setAlpha) { o.setAlpha(0.45); this.tweens.add({ targets: o, alpha: 1, delay: 800, duration: 150 }); } });
  }
  setPaused(on) {
    if (this.pauseOv) { this.pauseOv.forEach((o) => o.destroy()); this.pauseOv = null; }
    if (!on) return; const W = this.scale.width, H = this.scale.height, u = this.u, it = [];
    it.push(this.add.rectangle(0, 0, W, H, 0x050814, 0.8).setOrigin(0).setInteractive());
    it.push(txt(this, W / 2, H * 0.22, 'PAUSA', 38 * u, '#7fd4ff'));
    const s = Save.get();
    it.push(button(this, W / 2, H * 0.36, 230 * u, 52 * u, '▶  CONTINUAR', () => this.g.togglePause(), { fill: 0x1fa84a, size: 22 * u }));
    const m = button(this, W / 2, H * 0.36 + 64 * u, 230 * u, 46 * u, s.muted ? 'SONIDO: NO' : 'SONIDO: SÍ', () => { s.muted = !s.muted; Sfx.setMuted(s.muted); Save.write(); m.setLabel(s.muted ? 'SONIDO: NO' : 'SONIDO: SÍ'); }, { size: 16 * u }); it.push(m);
    it.push(button(this, W / 2, H * 0.36 + 120 * u, 230 * u, 46 * u, 'ABANDONAR PARTIDA', () => { this.g.endRun(false); this.setPaused(false); }, { fill: 0xb02030, size: 15 * u }));
    it.push(txt(this, W / 2, H * 0.36 + 176 * u, 'Mover: WASD / flechas / joystick táctil\nPausa: ESC o P', 12 * u, '#cfe3ff', { style: { align: 'center' } }));
    it.forEach((o) => o.setDepth(40)); this.pauseOv = it;
  }
}
