import { Save } from '../systems/Save.js';
import { Sfx } from '../systems/Sfx.js';
import { txt, button, panel, bgFloor, fmtTime, uiScale } from '../systems/Widgets.js';
export class ResultScene extends Phaser.Scene {
  constructor() { super('Result'); }
  init(d) { this.r = d; }
  create() {
    const r = this.r, W = this.scale.width, H = this.scale.height, u = uiScale(this), cx = W / 2;
    this.cameras.main.setBackgroundColor(r.win ? '#10331f' : '#33101a'); bgFloor(this, r.win ? 0x2f8a58 : 0x8a2f3f);
    txt(this, cx, H * 0.1, r.win ? '¡VICTORIA!' : 'HAS SIDO REINICIADO', 34 * u, r.win ? '#7aff9a' : '#ff6a7a', { style: { align: 'center', wordWrap: { width: W - 20 } } });
    txt(this, cx, H * 0.1 + 38 * u, r.win ? 'Infraestructura restablecida. Son las 08:47.\nAlguien acaba de decir «me sale un error raro».' : 'El lunes ha ganado esta vez.\nLos tickets siguen abiertos.', 12 * u, '#e0ecff', { style: { align: 'center', wordWrap: { width: W - 20 } } });
    const pw = Math.min(W - 24, 360 * u), py = H * 0.43; panel(this, cx, py, pw, 200 * u, { fill: 0x0e1630 });
    const rows = [['Mapa', r.map], ['Tiempo', fmtTime(r.time)], ['Nivel', r.level], ['Bajas', r.kills], ['Daño realizado', Math.round(r.damage).toLocaleString('es-ES')], ['Jefes derrotados', r.bosses + ' / 3']];
    rows.forEach((o, i) => { const y = py - 80 * u + i * 26 * u; txt(this, cx - pw / 2 + 16 * u, y, o[0], 14 * u, '#9fb8e8', { ox: 0 }); txt(this, cx + pw / 2 - 16 * u, y, String(o[1]), 15 * u, '#ffffff', { ox: 1 }); });
    txt(this, cx, py + 128 * u, '+' + r.points + ' Puntos de Soporte  (total ' + Save.get().points + ')', 17 * u, '#ffd24a');
    const by = H * 0.43 + 190 * u;
    button(this, cx, by, 240 * u, 52 * u, '↻  REINTENTAR', () => this.scene.start('Game'), { fill: 0x1fa84a, size: 22 * u });
    button(this, cx - 62 * u, by + 60 * u, 118 * u, 44 * u, 'TIENDA', () => this.scene.start('Shop'), { fill: 0x9a5be8, size: 16 * u });
    button(this, cx + 62 * u, by + 60 * u, 118 * u, 44 * u, 'MENÚ', () => this.scene.start('Menu'), { size: 16 * u });
    window.__result = r;
  }
}
