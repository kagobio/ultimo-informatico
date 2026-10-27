import { buildTextures } from '../sprites/Textures.js';
import { Save } from '../systems/Save.js';
import { ART } from '../sprites/Art.js';
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() { this.loadModes(); for (const f of ART.files) this.load.image('art_' + f, 'assets/' + f + '.png'); for (const w of Object.values(ART.walk)) for (let i = 0; i < 4; i++) this.load.image('wk_' + w + '_w' + i, 'assets/walk/' + w + '_w' + i + '.png'); }
  loadModes() {
    const A = 'assets/modes/', L = this.load; L.image('pl_bg', A + 'plat_bg.jpg'); L.image('sh_bg', A + 'shoot_bg.jpg');
    for (let i = 0; i < 6; i++) L.image('ph' + i, A + 'ph' + i + '.png');
    for (let i = 0; i < 4; i++) { L.image('pb' + i, A + 'pb' + i + '.png'); L.image('bl' + i, A + 'bl' + i + '.png'); L.image('pbl' + i, A + 'bl' + i + '.png'); L.image('sp' + i, A + 'sp' + i + '.png'); }
    for (let i = 0; i < 2; i++) { L.image('sb' + i, A + 'sb' + i + '.png'); L.image('lock' + i, A + 'lock' + i + '.png'); L.image('flop' + i, A + 'flop' + i + '.png'); }
    L.image('mail0', A + 'mail0.png');
  }
  walkCheck() { ART.wOk = Object.values(ART.walk).every((w) => [0, 1, 2, 3].every((i) => this.textures.exists('wk_' + w + '_w' + i) && this.textures.get('wk_' + w + '_w' + i).key !== '__MISSING')); }
  create() {
    // las imágenes de assets/ sustituyen a los sprites procedurales con la misma clave
    for (const [key, file] of Object.entries(ART.map)) {
      if (!this.textures.exists('art_' + file)) continue;
      const src = this.textures.get('art_' + file).getSourceImage(); const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
      const g = c.getContext('2d'); g.drawImage(src, 0, 0);
      if (key === 'gem') { const d = g.getImageData(0, 0, c.width, c.height), a = d.data; for (let i = 0; i < a.length; i += 4) { const l = Math.min(255, (a[i] * 0.3 + a[i + 1] * 0.59 + a[i + 2] * 0.11) * 1.25 + 40); a[i] = a[i + 1] = a[i + 2] = l; } g.putImageData(d, 0, 0); } this.textures.addCanvas(key, c); ART.has.add(key.replace(/_[01]$/, ''));
    }
    this.walkCheck();
    buildTextures(this); Save.load();
    const b = document.getElementById('boot'); if (b) b.remove();
    this.scene.start('Menu');
  }
}
