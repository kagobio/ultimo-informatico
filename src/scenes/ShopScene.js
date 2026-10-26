import { Save } from '../systems/Save.js';
import { Sfx } from '../systems/Sfx.js';
import { CHARACTERS, WEAPONS, MAPS, SKINS, META_UPS } from '../data/content.js';
import { txt, button, panel, bgFloor, uiScale } from '../systems/Widgets.js';
const TABS = [['chars', 'PERSONAJES'], ['weapons', 'ARMAS'], ['maps', 'MAPAS'], ['skins', 'ASPECTOS'], ['ups', 'MEJORAS']];
export class ShopScene extends Phaser.Scene {
  constructor() { super('Shop'); }
  create() { this.tab = 'ups'; this.page = 0; this.s = Save.get(); this.cameras.main.setBackgroundColor('#0b1020'); bgFloor(this, 0x34285a); this.build(); this.scale.on('resize', this.rebuild, this); this.events.once('shutdown', () => this.scale.off('resize', this.rebuild, this)); }
  rebuild() { this.children.removeAll(true); this.cameras.main.setBackgroundColor('#0b1020'); bgFloor(this, 0x34285a); this.build(); }
  items() {
    const s = this.s, out = [];
    if (this.tab === 'chars') for (const k in CHARACTERS) { const c = CHARACTERS[k]; const own = s.unlockedChars.includes(k); out.push({ name: c.name, desc: c.desc, cost: c.cost, own, icon: c.tex + '_0', buy: () => { s.unlockedChars.push(k); if (!s.unlockedWeapons.includes(c.weapon)) s.unlockedWeapons.push(c.weapon); }, sel: s.char === k, equip: () => { s.char = k; } }); }
    if (this.tab === 'weapons') for (const k in WEAPONS) { const w = WEAPONS[k]; out.push({ name: w.name, desc: w.desc, cost: w.cost, own: s.unlockedWeapons.includes(k), icon: w.icon, buy: () => s.unlockedWeapons.push(k) }); }
    if (this.tab === 'maps') for (const k in MAPS) { const m = MAPS[k]; out.push({ name: m.name, desc: m.blurb, cost: m.cost, own: s.unlockedMaps.includes(k), icon: 'prop_desk', buy: () => s.unlockedMaps.push(k), sel: s.map === k, equip: () => { s.map = k; } }); }
    if (this.tab === 'skins') for (const k in SKINS) { const m = SKINS[k]; out.push({ name: m.name, desc: 'Aspecto del Técnico de Soporte', cost: m.cost, own: s.skins.includes(k), icon: k === 'clasico' ? 'p_0' : 'p_' + k + '_0', buy: () => s.skins.push(k), sel: s.skin === k, equip: () => { s.skin = k; } }); }
    if (this.tab === 'ups') for (const k in META_UPS) { const m = META_UPS[k], lv = s.up[k]; out.push({ name: m.name + '  (' + lv + '/' + m.max + ')', desc: m.desc, cost: lv >= m.max ? 0 : Math.round(m.base * (1 + lv * 0.8)), own: lv >= m.max, icon: 'chip', buy: () => { s.up[k]++; }, ups: true, maxed: lv >= m.max }); }
    return out;
  }
  build() {
    const W = this.scale.width, H = this.scale.height, u = uiScale(this), cx = W / 2, s = this.s;
    txt(this, cx, 26 * u, 'TIENDA DE SOPORTE', 24 * u, '#c9a0ff'); txt(this, cx, 54 * u, '⭐ ' + s.points + ' Puntos de Soporte', 16 * u, '#ffd24a');
    const tw = Math.min(W / 5 - 4, 96 * u);
    TABS.forEach(([k, l], i) => { const b = button(this, cx + (i - 2) * (tw + 4), 92 * u, tw, 34 * u, l, () => { this.tab = k; this.page = 0; this.rebuild(); }, { size: Math.min(11 * u, tw / 7.5), fill: this.tab === k ? 0x9a5be8 : 0x253255 }); });
    const rowH = 66 * u, top = 128 * u, per = Math.max(2, Math.floor((H - top - 70 * u) / rowH)), all = this.items(), pages = Math.ceil(all.length / per); this.page = Math.min(this.page, pages - 1);
    all.slice(this.page * per, this.page * per + per).forEach((it, i) => {
      const y = top + i * rowH + rowH / 2, pw = Math.min(W - 16, 480 * u); panel(this, cx, y, pw, rowH - 6 * u, { fill: 0x141d3a });
      this.add.image(cx - pw / 2 + 30 * u, y, it.icon).setScale(Math.min(3.2 * u, (rowH - 16 * u) / (this.textures.get(it.icon).getSourceImage().height / 4)));
      txt(this, cx - pw / 2 + 62 * u, y - 12 * u, it.name, 14 * u, '#ffffff', { ox: 0, style: { wordWrap: { width: pw - 190 * u } } }); txt(this, cx - pw / 2 + 62 * u, y + 12 * u, it.desc, 10 * u, '#9fb8e8', { ox: 0, style: { wordWrap: { width: pw - 190 * u }, strokeThickness: 2 } });
      const bx = cx + pw / 2 - 52 * u;
      if (it.own && it.equip) { const b = button(this, bx, y, 92 * u, 40 * u, it.sel ? '✔ EN USO' : 'USAR', () => { it.equip(); Save.write(); this.rebuild(); }, { size: 13 * u, fill: it.sel ? 0x2a7a46 : 0x1f6feb }); b.setEnabled(!it.sel); }
      else if (it.own) { const b = button(this, bx, y, 92 * u, 40 * u, it.maxed ? 'MÁX' : '✔', () => {}, { size: 13 * u }); b.setEnabled(false); }
      else { const ok = s.points >= it.cost; const b = button(this, bx, y, 92 * u, 40 * u, '⭐ ' + it.cost, () => { if (s.points < it.cost) return; s.points -= it.cost; it.buy(); Save.write(); Sfx.play('coin'); this.rebuild(); }, { size: 14 * u, fill: 0xd49a1a, stroke: 0xffe08a }); b.setEnabled(ok); }
    });
    if (pages > 1) { button(this, cx - 80 * u, H - 90 * u + 20 * u, 56 * u, 36 * u, '◀', () => { this.page = (this.page + pages - 1) % pages; this.rebuild(); }, { size: 18 * u }); txt(this, cx, H - 70 * u, (this.page + 1) + ' / ' + pages, 13 * u); button(this, cx + 80 * u, H - 70 * u, 56 * u, 36 * u, '▶', () => { this.page = (this.page + 1) % pages; this.rebuild(); }, { size: 18 * u }); }
    button(this, cx, H - 28 * u, 200 * u, 40 * u, '← VOLVER', () => { Save.write(); this.scene.start('Menu'); }, { size: 16 * u });
  }
}
