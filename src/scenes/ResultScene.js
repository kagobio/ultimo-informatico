import { Save } from '../systems/Save.js';
import { ART } from '../sprites/Art.js';
import { CHARACTERS } from '../data/content.js';
import { Sfx } from '../systems/Sfx.js';
import { txt, button, panel, bgFloor, fmtTime, uiScale } from '../systems/Widgets.js';
export class ResultScene extends Phaser.Scene {
  constructor() { super('Result'); }
  init(d) { this.r = d; }
  create() {
    const r = this.r, W = this.scale.width, H = this.scale.height, land = W > H * 1.2, u = land ? Phaser.Math.Clamp(H / 400, 0.7, 1.4) : uiScale(this), cx = land ? W * 0.68 : W / 2, hx = land ? W * 0.2 : W / 2;
    this.cameras.main.setBackgroundColor(r.win ? '#10331f' : '#33101a'); bgFloor(this, r.win ? 0x2f8a58 : 0x8a2f3f);
    txt(this, cx, H * (land ? 0.09 : 0.1), r.win ? '¡VICTORIA!' : 'HAS SIDO REINICIADO', 34 * u, r.win ? '#7aff9a' : '#ff6a7a', { style: { align: 'center', wordWrap: { width: W - 20 } } });
    txt(this, cx, H * (land ? 0.09 : 0.1) + 38 * u, r.win ? 'Infraestructura restablecida. Son las 08:47.\nAlguien acaba de decir «me sale un error raro».' : 'El lunes ha ganado esta vez.\nLos tickets siguen abiertos.', 12 * u, '#e0ecff', { style: { align: 'center', wordWrap: { width: W - 20 } } });
    {
      const tex = (CHARACTERS[Save.get().char] || CHARACTERS.tecnico).tex, k = (t, n = 0) => ART.wframe(t, n) || (t + '_0'), sy = land ? H * 0.36 : H * 0.43 - 100 * u - 28 * u - 10 * u;
      this.add.image(hx, sy + 30 * u, 'shadow').setScale(1.1 * u);
      const hero = this.add.image(hx, sy + 28 * u, k(tex)).setOrigin(0.5, 1).setScale(1.05 * u);
      if (r.win) {
        this.tweens.add({ targets: hero, y: hero.y - 14 * u, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeOut' });
        let f = 0; this.time.addEvent({ delay: 160, loop: true, callback: () => hero.setTexture(k(tex, ++f)) });
        for (let i = 0; i < 18; i++) { const c = this.add.rectangle(Phaser.Math.Between(10, W - 10), -10, 6 * u, 10 * u, [0xffd24a, 0x7aff9a, 0x6ab4ff, 0xff6a9a][i % 4]).setAngle(Phaser.Math.Between(0, 90)); this.tweens.add({ targets: c, y: H * 0.36, angle: c.angle + 300, duration: Phaser.Math.Between(1400, 2600), delay: Phaser.Math.Between(0, 1200), alpha: 0.2 }); }
      } else {
        hero.setTint(0xb0b0c0).setAngle(-8); this.tweens.add({ targets: hero, angle: 8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        [[-1, 'e_nopass'], [1, 'e_printer']].forEach(([d, t]) => this.add.image(hx + d * 62 * u, sy + 28 * u, k(t)).setOrigin(0.5, 1).setScale(0.9 * u).setFlipX(d > 0));
      }
    }
    const pw = Math.min(W - 24, 360 * u), py = land ? H * 0.46 : H * 0.43; panel(this, cx, py, pw, 200 * u, { fill: 0x0e1630 });
    const rows = [['Mapa', r.map], ['Tiempo', fmtTime(r.time)], ['Nivel', r.level], ['Bajas', r.kills], ['Daño realizado', Math.round(r.damage).toLocaleString('es-ES')], ['Jefes derrotados', r.bosses + ' / 3']];
    rows.forEach((o, i) => { const y = py - 80 * u + i * 26 * u; txt(this, cx - pw / 2 + 16 * u, y, o[0], 14 * u, '#9fb8e8', { ox: 0 }); txt(this, cx + pw / 2 - 16 * u, y, String(o[1]), 15 * u, '#ffffff', { ox: 1 }); });
    txt(this, cx, py + 128 * u, '+' + r.points + ' Puntos de Soporte  (total ' + Save.get().points + ')', 17 * u, '#ffd24a');
    const by = land ? H * 0.64 : H * 0.43 + 190 * u, bx = hx;
    button(this, bx, by, 240 * u, 52 * u, '↻  REINTENTAR', () => this.scene.start('Game'), { fill: 0x1fa84a, size: 22 * u });
    button(this, bx - 62 * u, by + 60 * u, 118 * u, 44 * u, 'TIENDA', () => this.scene.start('Shop'), { fill: 0x9a5be8, size: 16 * u });
    button(this, bx + 62 * u, by + 60 * u, 118 * u, 44 * u, 'MENÚ', () => this.scene.start('Menu'), { size: 16 * u });
    window.__result = r;
  }
}
