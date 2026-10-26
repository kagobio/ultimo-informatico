import { ART } from '../sprites/Art.js';
import { WORLD, MAX_ENEMIES, DEBUG } from '../config.js';
import { Save } from '../systems/Save.js';
import { Sfx } from '../systems/Sfx.js';
import { Fx } from '../systems/Fx.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { initAI, updateAI } from '../entities/EnemyAI.js';
import { createWeapon } from '../weapons/index.js';
import { CHARACTERS, MAPS, ENEMIES, BOSSES, WEAPONS, PASSIVES, STAT_UPS } from '../data/content.js';

const CELL = 64, GW = Math.ceil(WORLD / CELL) + 2;
const rnd = (a, b) => a + Math.random() * (b - a);

export class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }
  create() {
    Sfx.init();
    const save = this.save = Save.get(); const map = this.map = MAPS[save.map] || MAPS.oficina;
    this.t = 0; this.kills = 0; this.over = false; this.paused = false; this.userPaused = false; this.levelUpOpen = false;
    this.pending = 0; this.chips = 0; this.nextBoss = 0; this.bossesKilled = 0; this.bosses = []; this.timeScale = 1; this.god = false;
    this.budget = 0; this.swarmT = 40; this.laterQ = []; this.victoryT = 0;
    this.enemies = []; this.pool = []; this.pprojs = []; this.ppFree = []; this.ebs = []; this.ebFree = []; this.zones = []; this.beams = []; this.pickups = []; this.pkFree = [];
    this.cellStart = new Int32Array(GW * GW + 2); this.cellItems = new Array(MAX_ENEMIES + 80);
    this.hpScale = 1; this.dmgScale = 1;
    this.cameras.main.setBackgroundColor(map.bg).setRoundPixels(true);
    // Suelo isométrico + muros
    this.floor = this.add.tileSprite(0, 0, WORLD / 1.5, WORLD / 3 * 1.0, 'floor').setOrigin(0, 0).setTileScale(ART.has.has('floor') ? 0.75 : 1.5).setTint(map.floor).setDepth(-1e5);
    this.floor.setSize(WORLD, WORLD);
    const wl = this.add.graphics().setDepth(-9e4);
    wl.fillStyle(0x2a3350, 1).fillRect(-80, -90, WORLD + 160, 90).fillRect(-80, WORLD, WORLD + 160, 70).fillRect(-80, 0, 80, WORLD).fillRect(WORLD, 0, 80, WORLD);
    wl.fillStyle(0x4a5578, 1).fillRect(-80, -20, WORLD + 160, 20).fillRect(-80, WORLD, WORLD + 160, 10);
    wl.fillStyle(0xffd24a, 1); for (let i = -80; i < WORLD + 80; i += 80) { wl.fillRect(i, -8, 40, 8); wl.fillRect(i, WORLD, 40, 6); }
    this.decorate();
    this.zoneGfx = this.add.graphics().setDepth(-5e4);
    this.fx = new Fx(this);
    const cid = save.char in CHARACTERS ? save.char : 'tecnico';
    this.player = new Player(this, cid, save);
    this.addWeapon(CHARACTERS[cid].weapon);
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.applyZoom(); this.scale.on('resize', this.applyZoom, this);
    const kb = this.input.keyboard;
    this.keys = kb.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,ESC,P,M,ONE,TWO,THREE');
    const autoPause = () => { if (!this.over && !this.levelUpOpen && !this.userPaused) { this.userPaused = true; this.paused = true; this.scene.get('UI').setPaused(true); } };
    this.game.events.on('hidden', autoPause); this.game.events.on('blur', autoPause);
    this.events.once('shutdown', () => { this.game.events.off('hidden', autoPause); this.game.events.off('blur', autoPause); });
    kb.on('keydown-ESC', () => this.togglePause()); kb.on('keydown-P', () => this.togglePause());
    kb.on('keydown-M', () => { save.muted = !save.muted; Sfx.setMuted(save.muted); Save.write(); });
    this.input.addPointer(2);
    this.scene.launch('UI', { game: this });
    Sfx.setMuted(!!save.muted); Sfx.startMusic('normal'); Sfx.setMode('normal');
    this.events.once('shutdown', () => { this.scale.off('resize', this.applyZoom, this); Sfx.stopMusic(); });
    if (DEBUG) window.__uig = this;
    this.announce('LUNES 08:00 · ' + map.name.toUpperCase());
    this.fx.say(this.player, 'Otra vez el servidor…', 2.4, 12);
  }
  applyZoom() { const w = this.scale.width, h = this.scale.height; this.cameras.main.setZoom(Phaser.Math.Clamp(Math.min(w, h) / 360, 1.0, 2.6)); }
  decorate() {
    const props = this.map.props, cx = WORLD / 2, g = this.add.graphics().setDepth(-9e4), W = WORLD;
    const accent = { oficina: 0x6f8fd8, cpd: 0x2fd0ff, impresoras: 0xe0a060, openspace: 0x58c87a, global: 0xb06af0 }[this.save.map] || 0x6f8fd8;
    // alfombras/zonas en rombo
    for (let k = 0; k < 9; k++) { const x = rnd(250, W - 250), y = rnd(300, W - 200), w = rnd(160, 300), h = w / 2; g.fillStyle(accent, 0.22).fillPoints([{ x, y: y - h }, { x: x + w, y }, { x, y: y + h }, { x: x - w, y }], true); g.lineStyle(4, accent, 0.5).strokePoints([{ x, y: y - h }, { x: x + w, y }, { x, y: y + h }, { x: x - w, y }], true); }
    // pared del fondo con ventanas y zócalo, paredes laterales y borde inferior
    g.fillStyle(0x3a4468, 1).fillRect(-200, -300, W + 400, 300 + 40); g.fillStyle(0x56648f, 1).fillRect(-200, -300, W + 400, 250);
    g.fillStyle(0x1b2238, 1).fillRect(-200, 30, W + 400, 14);
    for (let x = 60; x < W; x += 170) { g.fillStyle(0x0b1020, 1).fillRect(x - 4, -196, 108, 108); g.fillStyle(0x9fd8ff, 1).fillRect(x, -192, 100, 100); g.fillStyle(0xffffff, 0.35).fillRect(x + 6, -186, 30, 88); g.fillStyle(0x0b1020, 1).fillRect(x + 48, -192, 4, 100); }
    g.fillStyle(0x2a3254, 1).fillRect(-200, 0, 200, W + 200).fillRect(W, 0, 200, W + 200).fillRect(-200, W, W + 400, 300);
    g.fillStyle(0x1b2238, 1).fillRect(-14, 0, 14, W).fillRect(W, 0, 14, W).fillRect(0, W, W, 14);
    let n = 0, tries = 0; const placed = [], step = [[56, 28], [-56, 28], [56, -28]];
    while (n < 120 && tries++ < 900) {
      const x = rnd(120, W - 120), y = rnd(140, W - 100);
      if ((x - cx) ** 2 + (y - cx) ** 2 < 260 * 260) continue;
      if (placed.some((q) => (q[0] - x) ** 2 + (q[1] - y) ** 2 < 130 * 130)) continue;
      placed.push([x, y]); const k = props[Math.floor(Math.random() * props.length)], d = step[Math.floor(Math.random() * 3)], cnt = (k === 'prop_desk' || k === 'prop_rack' || k === 'prop_printer') ? 3 : 1;
      for (let m = 0; m < cnt; m++) { const px = x + d[0] * m * 1.5, py = y + d[1] * m * 1.5; if (px > W - 60 || py > W - 40 || px < 60) break; g.fillStyle(0x000000, 0.25).fillEllipse(px, py - 2, 80, 22); this.add.image(px, py, k).setOrigin(0.5, 1).setScale(ART.scale(k, 3)).setDepth(py); n++; }
    }
  }
  sfx(n) { Sfx.play(n); }
  announce(text) { const ui = this.scene.get('UI'); if (ui && ui.tBanner && ui.tBanner.active && ui.tBanner.scene) ui.banner(text); else this.time.delayedCall(120, () => { if (!this.over) this.announce(text); }); }
  later(sec, fn) { this.laterQ.push({ t: sec, fn }); }
  addWeapon(id) { const w = createWeapon(this, id); this.player.weapons.push(w); return w; }
  // ---------- Consultas espaciales ----------
  rebuildGrid() {
    const cs = this.cellStart, items = this.cellItems, arr = this.enemies; cs.fill(0);
    const cell = (e) => { const cx = Math.min(GW - 1, Math.max(0, (e.x / CELL) | 0)), cy = Math.min(GW - 1, Math.max(0, (e.y / CELL) | 0)); return cy * GW + cx; };
    for (let i = 0; i < arr.length; i++) { arr[i].cell = cell(arr[i]); cs[arr[i].cell + 1]++; }
    for (let i = 1; i < cs.length; i++) cs[i] += cs[i - 1];
    const fill = this.fillTmp || (this.fillTmp = new Int32Array(GW * GW + 2)); fill.set(cs);
    for (let i = 0; i < arr.length; i++) items[fill[arr[i].cell]++] = arr[i];
  }
  forEachNear(x, y, r, fn) {
    const cs = this.cellStart, items = this.cellItems;
    const x0 = Math.max(0, ((x - r) / CELL) | 0), x1 = Math.min(GW - 1, ((x + r) / CELL) | 0), y0 = Math.max(0, ((y - r) / CELL) | 0), y1 = Math.min(GW - 1, ((y + r) / CELL) | 0);
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) { const c = cy * GW + cx; for (let k = cs[c], end = cs[c + 1]; k < end; k++) { const e = items[k]; if (!e.dead) fn(e); } }
  }
  nearest(x, y, maxR = 1e9, skip = null) {
    let best = null, bd = maxR * maxR; const arr = this.enemies;
    for (let i = 0; i < arr.length; i++) { const e = arr[i]; if (e.dead || (skip && skip.includes(e))) continue; const d = (e.x - x) ** 2 + (e.y - y) ** 2; if (d < bd) { bd = d; best = e; } }
    return best;
  }
  // ---------- Enemigos ----------
  spawnEnemy(key, x, y, boss) {
    if (!boss && this.enemies.length >= MAX_ENEMIES + 40) return null;
    const def = boss || ENEMIES[key]; let e = this.pool.pop(); if (!e) e = new Enemy(this);
    e.setup(def, x, y, boss ? this.map.diff : this.hpScale, !!boss); initAI(e);
    if (boss) { e.dmg = def.dmg * this.dmgScale; }
    this.enemies.push(e); return e;
  }
  spawnRingPos() {
    const cam = this.cameras.main, p = this.player, R = Math.hypot(cam.worldView.width, cam.worldView.height) / 2 + 50;
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * 6.283, x = p.x + Math.cos(a) * R, y = p.y + Math.sin(a) * R;
      if (x > 30 && x < WORLD - 30 && y > 30 && y < WORLD - 30) return [x, y];
    }
    const a = Math.random() * 6.283; return [Phaser.Math.Clamp(p.x + Math.cos(a) * R, 30, WORLD - 30), Phaser.Math.Clamp(p.y + Math.sin(a) * R, 30, WORLD - 30)];
  }
  damageEnemy(e, amt, o = {}) {
    if (e.dead) return; const p = this.player;
    const crit = Math.random() < p.crit; if (crit) amt *= 2;
    e.hp -= amt; p.damageDealt += amt;
    if (!o.quiet) this.fx.dmg(e.x, e.y - e.h, amt, crit);
    e.sprite.setTintFill(0xffffff); e.flash = 0.06;
    if (o.kb) { const dx = e.x - (o.sx ?? p.x), dy = e.y - (o.sy ?? p.y), d = Math.hypot(dx, dy) || 1, k = o.kb * (e.isBoss ? 0.08 : 1); e.kx += dx / d * k; e.ky += dy / d * k; }
    this.fx.burst('hit', e.x, e.y, crit ? 6 : 3); Sfx.play('hit');
    if (e.hp <= 0) this.killEnemy(e);
  }
  killEnemy(e) {
    if (e.dead) return; e.dead = true; e.sprite.setVisible(false); this.kills++;
    this.fx.burst(e.isBoss ? 'boom' : 'dust', e.x, e.y, e.isBoss ? 40 : 7); Sfx.play('kill');
    if (e.isBoss) {
      this.bosses = this.bosses.filter((b) => b !== e); this.bossesKilled++; Sfx.play('boom'); this.cameras.main.shake(400, 0.012); this.fx.ring(e.x, e.y, 320, 0xffd24a, 0.7);
      if (e.def.id === 'user') { this.victoryT = 2.2; this.announce('¡INFRAESTRUCTURA RESTABLECIDA!'); for (const o of this.enemies) if (!o.dead && o !== e) { o.dead = true; o.sprite.setVisible(false); this.fx.burst('digital', o.x, o.y, 4); } }
      else { this.dropPickup('chest', e.x, e.y, 1); this.announce('¡' + e.def.name + ' DERROTADO!'); Sfx.setMode('normal'); if (this.bosses.length === 0) Sfx.mode = 'normal'; }
      for (let i = 0; i < 14; i++) this.dropPickup('gem', e.x + rnd(-50, 50), e.y + rnd(-40, 40), e.def.xp / 14);
      return;
    }
    this.dropPickup('gem', e.x, e.y, e.def.xp);
    const r = Math.random(); if (r < 0.012) this.dropPickup('coffee', e.x, e.y, 25); else if (r < 0.035) this.dropPickup('chip', e.x, e.y, 1);
  }
  // ---------- Pickups ----------
  dropPickup(type, x, y, v) {
    if (type === 'gem' && this.pickups.length > 260) { const g = this.pickups.find((q) => q.type === 'gem'); if (g) { g.v += v; this.tintGem(g); return; } }
    let q = this.pkFree.pop(); if (!q) q = { im: this.add.image(0, 0, 'gem') };
    q.type = type; q.v = v; q.x = x; q.y = y; q.mag = false; q.t = 0;
    q.im.setTexture(type === 'gem' ? 'gem' : type).setVisible(true).setScale(ART.scale(type, type === 'chest' ? 3.4 : 2.6)).clearTint();
    if (type === 'gem') this.tintGem(q);
    this.pickups.push(q);
  }
  tintGem(q) { const k = ART.has.has('gem') ? 0.8 : 1; q.im.setScale((q.v >= 20 ? 4 : q.v >= 5 ? 3.4 : 2.6) * (ART.has.has('gem') ? 0.62 : 1) * k); if (q.v >= 20) q.im.setTint(0xffd24a); else if (q.v >= 5) q.im.setTint(0xff7aff); else if (q.v >= 2) q.im.setTint(0x7aff9a); else q.im.clearTint(); }
  updatePickups(dt) {
    const p = this.player;
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const q = this.pickups[i]; q.t += dt;
      const dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
      const mr = q.type === 'chest' ? 60 : p.magnet; if (d2 < mr * mr) q.mag = true;
      if (q.mag) { const d = Math.sqrt(d2) || 1, sp = 340 + q.t * 0; q.x += dx / d * sp * dt; q.y += dy / d * sp * dt; }
      q.im.setPosition(q.x, q.y + Math.sin(q.t * 5 + i) * 1.5).setDepth(q.y - 5);
      if (d2 < 22 * 22) {
        if (q.type === 'gem') { this.addXp(q.v); Sfx.play('gem'); }
        else if (q.type === 'coffee') { p.heal(q.v); this.fx.dmg(p.x, p.y - 40, q.v, false, '#6aff8a'); Sfx.play('coin'); }
        else if (q.type === 'chip') { this.chips++; Sfx.play('coin'); }
        else if (q.type === 'chest') { p.heal(p.maxHp * 0.3); this.pending++; this.announce('¡CAJA DE HERRAMIENTAS!'); Sfx.play('levelup'); }
        q.im.setVisible(false); this.pickups.splice(i, 1); this.pkFree.push(q);
      }
    }
  }
  addXp(v) {
    const p = this.player; p.xp += v * p.xpMult;
    while (p.xp >= p.xpNext) { p.xp -= p.xpNext; p.level++; p.xpNext = Player.need(p.level); this.pending++; }
  }
  // ---------- Proyectiles ----------
  spawnPProj(c) {
    let p = this.ppFree.pop(); if (!p) p = { im: this.add.image(0, 0, c.tex), hit: [] };
    Object.assign(p, { x: c.x, y: c.y, vx: c.vx, vy: c.vy, dmg: c.dmg, pierce: c.pierce || 0, bounce: c.bounce || 0, life: c.life || 1, r: c.r || 6, spin: c.spin || 0, align: !!c.align, aoe: c.aoe || 0, aoeDmg: c.aoeDmg || 0, speed: c.speed || 0, dead: false });
    p.hit.length = 0; p.im.setTexture(c.tex).setScale(ART.scale(c.tex, c.scale || 2.5)).setVisible(true).setAlpha(1).setFlipY(false); p.art = ART.has.has(c.tex);
    if (c.tint) p.im.setTint(c.tint); else p.im.clearTint();
    if (p.align) p.im.setRotation(Math.atan2(p.vy, p.vx) + (p.art ? 0 : Math.PI / 2)); else p.im.setRotation(0);
    if (p.art && p.vx < 0) p.im.setFlipY(p.align);
    this.pprojs.push(p); return p;
  }
  killP(p) { if (p.dead) return; p.dead = true; if (p.aoe) this.explode(p.x, p.y, p.aoe, p.aoeDmg, { kb: 160, sfx: 'boom', color: 'boom' }); }
  updateProjectiles(dt) {
    for (let i = this.pprojs.length - 1; i >= 0; i--) {
      const p = this.pprojs[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.spin) p.im.rotation += p.spin * dt;
      p.im.setPosition(p.x, p.y).setDepth(p.y + 40);
      if (p.life <= 0) this.killP(p);
      else this.forEachNear(p.x, p.y, p.r + 26, (e) => {
        if (p.dead || p.hit.includes(e)) return; const rr = e.r + p.r; if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 > rr * rr) return;
        p.hit.push(e); this.damageEnemy(e, p.dmg, { kb: 110, sx: p.x - p.vx * 0.05, sy: p.y - p.vy * 0.05 });
        if (p.aoe) { this.killP(p); return; }
        if (p.bounce > 0) { const n = this.nearest(e.x, e.y, 280, p.hit); if (n) { p.bounce--; const a = Math.atan2(n.y - e.y, n.x - e.x); p.vx = Math.cos(a) * p.speed; p.vy = Math.sin(a) * p.speed; p.im.setRotation(a + Math.PI / 2); p.life = Math.max(p.life, 0.6); Sfx.play('mouse'); } else p.dead = true; }
        else if (p.pierce > 0) p.pierce--; else p.dead = true;
      });
      if (p.dead) { p.im.setVisible(false); this.pprojs.splice(i, 1); this.ppFree.push(p); }
    }
    const pl = this.player;
    for (let i = this.ebs.length - 1; i >= 0; i--) {
      const b = this.ebs[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; if (b.spin) b.im.rotation += b.spin * dt;
      b.im.setPosition(b.x, b.y).setDepth(b.y + 40);
      const rr = b.r + pl.r + 2; let dead = b.life <= 0;
      if (!dead && (b.x - pl.x) ** 2 + (b.y - pl.y) ** 2 < rr * rr) { if (pl.takeDamage(b.dmg)) dead = true; }
      if (dead) { b.im.setVisible(false); this.ebs.splice(i, 1); this.ebFree.push(b); }
    }
  }
  spawnEBullet(c) {
    if (this.ebs.length > 260) return; let b = this.ebFree.pop(); if (!b) b = { im: this.add.image(0, 0, c.tex) };
    Object.assign(b, { x: c.x, y: c.y, vx: c.vx, vy: c.vy, dmg: c.dmg, r: c.r || 6, life: c.life || 4, spin: c.spin || 0 });
    b.im.setTexture(c.tex).setScale(ART.scale(c.tex, c.scale || 2.4)).setVisible(true).setRotation(0); this.ebs.push(b);
  }
  explode(x, y, r, dmg, o = {}) {
    this.fx.burst(o.color || 'boom', x, y, 18); this.fx.ring(x, y, r, 0xffc040, 0.25); Sfx.play(o.sfx || 'boom');
    if (o.shake) this.cameras.main.shake(140, o.shake);
    this.forEachNear(x, y, r + 24, (e) => { if ((e.x - x) ** 2 + (e.y - y) ** 2 < (r + e.r) ** 2) this.damageEnemy(e, dmg, { kb: o.kb || 120, sx: x, sy: y }); });
  }
  addZone(z) { z.t = 0; z.color = z.color || 0xff3030; this.zones.push(z); }
  addBeam(b) { b.t = 0; b.hit = false; this.beams.push(b); }
  updateHazards(dt) {
    const g = this.zoneGfx, p = this.player; g.clear();
    for (let i = this.zones.length - 1; i >= 0; i--) {
      const z = this.zones[i]; z.t += dt; const f = Math.min(1, z.t / z.delay);
      g.fillStyle(z.color, 0.12 + 0.28 * f).fillCircle(z.x, z.y, z.r); g.lineStyle(3, z.color, 0.9).strokeCircle(z.x, z.y, z.r * (0.5 + 0.5 * f)); g.lineStyle(2, z.color, 0.7).strokeCircle(z.x, z.y, z.r);
      if (z.t >= z.delay) {
        this.zones.splice(i, 1);
        if (z.dmg > 0) { this.fx.burst(z.boom || 'boom', z.x, z.y, 14); this.fx.ring(z.x, z.y, z.r, z.color, 0.3); Sfx.play('boom'); if ((p.x - z.x) ** 2 + (p.y - z.y) ** 2 < (z.r + p.r) ** 2) p.takeDamage(z.dmg * this.dmgScale); }
        if (z.onDone) z.onDone();
      }
    }
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i]; b.t += dt; const act = b.t >= b.delay;
      if (!act) { g.lineStyle(b.w * 0.25, 0xff3030, 0.35 + 0.4 * (b.t / b.delay)); g.lineBetween(b.x1, b.y1, b.x2, b.y2); }
      else {
        g.lineStyle(b.w, 0x34e6ff, 0.55).lineBetween(b.x1, b.y1, b.x2, b.y2); g.lineStyle(b.w * 0.4, 0xffffff, 1).lineBetween(b.x1, b.y1, b.x2, b.y2);
        if (!b.hit) { const dx = b.x2 - b.x1, dy = b.y2 - b.y1, l2 = dx * dx + dy * dy, t = Phaser.Math.Clamp(((p.x - b.x1) * dx + (p.y - b.y1) * dy) / l2, 0, 1), cx = b.x1 + dx * t, cy = b.y1 + dy * t; if ((p.x - cx) ** 2 + (p.y - cy) ** 2 < (b.w / 2 + p.r) ** 2) { b.hit = true; p.takeDamage(b.dmg * this.dmgScale); } }
        if (b.t >= b.delay + b.dur) this.beams.splice(i, 1);
      }
    }
  }
  // ---------- Director ----------
  director(dt) {
    const t = this.t, m = this.map; this.hpScale = (1 + t / 60 * 0.11) * m.diff; this.dmgScale = 1 + t / 60 * 0.05 * Math.sqrt(m.diff);
    const bossAlive = this.bosses.length > 0;
    if (this.nextBoss < 3 && t >= m.bossAt[this.nextBoss]) this.spawnBoss(this.nextBoss++);
    const rate = m.density * (0.9 + t / 60 * 0.6) * (bossAlive ? 0.3 : 1);
    this.budget += rate * dt;
    if (this.budget >= 1) {
      const types = Object.keys(ENEMIES).filter((k) => ENEMIES[k].w > 0 && t >= ENEMIES[k].from);
      const ws = types.map((k) => ENEMIES[k].w * (m.weights[k] || 1)); const tot = ws.reduce((a, b) => a + b, 0);
      while (this.budget >= 1) {
        this.budget -= 1; if (this.enemies.length >= MAX_ENEMIES) { this.budget = Math.min(this.budget, 2); break; }
        let r = Math.random() * tot, k = types[0]; for (let i = 0; i < types.length; i++) { r -= ws[i]; if (r <= 0) { k = types[i]; break; } }
        const [x, y] = this.spawnRingPos(); this.spawnEnemy(k, x, y);
      }
    }
    this.swarmT -= dt;
    if (this.swarmT <= 0 && !bossAlive) {
      this.swarmT = 26; const n = Math.floor(10 + t / 60 * 2.2), a0 = Math.random() * 6.283, cam = this.cameras.main, R = Math.hypot(cam.worldView.width, cam.worldView.height) / 2 + 60, p = this.player;
      Sfx.play('ding'); this.announce('¡CORREOS MASIVOS!');
      for (let i = 0; i < n; i++) { const a = a0 + (i / n - 0.5) * 1.1; this.spawnEnemy('email', Phaser.Math.Clamp(p.x + Math.cos(a) * R, 20, WORLD - 20), Phaser.Math.Clamp(p.y + Math.sin(a) * R, 20, WORLD - 20)); }
    }
  }
  spawnBoss(i) {
    const def = BOSSES[i], [x, y] = this.spawnRingPos(); const e = this.spawnEnemy(def.id, x, y, def); if (!e) return;
    this.bosses.push(e); this.announce('¡JEFE: ' + def.name + '!'); Sfx.play('boss'); Sfx.setMode('boss'); this.cameras.main.shake(300, 0.008);
  }
  // ---------- Mejoras ----------
  rollChoices() {
    const p = this.player, save = this.save, cand = [];
    for (const w of p.weapons) {
      const d = w.def;
      if (d.evo && w.level >= 5 && !w.evolved && p.passives[d.evo.passive]) cand.push({ kind: 'evo', w: 1000, title: '★ ' + d.evo.name, desc: 'EVOLUCIÓN: ' + d.evo.desc, icon: d.icon, apply: () => w.evolve(), tag: 'EVOLUCIÓN' });
      else if (w.level < 5) cand.push({ kind: 'weapon', w: 2.2, title: w.name + ' Nv.' + (w.level + 1), desc: this.weaponUpDesc(w), icon: d.icon, apply: () => w.levelUp(), tag: 'ARMA' });
    }
    for (const k in PASSIVES) if (!p.passives[k]) { const d = PASSIVES[k]; const wants = p.weapons.some((w) => w.def.evo && w.def.evo.passive === k); cand.push({ kind: 'passive', w: wants ? 3 : 1.2, title: d.name, desc: d.desc, icon: d.icon, apply: () => { p.passives[k] = 1; d.apply(p); }, tag: 'OBJETO' }); }
    if (p.weapons.length < 6) for (const k in WEAPONS) if ((save.unlockedWeapons.includes(k) || k === CHARACTERS[p.charKey].weapon) && !p.weapons.some((w) => w.id === k)) cand.push({ kind: 'new', w: 1.8, title: WEAPONS[k].name, desc: 'NUEVA: ' + WEAPONS[k].desc, icon: WEAPONS[k].icon, apply: () => this.addWeapon(k), tag: 'NUEVA ARMA' });
    for (const s of STAT_UPS) cand.push({ kind: 'stat', w: 1, title: s.name, desc: s.desc, icon: s.icon, apply: () => s.apply(p), tag: 'MEJORA' });
    const out = []; const evo = cand.find((c) => c.kind === 'evo'); if (evo) out.push(evo);
    while (out.length < 3 && cand.length > out.length) {
      const pool = cand.filter((c) => !out.includes(c)); let tot = pool.reduce((a, c) => a + c.w, 0), r = Math.random() * tot, pick = pool[0];
      for (const c of pool) { r -= c.w; if (r <= 0) { pick = c; break; } } out.push(pick);
    }
    return out;
  }
  weaponUpDesc(w) {
    const n = w.level + 1, extra = { keyboard: [3, 5], outlook: [3, 5], ethernet: [1, 3, 5], mouse: [2, 4], powershell: [2, 4] }[w.id] || [];
    let s = '+25% daño, -7% recarga'; if (extra.includes(n)) s += w.id === 'ethernet' ? ', +1 cable' : w.id === 'mouse' ? ', +1 rebote' : w.id === 'powershell' ? ', +1 script' : ', +1 proyectil';
    if (w.id === 'hammer') s += ', más área'; if (w.id === 'hammer' && n === 5) s += ', ¡doble onda!';
    return s;
  }
  openLevelUp() {
    if (this.levelUpOpen || this.pending <= 0) return;
    this.levelUpOpen = true; this.paused = true; Sfx.play('levelup');
    const choices = this.rollChoices(); const ui = this.scene.get('UI');
    ui.showLevelUp(choices, (c) => { c.apply(); this.pending--; this.levelUpOpen = false; this.paused = this.userPaused; if (this.pending > 0) this.openLevelUp(); });
  }
  togglePause() { if (this.over || this.levelUpOpen) return; this.userPaused = !this.userPaused; this.paused = this.userPaused; this.scene.get('UI').setPaused(this.userPaused); Sfx.play('click'); }
  // ---------- Fin de partida ----------
  endRun(win) {
    if (this.over) return; this.over = true; this.paused = false;
    const s = Save.get(), pts = Math.floor(this.kills / 12) + Math.floor(this.t / 30) + this.bossesKilled * 25 + (win ? 100 : 0) + this.chips;
    s.points += pts; s.stats.runs++; if (win) s.stats.wins++; s.stats.kills += this.kills; s.stats.bestTime = Math.max(s.stats.bestTime, Math.floor(this.t)); Save.write();
    Sfx.stopMusic(); Sfx.play(win ? 'win' : 'lose');
    const res = { win, time: this.t, kills: this.kills, damage: this.player.damageDealt, level: this.player.level, points: pts, bosses: this.bossesKilled, chips: this.chips, map: this.map.name };
    this.cameras.main.fadeOut(900, 10, 14, 30);
    this.time.delayedCall(1000, () => { this.scene.stop('UI'); this.scene.start('Result', res); });
  }
  // ---------- Bucle ----------
  inputVec() {
    const k = this.keys; let x = 0, y = 0;
    if (k.A.isDown || k.LEFT.isDown) x -= 1; if (k.D.isDown || k.RIGHT.isDown) x += 1; if (k.W.isDown || k.UP.isDown) y -= 1; if (k.S.isDown || k.DOWN.isDown) y += 1;
    const j = this.registry.get('joy'); if (j && (j.x || j.y)) { x = j.x; y = j.y; }
    return [x, y];
  }
  update(time, delta) {
    if (this.over) { this.fx.update(delta / 1000); return; }
    let dt = Math.min(delta / 1000, 0.05);
    this.floor.setPosition(0, 0);
    if (this.paused) { this.fx.update(0); return; }
    if (this.pending > 0 && !this.levelUpOpen) { this.openLevelUp(); return; }
    const steps = Math.max(1, Math.round(this.timeScale)), sd = dt * (this.timeScale < 1 ? this.timeScale : 1);
    for (let i = 0; i < steps; i++) { this.step(sd); if (this.over || this.paused) break; }
    this.fx.update(dt);
  }
  step(dt) {
    this.t += dt; const p = this.player;
    for (let i = this.laterQ.length - 1; i >= 0; i--) { const q = this.laterQ[i]; q.t -= dt; if (q.t <= 0) { this.laterQ.splice(i, 1); q.fn(); } }
    const [ix, iy] = this.inputVec(); p.update(dt, ix, iy);
    if (this.god) p.hp = p.maxHp;
    this.rebuildGrid(); this.director(dt);
    for (const w of p.weapons) w.update(dt);
    // enemigos
    const arr = this.enemies;
    for (let i = 0; i < arr.length; i++) {
      const e = arr[i]; if (e.dead) continue;
      updateAI(e, dt, this); e.render(dt);
      const dx = p.x - e.x, dy = p.y - e.y, rr = e.r + p.r;
      if (dx * dx + dy * dy < rr * rr) p.takeDamage(e.dmg * this.dmgScale * (e.isBoss ? 1 : 0.75));
    }
    for (let i = arr.length - 1; i >= 0; i--) if (arr[i].dead) { const e = arr[i]; e.sprite.setVisible(false); arr[i] = arr[arr.length - 1]; arr.pop(); this.pool.push(e); }
    this.updateProjectiles(dt); this.updateHazards(dt); this.updatePickups(dt);
    if (this.victoryT > 0) { this.victoryT -= dt; if (this.victoryT <= 0) this.endRun(true); }
  }
}
