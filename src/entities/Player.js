import { ART } from '../sprites/Art.js';
import { CHARACTERS } from '../data/content.js';
import { META_UPS } from '../data/content.js';
import { PLAYER_SPEED_K, WORLD } from '../config.js';
export class Player {
  constructor(scene, charKey, save) {
    this.s = scene; const c = CHARACTERS[charKey], u = save.up;
    this.char = c; this.charKey = charKey;
    this.maxHp = c.hp + u.hp * META_UPS.hp.per; this.hp = this.maxHp;
    this.speedBase = c.speed; this.speedMult = 1 + u.speed * META_UPS.speed.per;
    this.baseDmg = c.dmg; this.dmgMult = 1 + u.dmg * META_UPS.dmg.per;
    this.crit = c.crit / 100 + u.crit * META_UPS.crit.per;
    this.cdMult = c.cd || 1; this.areaMult = 1;
    this.magnet = 90 * (1 + u.magnet * META_UPS.magnet.per);
    this.xpMult = 1 + (c.xp || 0) + u.xp * META_UPS.xp.per;
    this.level = 1; this.xp = 0; this.xpNext = Player.need(1);
    this.x = WORLD / 2; this.y = WORLD / 2; this.r = 7; this.h = 34;
    this.invuln = 0; this.slowT = 0; this.avT = 0; this.damageDealt = 0; this.anim = 0; this.face = 1;
    const texKey = charKey === 'tecnico' && save.skin !== 'clasico' ? 'p_' + save.skin : c.tex;
    this.texKey = texKey; if (ART.is(texKey)) this.r = 10;
    this.shadow = scene.add.image(0, 0, 'shadow').setScale(0.85);
    this.sprite = scene.add.image(0, 0, texKey + '_0').setScale(ART.scale(texKey, 3));
    this.weapons = []; this.passives = {}; this.vx = 0; this.vy = 0;
  }
  static need(l) { return Math.round(4 + 2.4 * l + 0.1 * l * l); }
  get dmg() { return this.baseDmg * this.dmgMult * (this.avT > 0 ? 0.7 : 1); }
  get speed() { return this.speedBase * this.speedMult * PLAYER_SPEED_K * (this.slowT > 0 ? 0.72 : 1); }
  heal(n) { this.hp = Math.min(this.maxHp, this.hp + n); }
  takeDamage(n, quiet) {
    if (this.invuln > 0 || this.s.over) return false;
    n = Math.max(1, Math.round(n)); this.hp -= n; this.invuln = 0.55;
    this.s.fx.dmg(this.x, this.y - 40, n, false, '#ff5a5a'); this.s.sfx('hurt');
    this.s.cameras.main.shake(120, 0.004); this.sprite.setTintFill(0xff3030); this.flash = 0.1;
    if (this.hp <= 0) { this.hp = 0; this.s.endRun(false); }
    return true;
  }
  update(dt, ix, iy) {
    const len = Math.hypot(ix, iy); if (len > 1) { ix /= len; iy /= len; }
    const sp = this.speed; this.vx = ix * sp; this.vy = iy * sp;
    this.x = Math.min(WORLD - 24, Math.max(24, this.x + this.vx * dt)); this.y = Math.min(WORLD - 24, Math.max(24, this.y + this.vy * dt));
    // los muebles grandes bloquean al jugador y a los enemigos terrestres
    if (this.s.cgrid) this.s.pushOut(this, this.r);
    if (ix < -0.1) this.face = -1; else if (ix > 0.1) this.face = 1;
    const moving = len > 0.1; if (moving) this.anim += dt * 9;
    const fr = moving ? (Math.floor(this.anim) % 2) : 0; const wf = ART.wframe(this.texKey, moving ? Math.floor(this.anim * 0.55) : 0);
    this.invuln -= dt; this.slowT -= dt; this.avT -= dt;
    if (this.flash > 0) { this.flash -= dt; if (this.flash <= 0) this.sprite.clearTint(); }
    const bob = moving ? Math.abs(Math.sin(this.anim * Math.PI)) * 2 : 0;
    this.sprite.setTexture(wf || (this.texKey + '_' + fr)).setPosition(this.x, this.y - bob).setDepth(this.y + 30).setFlipX(this.face < 0);
    if (ART.has.has(this.texKey)) { this.sprite.setOrigin(0.5, 0.5); ART.anim(this.sprite, ART.scale(this.texKey, 3), ART.scale(this.texKey, 3), this.anim * 0.5 + this.x * 0, moving, this.face, wf ? 0.3 : 1); }
    this.sprite.setAlpha(this.invuln > 0 && Math.floor(this.invuln * 20) % 2 ? 0.55 : 1);
    this.shadow.setPosition(this.x, this.y + (ART.has.has(this.texKey) ? 37 : 28)).setDepth(this.y + 29);
  }
  antivirus(sec) {
    this.avT = sec; const ws = this.weapons.filter((w) => !w.blocked); if (ws.length) ws[Math.floor(Math.random() * ws.length)].blockedUntil = this.s.t + sec;
    this.s.fx.say(this, '¡ARMAS BLOQUEADAS!', 1.4, 12); this.s.sfx('block');
  }
}
