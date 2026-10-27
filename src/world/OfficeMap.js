// Oficina apocalíptica con neón: 3x3 salas conectadas por puertas, muros con volumen y colisiones por cajas.
import { WORLD } from '../config.js';
const T = 44, WH = 40, D = 190;
const XS = [0, 760, 1640, 2400], YS = [0, 760, 1640, 2400];
const ROOMS = [
  { n: 'SALA DE REUNIONES', c: 0xff4fd8, p: ['prop_table', 'prop_table', 'prop_plant', 'prop_cab', 'prop_bin'], k: 7 },
  { n: 'DESPACHOS', c: 0x3ae8ff, p: ['prop_desk', 'prop_desk', 'prop_desk', 'prop_plant', 'prop_bin', 'prop_box'], k: 13 },
  { n: 'CPD', c: 0x2fffb0, p: ['prop_rack', 'prop_rack', 'prop_rack', 'prop_rack', 'prop_cone'], k: 15 },
  { n: 'ARCHIVO', c: 0xffd24a, p: ['prop_cab', 'prop_cab', 'prop_cab', 'prop_box', 'prop_bin'], k: 14 },
  { n: 'OPEN SPACE', c: 0x7f8fff, p: ['prop_desk', 'prop_desk', 'prop_plant', 'prop_bin', 'prop_cone', 'prop_box', 'prop_printer'], k: 20 },
  { n: 'SALA DE DESCANSO', c: 0x9aff4a, p: ['prop_cooler', 'prop_plant', 'prop_plant', 'prop_table', 'prop_bin'], k: 8 },
  { n: 'IMPRESORAS', c: 0xff8a3a, p: ['prop_printer', 'prop_printer', 'prop_printer', 'prop_box', 'prop_bin'], k: 14 },
  { n: 'ALMACEN', c: 0xff4a5a, p: ['prop_box', 'prop_box', 'prop_box', 'prop_cone', 'prop_cab'], k: 15 },
  { n: 'SOPORTE', c: 0x4a9aff, p: ['prop_desk', 'prop_desk', 'prop_printer', 'prop_cooler', 'prop_cone', 'prop_box'], k: 12 },
];
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hex = (c) => '#' + c.toString(16).padStart(6, '0');

