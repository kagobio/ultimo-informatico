import { Sfx } from './Sfx.js';
export const FONT = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';
export const uiScale = (scene) => Phaser.Math.Clamp(Math.min(scene.scale.width, scene.scale.height * 0.62) / 400, 0.8, 1.7);
export function txt(scene, x, y, s, size, color = '#ffffff', o = {}) {
  return scene.add.text(x, y, s, Object.assign({ fontFamily: FONT, fontSize: size + 'px', color, fontStyle: 'bold', stroke: '#0b1020', strokeThickness: Math.max(2, size / 7) }, o.style || {})).setOrigin(o.ox ?? 0.5, o.oy ?? 0.5);
}
export function button(scene, x, y, w, h, label, cb, o = {}) {
  const c = scene.add.container(x, y);
  const bg = scene.add.rectangle(0, 0, w, h, o.fill ?? 0x1f6feb).setStrokeStyle(3, o.stroke ?? 0x9fd0ff);
  const sh = scene.add.rectangle(0, h * 0.5 - 4, w - 6, 6, 0x000000, 0.25);
  const t = txt(scene, 0, 0, label, o.size || 20, '#ffffff', { style: { align: 'center', wordWrap: { width: w - 12 } } });
  c.add([bg, sh, t]); c.setSize(w, h); c.bg = bg; c.label = t; c.enabled = true;
  bg.setInteractive({ useHandCursor: true });
  bg.on('pointerdown', () => { if (!c.enabled) return; c.setScale(0.96); });
  bg.on('pointerout', () => c.setScale(1));
  bg.on('pointerup', () => { c.setScale(1); if (!c.enabled) return; Sfx.init(); Sfx.play('click'); cb(); });
  c.setEnabled = (v) => { c.enabled = v; bg.setFillStyle(v ? (o.fill ?? 0x1f6feb) : 0x39404f); bg.setStrokeStyle(3, v ? (o.stroke ?? 0x9fd0ff) : 0x5a6275); t.setAlpha(v ? 1 : 0.55); };
  c.setLabel = (s) => t.setText(s);
  return c;
}
export function panel(scene, x, y, w, h, o = {}) { return scene.add.rectangle(x, y, w, h, o.fill ?? 0x111a33, o.alpha ?? 0.94).setStrokeStyle(o.sw ?? 3, o.stroke ?? 0x3b5a9a); }
export function fmtTime(t) { t = Math.max(0, Math.floor(t)); return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); }
export function bgFloor(scene, tint = 0x3a4a78) {
  const f = scene.add.tileSprite(0, 0, scene.scale.width, scene.scale.height, 'floor').setOrigin(0).setTileScale(1.5).setTint(tint).setDepth(-10);
  scene.events.on('update', () => { f.tilePositionX += 0.25; f.tilePositionY += 0.125; });
  scene.scale.on('resize', (s) => f.setSize(s.width, s.height)); return f;
}
