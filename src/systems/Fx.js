// Efectos visuales: partículas, números de daño, bocadillos, rayos, anillos.
export class Fx {
  constructor(scene) {
    this.s = scene;
    const mk = (cfg) => scene.add.particles(0, 0, 'spark', Object.assign({ emitting: false, depth: 9e5 }, cfg));
    this.em = {
      hit: mk({ speed: { min: 60, max: 170 }, lifespan: 260, scale: { start: 1.6, end: 0 }, tint: [0xfff2a0, 0xffffff] }),
      boom: mk({ speed: { min: 80, max: 300 }, lifespan: 520, scale: { start: 3.2, end: 0 }, tint: [0xff9a2a, 0xffd24a, 0xff4020], blendMode: 'ADD' }),
      dust: mk({ speed: { min: 40, max: 200 }, lifespan: 480, scale: { start: 3, end: 0 }, tint: [0xe8d8b0, 0xb8a888], alpha: { start: 0.9, end: 0 } }),
      digital: mk({ speed: { min: 60, max: 260 }, lifespan: 480, scale: { start: 2.4, end: 0 }, tint: [0x34e6ff, 0x5df28a, 0x7a5bff], blendMode: 'ADD' }),
      paper: mk({ speed: { min: 30, max: 130 }, lifespan: 600, scale: { start: 2.6, end: 0.4 }, tint: [0xffffff, 0xe8e8f0], gravityY: 120 }),
      gem: mk({ speed: { min: 30, max: 90 }, lifespan: 300, scale: { start: 1.6, end: 0 }, tint: [0x34e6ff] }),
    };
    this.gfx = scene.add.graphics().setDepth(8e5);
    this.bolts = [];
    this.texts = []; this.dmgPool = [];
    this.says = [];
    for (let i = 0; i < 36; i++) { const t = scene.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '14px', fontStyle: 'bold', color: '#fff', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setDepth(9e5 + 5).setVisible(false); this.dmgPool.push(t); }
    for (let i = 0; i < 5; i++) { const t = scene.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '12px', fontStyle: 'bold', color: '#101020', backgroundColor: '#ffffff', padding: { x: 5, y: 3 } }).setOrigin(0.5, 1).setDepth(9e5 + 6).setVisible(false); this.says.push({ t, life: 0, ent: null }); }
  }
  burst(kind, x, y, n = 6) { const e = this.em[kind]; if (e) e.explode(n, x, y); }
  dmg(x, y, v, crit, color) {
    const t = this.dmgPool.find((o) => !o.visible); if (!t) return;
    t.setText(String(Math.round(v))).setPosition(x + (Math.random() - 0.5) * 10, y - 12).setVisible(true).setAlpha(1)
      .setColor(color || (crit ? '#ffe14a' : '#ffffff')).setFontSize(crit ? 20 : 13);
    t.vy = -46; t.life = 0.55;
  }
  say(ent, text, life = 1.8, size = 12) {
    if (this.says.filter((o) => o.life > 0).length >= (size > 12 ? 2 : 1)) return;
    const o = this.says.find((q) => q.life <= 0); if (!o) return;
    o.life = life; o.ent = ent; o.t.setText(text).setFontSize(size).setVisible(true); o.t.setPosition(ent.x, ent.y - ent.h - 8); this.s.sfx('say');
  }
  ring(x, y, r, color = 0xffffff, dur = 0.35) {
    const c = this.s.add.circle(x, y, r, 0, 0).setStrokeStyle(4, color, 1).setDepth(8e5).setScale(0.2);
    this.s.tweens.add({ targets: c, scale: 1, alpha: 0, duration: dur * 1000, ease: 'Cubic.easeOut', onComplete: () => c.destroy() });
  }
  bolt(x1, y1, x2, y2) { this.bolts.push({ x1, y1, x2, y2, t: 0.1 }); }
  update(dt) {
    const g = this.gfx; g.clear();
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const b = this.bolts[i]; b.t -= dt; if (b.t <= 0) { this.bolts.splice(i, 1); continue; }
      g.lineStyle(3, 0x34e6ff, 1); g.beginPath(); g.moveTo(b.x1, b.y1);
      const n = 4; for (let k = 1; k < n; k++) { const f = k / n; g.lineTo(b.x1 + (b.x2 - b.x1) * f + (Math.random() - 0.5) * 14, b.y1 + (b.y2 - b.y1) * f + (Math.random() - 0.5) * 14); }
      g.lineTo(b.x2, b.y2); g.strokePath(); g.lineStyle(1, 0xffffff, 1); g.strokePath();
    }
    for (const t of this.dmgPool) if (t.visible) { t.life -= dt; t.y += t.vy * dt; if (t.life < 0.2) t.setAlpha(Math.max(0, t.life / 0.2)); if (t.life <= 0) t.setVisible(false); }
    for (const o of this.says) if (o.life > 0) { o.life -= dt; if (o.ent && !o.ent.dead) { const cam = this.s.cameras.main, hw = o.t.width / 2, v = cam.worldView; o.t.setPosition(Math.max(v.x + hw + 4, Math.min(v.right - hw - 4, o.ent.x)), Math.max(v.y + 182 / cam.zoom, o.ent.y - o.ent.h - 8)); } if (o.life <= 0) o.t.setVisible(false); }
  }
}
