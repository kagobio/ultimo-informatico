export class Enemy {
  constructor(scene) { this.sprite = scene.add.image(0, 0, 'e_nopass_0'); this.dead = true; this.sprite.setVisible(false); this.ethT = -9; }
  setup(def, x, y, hpScale, isBoss) {
    this.def = def; this.x = x; this.y = y; this.r = def.r; this.isBoss = !!isBoss;
    this.maxHp = this.hp = def.hp * hpScale; this.speed = def.speed * (isBoss ? 1 : 0.92 + Math.random() * 0.16);
    this.dmg = def.dmg; this.kx = 0; this.ky = 0; this.face = 1; this.flash = 0; this.anim = Math.random() * 4; this.dead = false; this.ethT = -9;
    this.permTint = 0; this.sprite.setTexture(def.tex + '_0').setScale(def.scale).setVisible(true).clearTint().setAlpha(1);
    this.h = this.sprite.height * def.scale / 2; this.hitR = def.r;
    return this;
  }
  render(dt) {
    this.anim += dt * (this.def.ai === 'email' ? 10 : 6);
    if (this.flash > 0) { this.flash -= dt; if (this.flash <= 0) { this.sprite.clearTint(); if (this.permTint) this.sprite.setTint(this.permTint); } }
    const f = Math.floor(this.anim) % 2;
    this.sprite.setTexture(this.def.tex + '_' + f).setPosition(this.x, this.y - (f ? 1 : 0)).setDepth(this.y + this.h).setFlipX(this.face < 0);
  }
  hide() { this.dead = true; this.sprite.setVisible(false); }
}