export function buildOffice(s) {
  const W = WORLD, rand = rng(20261027), pieces = s.wallPieces = [], world = s.world;
  const floorG = s.add.graphics().setDepth(-95000), decalG = s.add.graphics().setDepth(-90000), lightG = s.add.graphics().setDepth(-89000).setBlendMode(Phaser.BlendModes.ADD);
  // --- muros: recorridos con huecos de puerta
  const runs = [];
  const vline = (x, a, b) => runs.push([x - T / 2, a, x + T / 2, b, false]);
  const hline = (y, a, b) => runs.push([a, y - T / 2, b, y + T / 2, true]);
  runs.push([0, 0, W, T, true], [0, W - T, W, W, true]); // arriba y abajo
  runs.push([0, T, T, W - T, false], [W - T, T, W, W - T, false]);
  for (const x of [XS[1], XS[2]]) for (let r = 0; r < 3; r++) { const m = (YS[r] + YS[r + 1]) / 2; vline(x, YS[r], m - D / 2); vline(x, m + D / 2, YS[r + 1]); }
  for (const y of [YS[1], YS[2]]) for (let c = 0; c < 3; c++) { const m = (XS[c] + XS[c + 1]) / 2; hline(y, XS[c], m - D / 2); hline(y, m + D / 2, XS[c + 1]); }
  const neonAt = (x, y) => { const c = Math.min(2, x < XS[1] ? 0 : x < XS[2] ? 1 : 2), r = Math.min(2, y < YS[1] ? 0 : y < YS[2] ? 1 : 2); return ROOMS[r * 3 + c].c; };
  for (const [x0, y0, x1, y1, hz] of runs) {
    world.add(x0, y0, x1, y1);
    const neon = hz ? neonAt((x0 + x1) / 2, y1 + 40) : 0x7f8fff;
    if (hz) { const n = Math.max(1, Math.ceil((x1 - x0) / 380)), w = (x1 - x0) / n; for (let i = 0; i < n; i++) piece(x0 + i * w, y0, x0 + (i + 1) * w, y1, neon, true); }
    else { const n = Math.max(1, Math.ceil((y1 - y0) / 96)), h = (y1 - y0) / n; for (let i = 0; i < n; i++) piece(x0, y0 + i * h, x1, y0 + (i + 1) * h, neon, i === n - 1); }
  }
  function piece(x0, y0, x1, y1, neon, front) {
    const g = s.add.graphics().setDepth(y1), w = x1 - x0, h = y1 - y0;
    g.fillStyle(0x4a5784, 1).fillRect(x0, y0 - WH, w, h); g.fillStyle(0x7f90c8, 1).fillRect(x0, y0 - WH, w, 3); g.fillStyle(0x2a3358, 1).fillRect(x0, y1 - WH - 2, w, 2);
    if (front) {
      g.fillGradientStyle(0x3a4676, 0x3a4676, 0x161c38, 0x161c38, 1).fillRect(x0, y1 - WH, w, WH);
      for (let bx = x0; bx < x1; bx += 38) g.fillStyle(0x0d1226, 0.35).fillRect(bx, y1 - WH + 18, 2, 22);
      g.fillStyle(0x0d1226, 0.35).fillRect(x0, y1 - WH + 18, w, 2);
      if (w > 60) { g.fillStyle(neon, 0.28).fillRect(x0, y1 - WH + 5, w, 9); g.fillStyle(neon, 1).fillRect(x0, y1 - WH + 8, w, 3); }
    }
    pieces.push({ g, x0, y0: y0 - WH, x1, y1, a: 1 });
  }
  // --- salas: suelo neón, etiquetas, luces, decorado
  const placed = [];
  const inset = 86, cross = 112;
  ROOMS.forEach((R, i) => {
    const r = (i / 3) | 0, c = i % 3, x0 = XS[c] + (c ? T / 2 : T), x1 = XS[c + 1] - (c < 2 ? T / 2 : T), y0 = YS[r] + (r ? T / 2 : T), y1 = YS[r + 1] - (r < 2 ? T / 2 : T), cx = (XS[c] + XS[c + 1]) / 2, cy = (YS[r] + YS[r + 1]) / 2;
    floorG.fillStyle(0x050814, 0.38).fillRect(x0, y0, x1 - x0, y1 - y0); floorG.fillStyle(R.c, 0.08).fillRect(x0, y0, x1 - x0, y1 - y0);
    floorG.lineStyle(5, R.c, 0.35).strokeRect(x0 + 26, y0 + 26, x1 - x0 - 52, y1 - y0 - 52);
    floorG.fillStyle(0x0b1020, 0.22); for (let k = 0; k < 3; k++) { const ex = rand() * (x1 - x0 - 200) + x0 + 100, ey = rand() * (y1 - y0 - 200) + y0 + 100; floorG.fillEllipse(ex, ey, 70 + rand() * 90, 26 + rand() * 30); } // quemaduras
    // luces de neón
    for (let k = 0; k < 4; k++) { const lx = x0 + 120 + rand() * (x1 - x0 - 240), ly = y0 + 120 + rand() * (y1 - y0 - 240); for (let q = 0; q < 14; q++) lightG.fillStyle(R.c, 0.016).fillCircle(lx, ly, 200 - q * 13); }
    // restos: papeles, cables y manchas
    for (let k = 0; k < 14; k++) { const px = x0 + 40 + rand() * (x1 - x0 - 80), py = y0 + 50 + rand() * (y1 - y0 - 100), a = rand() * 3, w = 9 + rand() * 6, h = 11 + rand() * 5; decalG.fillStyle(0xe8ecf8, 0.75).fillPoints([{ x: px, y: py }, { x: px + Math.cos(a) * w, y: py + Math.sin(a) * w }, { x: px + Math.cos(a) * w - Math.sin(a) * h, y: py + Math.sin(a) * w + Math.cos(a) * h }, { x: px - Math.sin(a) * h, y: py + Math.cos(a) * h }], true); }
    for (let k = 0; k < 4; k++) { const px = x0 + 60 + rand() * (x1 - x0 - 120), py = y0 + 60 + rand() * (y1 - y0 - 120); decalG.lineStyle(3, 0x111a30, 0.8).beginPath().moveTo(px, py).lineTo(px + 40 + rand() * 60, py + (rand() - 0.5) * 40).lineTo(px + 90 + rand() * 80, py + (rand() - 0.5) * 70).strokePath(); }
    for (let k = 0; k < 3; k++) { const px = x0 + 80 + rand() * (x1 - x0 - 160), py = y0 + 80 + rand() * (y1 - y0 - 160); decalG.fillStyle(0x7a1426, 0.45).fillEllipse(px, py, 34 + rand() * 30, 14 + rand() * 12); }
    // etiqueta luminosa en el muro norte de la sala
    const wy = (r ? YS[r] + T / 2 : T) - WH / 2 + 3, t = s.add.text(cx - 255, wy, R.n, { fontFamily: 'monospace', fontSize: '13px', fontStyle: 'bold', color: hex(R.c) }).setOrigin(0.5).setDepth((r ? YS[r] + T / 2 : T) + 1).setShadow(0, 0, hex(R.c), 8, false, true);
    s.tweens.add({ targets: t, alpha: 0.55, duration: 700 + rand() * 900, yoyo: true, repeat: -1, delay: rand() * 800 });
    // muebles
    let n = 0, tries = 0;
    while (n < R.k && tries++ < 400) {
      const x = x0 + inset + rand() * (x1 - x0 - 2 * inset), y = y0 + inset + 30 + rand() * (y1 - y0 - 2 * inset - 30);
      if (Math.abs(x - cx) < cross || Math.abs(y - cy) < cross) continue;
      if (i === 4 && Math.hypot(x - cx, y - cy) < 190) continue;
      if (placed.some((q) => Math.abs(q[0] - x) < 112 && Math.abs(q[1] - y) < 80)) continue;
      placed.push([x, y]); s.addProp(R.p[Math.floor(rand() * R.p.length)], x, y); n++;
    }
    // marcas de puerta
    const doors = [];
    if (c < 2) doors.push([XS[c + 1], cy, 1]); if (r < 2) doors.push([cx, YS[r + 1], 0]);
    for (const [dx, dy, vt] of doors) { const gl = s.add.rectangle(dx, dy, vt ? 60 : D, vt ? D : 60, 0xff2a3a, 0.16).setDepth(-88000).setBlendMode(Phaser.BlendModes.ADD); s.tweens.add({ targets: gl, alpha: 0.03, duration: 500 + rand() * 600, yoyo: true, repeat: -1 }); floorG.fillStyle(0xffd24a, 0.55).fillRect(vt ? dx - 4 : dx - D / 2, vt ? dy - D / 2 : dy - 4, vt ? 8 : D, vt ? D : 8); }
  });
}
// atenúa los muros que tapan al jugador
export function updateOffice(s, dt) {
  const p = s.player, fx = p.x, fy = p.y + 34, k = Math.min(1, dt * 10);
  for (const w of s.wallPieces) {
    const hid = w.y1 > fy && fx > w.x0 - 28 && fx < w.x1 + 28 && p.y - 42 < w.y1 && p.y + 40 > w.y0;
    const ta = hid ? 0.3 : 1; if (Math.abs(w.a - ta) > 0.01) { w.a += (ta - w.a) * k; w.g.setAlpha(w.a); }
  }
}
