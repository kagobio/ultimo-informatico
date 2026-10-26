import { Save } from '../systems/Save.js';
import { Sfx } from '../systems/Sfx.js';
import { CHARACTERS, MAPS, WEAPONS } from '../data/content.js';
import { txt, button, panel, bgFloor, uiScale } from '../systems/Widgets.js';
export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    this.save = Save.get(); Sfx.setMuted(!!this.save.muted);
    this.cameras.main.setBackgroundColor('#0b1020'); bgFloor(this, 0x2c3a68);
    this.build(); this.scale.on('resize', this.rebuild, this); this.events.once('shutdown', () => this.scale.off('resize', this.rebuild, this));
  }
  rebuild() { this.children.removeAll(true); this.cameras.main.setBackgroundColor('#0b1020'); bgFloor(this, 0x2c3a68); this.build(); }
  unlockedChars() { return Object.keys(CHARACTERS).filter((k) => this.save.unlockedChars.includes(k)); }
  unlockedMaps() { return Object.keys(MAPS).filter((k) => this.save.unlockedMaps.includes(k)); }
  cycle(list, cur, d) { const i = list.indexOf(cur); return list[(i + d + list.length) % list.length]; }
  build() {
    const W = this.scale.width, H = this.scale.height, u = uiScale(this), cx = W / 2, s = this.save, land = W > H * 1.2;
    let y = H * (land ? 0.1 : 0.12);
    txt(this, cx, y, 'ÚLTIMO', 38 * u, '#7fd4ff'); txt(this, cx, y + 38 * u, 'INFORMÁTICO', 38 * u, '#ffffff');
    const ban = this.add.rectangle(cx, y + 80 * u, 300 * u, 26 * u, 0xd02030).setStrokeStyle(3, 0xff8a8a); txt(this, cx, y + 80 * u, 'APOCALYPSE SUPPORT', 17 * u, '#ffffff');
    txt(this, cx, y + 120 * u, 'Es lunes. Son las 08:00. Todo falla.', 13 * u, '#cfe3ff');
    // Personaje
    const cy = H * (land ? 0.52 : 0.45);
    if (!s.unlockedChars.includes(s.char)) s.char = 'tecnico'; if (!s.unlockedMaps.includes(s.map)) s.map = 'oficina';
    const ch = CHARACTERS[s.char];
    const skinTex = s.char === 'tecnico' && s.skin !== 'clasico' ? 'p_' + s.skin : ch.tex;
    const spr = this.add.image(cx, cy - 6 * u, skinTex + '_0').setScale(5.5 * u); this.tweens.add({ targets: spr, y: spr.y - 6, yoyo: true, repeat: -1, duration: 500 });
    this.time.addEvent({ delay: 280, loop: true, callback: () => spr.setTexture(skinTex + (spr.texture.key.endsWith('_0') ? '_1' : '_0')) });
    this.add.image(cx, cy + 56 * u, 'shadow').setScale(5 * u).setDepth(-1);
    txt(this, cx, cy + 74 * u, ch.name, 18 * u, '#ffd24a'); txt(this, cx, cy + 94 * u, ch.desc + '  ·  ' + WEAPONS[ch.weapon].name, 11 * u, '#cfe3ff');
    const arrow = (x, y, l, cb) => button(this, x, y, 46 * u, 46 * u, l, cb, { size: 24 * u });
    const chars = this.unlockedChars(), maps = this.unlockedMaps();
    arrow(cx - 120 * u, cy, '◀', () => { s.char = this.cycle(chars, s.char, -1); Save.write(); this.rebuild(); });
    arrow(cx + 120 * u, cy, '▶', () => { s.char = this.cycle(chars, s.char, 1); Save.write(); this.rebuild(); });
    // Mapa
    const my = cy + 138 * u; const mp = MAPS[s.map];
    panel(this, cx, my, 214 * u, 46 * u, { fill: 0x16233f }); txt(this, cx, my - 8 * u, mp.name, 16 * u, '#ffffff'); txt(this, cx, my + 12 * u, mp.blurb, 10 * u, '#9fb8e8');
    arrow(cx - 135 * u, my, '◀', () => { s.map = this.cycle(maps, s.map, -1); Save.write(); this.rebuild(); }).setScale(0.8);
    arrow(cx + 135 * u, my, '▶', () => { s.map = this.cycle(maps, s.map, 1); Save.write(); this.rebuild(); }).setScale(0.8);
    // Botones
    const by = my + 56 * u;
    button(this, cx, by, 240 * u, 54 * u, '▶  JUGAR', () => { Sfx.init(); this.scene.start('Game'); }, { fill: 0x1fa84a, stroke: 0xaaffc4, size: 26 * u });
    button(this, cx - 62 * u, by + 62 * u, 118 * u, 44 * u, 'TIENDA', () => this.scene.start('Shop'), { fill: 0x9a5be8, stroke: 0xdab8ff, size: 16 * u });
    button(this, cx + 62 * u, by + 62 * u, 118 * u, 44 * u, 'CÓMO JUGAR', () => this.help(), { fill: 0x2f6fb0, size: 14 * u });
    txt(this, cx, by + 110 * u, '⭐ ' + s.points + ' Puntos de Soporte', 15 * u, '#ffd24a');
    const mute = button(this, W - 26 * u, 26 * u, 40 * u, 40 * u, s.muted ? '🔇' : '🔊', () => { s.muted = !s.muted; Sfx.setMuted(s.muted); Save.write(); mute.setLabel(s.muted ? '🔇' : '🔊'); }, { size: 22 * u, fill: 0x253255 });
    const canFs = document.fullscreenEnabled && !/iPhone|iPad|iPod/.test(navigator.userAgent);
    if (canFs) button(this, W - 26 * u, 72 * u, 40 * u, 40 * u, '⛶', () => { if (this.scale.isFullscreen) this.scale.stopFullscreen(); else this.scale.startFullscreen(); }, { size: 24 * u, fill: 0x253255 });
    const standalone = window.matchMedia && matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const inFrame = window.top !== window || !('serviceWorker' in navigator) || !(location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1'); const foot = inFrame ? '' : standalone ? 'v1.0 · modo app' : (ios ? 'iPhone: Compartir ▸ «Añadir a pantalla de inicio» para jugar a pantalla completa' : 'Puedes instalarlo como app desde el menú del navegador');
    txt(this, cx, H - 16 * u, foot, 10 * u, '#8aa0c8', { style: { align: 'center', wordWrap: { width: W - 20 } } });
    if (Save.memoryOnly) txt(this, cx, H - 34 * u, '⚠ Este navegador no permite guardar: el progreso no se conservará', 10 * u, '#ff9a6a');
  }
  help() {
    const W = this.scale.width, H = this.scale.height, u = uiScale(this);
    const ov = this.add.container(0, 0).setDepth(100);
    const dim = this.add.rectangle(0, 0, W, H, 0x000000, 0.8).setOrigin(0).setInteractive();
    const pw = Math.min(W - 24, 460 * u), ph = Math.min(H - 40, 380 * u);
    const p = panel(this, W / 2, H / 2, pw, ph);
    const t = txt(this, W / 2, H / 2 - 20 * u, 'MOVER: joystick táctil (arrastra el dedo) o WASD / flechas.\nLas armas disparan solas.\n\nRecoge gemas para subir de nivel y elige 1 de 3 mejoras.\nCombina arma nivel 5 + su objeto para EVOLUCIONARLA.\n\nDerrota a los 3 jefes y restablece la infraestructura.\nGanas Puntos de Soporte para desbloquear cosas.\n\nPausa: botón ❚❚ o tecla ESC / P.', 13 * u, '#ffffff', { style: { align: 'center', wordWrap: { width: pw - 30 }, lineSpacing: 3 } });
    const b = button(this, W / 2, H / 2 + ph / 2 - 34 * u, 150 * u, 44 * u, 'ENTENDIDO', () => ov.destroy(), { size: 18 * u });
    ov.add([dim, p, t, b]);
  }
}
