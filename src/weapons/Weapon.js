import { WEAPONS } from '../data/content.js';
export class Weapon {
  constructor(scene, id) { this.s = scene; this.id = id; this.level = 1; this.evolved = false; this.t = 0.4; this.blockedUntil = 0; }
  get def() { return WEAPONS[this.id]; }
  get name() { return this.evolved ? this.def.evo.name : this.def.name; }
  get max() { return 5; }
  get lvlMult() { return 1 + 0.25 * (this.level - 1); }
  get blocked() { return this.s.t < this.blockedUntil; }
  dmg(base) { return base * this.lvlMult; }
  cd(base) { return base * this.s.player.cdMult * Math.pow(0.93, this.level - 1); }
  levelUp() { if (this.level < this.max) this.level++; this.onChange(); }
  evolve() { this.evolved = true; this.onChange(); }
  onChange() {}
  update(dt) {
    if (this.blocked) return;
    this.t -= dt;
    if (this.t <= 0) this.t = this.fire() ? this.cooldown() : 0.1;
  }
  cooldown() { return 1; }
  fire() { return false; }
  destroy() {}
}
