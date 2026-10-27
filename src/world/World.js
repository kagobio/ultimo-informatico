// Colisiones con cajas alineadas (muros y muebles) y campo de flujo para que los enemigos rodeen obstáculos.
export class World {
  constructor(size) {
    this.S = size; this.C = 96; this.boxes = []; this.grid = new Map();
    this.cs = 32; this.gn = Math.ceil(size / 32); this.dist = new Int16Array(this.gn * this.gn); this.blk = null; this.cx = -1; this.cy = -1; this.t = 0;
  }
  add(x0, y0, x1, y1) {
    const b = [x0, y0, x1, y1]; this.boxes.push(b);
    for (let i = Math.floor(x0 / this.C); i <= Math.floor(x1 / this.C); i++) for (let j = Math.floor(y0 / this.C); j <= Math.floor(y1 / this.C); j++) {
      const k = i * 1000 + j; let L = this.grid.get(k); if (!L) { L = []; this.grid.set(k, L); } L.push(b);
    }
    this.blk = null; return b;
  }
  // Empuja el objeto fuera de las cajas. fy = desplazamiento vertical hasta los pies. Devuelve normal de contacto o null.
  push(o, r, fy = 0) {
    let x = o.x, y = o.y + fy, hit = null;
    for (let pass = 0; pass < 2; pass++) {
      const i0 = Math.floor((x - r) / this.C), i1 = Math.floor((x + r) / this.C), j0 = Math.floor((y - r) / this.C), j1 = Math.floor((y + r) / this.C);
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
        const L = this.grid.get(i * 1000 + j); if (!L) continue;
        for (let n = 0; n < L.length; n++) {
          const b = L[n], qx = x < b[0] ? b[0] : x > b[2] ? b[2] : x, qy = y < b[1] ? b[1] : y > b[3] ? b[3] : y, dx = x - qx, dy = y - qy, d2 = dx * dx + dy * dy;
          if (d2 >= r * r) continue;
          if (d2 > 1e-4) { const d = Math.sqrt(d2), k = (r - d) / d; x += dx * k; y += dy * k; hit = [dx / d, dy / d]; }
          else { // centro dentro de la caja: salir por el lado más cercano
            const l = x - b[0], rt = b[2] - x, u = y - b[1], dn = b[3] - y, m = Math.min(l, rt, u, dn);
            if (m === l) { x = b[0] - r; hit = [-1, 0]; } else if (m === rt) { x = b[2] + r; hit = [1, 0]; } else if (m === u) { y = b[1] - r; hit = [0, -1]; } else { y = b[3] + r; hit = [0, 1]; }
          }
        }
      }
    }
    o.x = x; o.y = y - fy; return hit;
  }
  blockedPt(x, y, r) {
    const i0 = Math.floor((x - r) / this.C), i1 = Math.floor((x + r) / this.C), j0 = Math.floor((y - r) / this.C), j1 = Math.floor((y + r) / this.C);
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const L = this.grid.get(i * 1000 + j); if (!L) continue;
      for (let n = 0; n < L.length; n++) { const b = L[n], qx = Math.max(b[0], Math.min(x, b[2])), qy = Math.max(b[1], Math.min(y, b[3])); if ((x - qx) ** 2 + (y - qy) ** 2 < r * r) return true; }
    }
    return false;
  }
  line(x0, y0, x1, y1, r) {
    const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / 20);
    for (let i = 1; i < n; i++) { const t = i / n; if (this.blockedPt(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r)) return true; }
    return false;
  }
  // campo de distancia (BFS) hacia el jugador
  build() {
    const n = this.gn, cs = this.cs; this.blk = new Uint8Array(n * n);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) this.blk[j * n + i] = this.blockedPt(i * cs + cs / 2, j * cs + cs / 2, 13) ? 1 : 0;
  }
  update(px, py, dt) {
    this.t -= dt; const n = this.gn, cs = this.cs, ci = Math.max(0, Math.min(n - 1, Math.floor(px / cs))), cj = Math.max(0, Math.min(n - 1, Math.floor(py / cs)));
    if (this.t > 0 && ci === this.cx && cj === this.cy) return; this.t = 0.25; this.cx = ci; this.cy = cj;
    if (!this.blk) this.build();
    const D = this.dist; D.fill(-1); const q = new Int32Array(n * n); let h = 0, tl = 0; D[cj * n + ci] = 0; q[tl++] = cj * n + ci;
    while (h < tl) { const c = q[h++], i = c % n, j = (c / n) | 0, d = D[c] + 1;
      if (i > 0 && D[c - 1] < 0 && !this.blk[c - 1]) { D[c - 1] = d; q[tl++] = c - 1; }
      if (i < n - 1 && D[c + 1] < 0 && !this.blk[c + 1]) { D[c + 1] = d; q[tl++] = c + 1; }
      if (j > 0 && D[c - n] < 0 && !this.blk[c - n]) { D[c - n] = d; q[tl++] = c - n; }
      if (j < n - 1 && D[c + n] < 0 && !this.blk[c + n]) { D[c + n] = d; q[tl++] = c + n; } }
  }
  // dirección hacia el jugador siguiendo el campo (vecino con menor distancia). null si no hay camino.
  dir(x, y) {
    if (!this.blk) return null; const n = this.gn, cs = this.cs, i = Math.max(0, Math.min(n - 1, Math.floor(x / cs))), j = Math.max(0, Math.min(n - 1, Math.floor(y / cs)));
    let best = this.dist[j * n + i] < 0 ? 1e9 : this.dist[j * n + i], bx = 0, by = 0, found = false;
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { if (!a && !b) continue; const ii = i + a, jj = j + b; if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue; const d = this.dist[jj * n + ii]; if (d < 0) continue;
      if (a && b && (this.blk[j * n + ii] || this.blk[jj * n + i])) continue; const dd = d + (a && b ? 0.4 : 0); if (dd < best) { best = dd; bx = (ii + 0.5) * cs - x; by = (jj + 0.5) * cs - y; found = true; } }
    if (!found) return null; const m = Math.hypot(bx, by) || 1; return [bx / m, by / m];
  }
}
