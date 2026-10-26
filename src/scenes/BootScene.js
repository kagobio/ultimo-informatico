import { buildTextures } from '../sprites/Textures.js';
import { Save } from '../systems/Save.js';
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    buildTextures(this); Save.load();
    const b = document.getElementById('boot'); if (b) b.remove();
    this.scene.start('Menu');
  }
}
