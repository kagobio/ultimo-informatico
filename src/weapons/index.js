import { Weapon } from './Weapon.js';
const RGB = [0xff3d6e, 0xffd24a, 0x5df28a, 0x34e6ff, 0x7a5bff, 0xff3dcb];
class Keyboard extends Weapon {
  cooldown() { return this.cd(this.evolved ? 0.42 : 0.6); }
  fire() {
    const s = this.s, p = s.player, e = s.nearest(p.x, p.y, 520); if (!e) return false;
    const n = this.evolved ? 5 : 1 + (this.level >= 3) + (this.level >= 5);
    const base = Math.atan2(e.y - p.y, e.x - p.x), spread = this.evolved ? 0.17 : 0.13;
    for (let i = 0; i < n; i++) {
      const a = base + (i - (n - 1) / 2) * spread;
      s.spawnPProj({ tex: 'p_key', x: p.x, y: p.y - 6, vx: Math.cos(a) * 460, vy: Math.sin(a) * 460, dmg: p.dmg * this.dmg(this.evolved ? 1.5 : 1), pierce: this.evolved ? 2 : 0, life: 1.1, r: 6, scale: 2.4, spin: 14, tint: this.evolved ? RGB[(i + (s.t * 8 | 0)) % 6] : null });
    }
    s.sfx('key'); return true;
  }
}
class Mouse extends Weapon {
  cooldown() { return this.cd(this.evolved ? 0.34 : 0.42); }
  fire() {
    const s = this.s, p = s.player, e = s.nearest(p.x, p.y, 480); if (!e) return false;
    const n = this.evolved ? 2 : 1, base = Math.atan2(e.y - p.y, e.x - p.x);
    for (let i = 0; i < n; i++) {
      const a = base + (n > 1 ? (i - 0.5) * 0.3 : 0);
      s.spawnPProj({ tex: 'p_mouse', x: p.x, y: p.y - 6, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, dmg: p.dmg * this.dmg(this.evolved ? 1.2 : 0.8), bounce: this.evolved ? 8 : 2 + (this.level >> 1), life: 1.4, r: 6, scale: 2.3, align: true, tint: this.evolved ? 0xffd24a : null, speed: 520 });
    }
    s.sfx('mouse'); return true;
  }
}
class Ethernet extends Weapon {
  constructor(s, id) { super(s, id); this.imgs = []; this.ang = 0; this.onChange(); }
  get count() { return this.evolved ? 6 : 1 + ((this.level + 1) >> 1); }
  get radius() { return ((this.evolved ? 108 : 66 + this.level * 5) * this.s.player.areaMult); }
  onChange() {
    const need = this.count * 3; while (this.imgs.length < need) { const im = this.s.add.image(0, 0, 'p_cable').setScale(2.6); this.imgs.push(im); }
    this.imgs.forEach((im, i) => im.setTint(this.evolved ? [0xffd24a, 0xff3dcb, 0x5df28a][i % 3] : 0xffffff));
  }
  update(dt) {
    const s = this.s, p = s.player; this.ang += dt * (this.evolved ? 5.6 : 3.4);
    const n = this.count, R = this.radius, tick = this.evolved ? 0.22 : 0.32, active = !this.blocked;
    for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) {
      const a = this.ang + (i / n) * Math.PI * 2 - k * 0.16, im = this.imgs[i * 3 + k];
      const x = p.x + Math.cos(a) * R, y = p.y - 6 + Math.sin(a) * R * 0.72;
      im.setPosition(x, y).setDepth(y + 20).setAlpha(active ? 1 - k * 0.28 : 0.2).setScale((2.8 - k * 0.5) * (this.evolved ? 1.2 : 1)).setVisible(true);
      if (k === 0 && active) s.forEachNear(x, y, 18, (e) => {
        if (s.t - (e.ethT || -9) < tick) return;
        if ((e.x - x) ** 2 + (e.y - y) ** 2 > (e.r + 11) ** 2) return;
        e.ethT = s.t; s.damageEnemy(e, p.dmg * this.dmg(this.evolved ? 0.75 : 0.5), { kb: this.evolved ? 160 : 70, sx: p.x, sy: p.y });
      });
    }
    for (let i = n * 3; i < this.imgs.length; i++) this.imgs[i].setVisible(false);
  }
  destroy() { this.imgs.forEach((i) => i.destroy()); }
}
class Hammer extends Weapon {
  cooldown() { return this.cd(2.1); }
  fire() {
    const s = this.s, p = s.player, e = s.nearest(p.x, p.y, 230); if (!e) return false;
    const a = Math.atan2(e.y - p.y, e.x - p.x), R = (58 + this.level * 6) * p.areaMult, d = 46;
    const cx = p.x + Math.cos(a) * d, cy = p.y + Math.sin(a) * d * 0.8;
    const h = s.add.image(p.x + Math.cos(a) * 24, p.y - 20, 'p_hammer').setScale(3).setDepth(99999).setOrigin(0.5, 1).setRotation(-1.6);
    s.tweens.add({ targets: h, rotation: 0.9, duration: 190, ease: 'Cubic.easeIn', onComplete: () => h.destroy() });
    s.later(0.17, () => { s.explode(cx, cy, R, p.dmg * this.dmg(5), { kb: 380, shake: 0.006, sfx: 'hammer', color: 'dust' }); s.fx.ring(cx, cy, R, 0xffd24a, 0.3); });
    if (this.level >= 5) s.later(0.42, () => { s.explode(cx, cy, R * 1.5, p.dmg * this.dmg(2.5), { kb: 300, sfx: 'boom' }); s.fx.ring(cx, cy, R * 1.5, 0xff7a3a, 0.4); });
    return true;
  }
}
class Outlook extends Weapon {
  cooldown() { return this.cd(1.7); }
  fire() {
    const s = this.s, p = s.player, e = s.nearest(p.x, p.y, 480); if (!e) return false;
    const n = 1 + (this.level >= 3) + (this.level >= 5), base = Math.atan2(e.y - p.y, e.x - p.x);
    for (let i = 0; i < n; i++) {
      const a = base + (i - (n - 1) / 2) * 0.28;
      s.spawnPProj({ tex: 'p_mail', x: p.x, y: p.y - 6, vx: Math.cos(a) * 270, vy: Math.sin(a) * 270, dmg: p.dmg * this.dmg(0.5), aoe: (56 + this.level * 6) * p.areaMult, aoeDmg: p.dmg * this.dmg(1.7), life: 1.5, r: 7, scale: 2.6, align: true });
    }
    s.sfx('mail'); return true;
  }
}
class PowerShell extends Weapon {
  constructor(s, id) { super(s, id); this.drones = []; }
  cooldown() { return this.cd(3.2); }
  fire() {
    const s = this.s, p = s.player; if (!s.enemies.length) return false;
    const n = 1 + (this.level >> 1);
    for (let i = 0; i < n && this.drones.length < 7; i++) {
      const im = s.add.image(p.x, p.y, 'p_ps').setScale(2.8);
      this.drones.push({ im, a: Math.random() * 6.28, life: 6 + this.level, z: 0.3 * i, orb: 56 + Math.random() * 50, sp: 1.6 + Math.random() });
    }
    s.sfx('ding'); return true;
  }
  update(dt) {
    super.update(dt);
    const s = this.s, p = s.player, ok = !this.blocked;
    for (let i = this.drones.length - 1; i >= 0; i--) {
      const d = this.drones[i]; d.life -= dt; d.a += dt * d.sp; d.z -= dt;
      const x = p.x + Math.cos(d.a) * d.orb, y = p.y + Math.sin(d.a) * d.orb * 0.7 - 10 + Math.sin(s.t * 6 + i) * 3;
      d.im.setPosition(x, y).setDepth(y + 30).setAlpha(d.life < 1 ? d.life : 1);
      if (ok && d.z <= 0) {
        const e = s.nearest(x, y, 190);
        if (e) { d.z = 0.55 * p.cdMult; s.fx.bolt(x, y, e.x, e.y); s.damageEnemy(e, p.dmg * this.dmg(0.9), { kb: 20, sx: x, sy: y }); s.sfx('zap'); }
      }
      if (d.life <= 0) { d.im.destroy(); this.drones.splice(i, 1); }
    }
  }
  destroy() { this.drones.forEach((d) => d.im.destroy()); this.drones = []; }
}
const MAP = { keyboard: Keyboard, mouse: Mouse, ethernet: Ethernet, hammer: Hammer, outlook: Outlook, powershell: PowerShell };
export function createWeapon(scene, id) { return new MAP[id](scene, id); }
