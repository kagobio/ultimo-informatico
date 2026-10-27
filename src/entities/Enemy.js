import { ART } from '../sprites/Art.js';
export class Enemy {
  constructor(scene) { this.sprite = scene.add.image(0, 0, 'e_nopass_0'); this.dead = true; this.sprite.setVisible(false); this.ethT = -9; }
  setup(def, x, y, hpScale, isBoss) {
    this.def = def; this.x = x; this.y = y; this.isBoss = !!isBoss; this.r = def.r * (ART.is(def.tex) ? (isBoss ? 1.3 : 1.12) : 1);
    this.maxHp = this.hp = def.hp * hpScale; this.speed = def.speed * (isBoss ? 1 : 0.92 + Math.random() * 0.16);
    this.dmg = def.dmg; this.kx = 0; this.ky = 0; this.face = 1; this.flash = 0; this.anim = Math.random() * 4; this.dead = false; this.ethT = -9;
    this.permTint = 0; this.elite = false; this.sprite.setTexture(def.tex + '_0').setScale(ART.scale(def.tex, def.scale)).setVisible(true).clearTint().setAlpha(1);
    this.h = this.sprite.height * ART.scale(def.tex, def.scale) / 2; this.hitR = this.r;
    return this;
  }
  render(dt) {
    this.anim += dt * (this.def.ai === 'email' ? 10 : 6);
    if (this.flash > 0) { this.flash -= dt; if (this.flash <= 0) { this.sprite.clearTint(); if (this.permTint) this.sprite.setTint(this.permTint); } }
    const f = Math.floor(this.anim) % 2;
    const wf = ART.wframe(this.def.tex, Math.floor(this.anim * 0.7));
    this.sprite.setTexture(wf || (this.def.tex + '_' + f)).setPosition(this.x, this.y - (f ? 1 : 0)).setDepth(this.y + this.h).setFlipX(this.face < 0);
    if (ART.has.has(this.def.tex)) { const b = ART.scale(this.def.tex, this.def.scale); ART.anim(this.sprite, b, b, this.anim * 0.5 + (this.seed || 0), true, this.face, (wf ? 0.4 : 1) * (this.def.ai && this.def.ai.startsWith('boss') ? 0.5 : 1)); if (this.elite) this.sprite.setScale(this.sprite.scaleX * 1.6, this.sprite.scaleY * 1.6); }
  }
  hide() { this.dead = true; this.sprite.setVisible(false); }
}
