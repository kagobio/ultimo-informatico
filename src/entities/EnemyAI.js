// Comportamientos de enemigos y jefes. Para un enemigo nuevo: añadir entrada en data/content.js y aquí.
const rnd = (a, b) => a + Math.random() * (b - a);
const hex = () => '0x' + Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
function toward(e, tx, ty) { const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d, d]; }
export function move(e, dt, s, dx, dy, speed) {
  let sx = 0, sy = 0;
  if (!e.isBoss) s.forEachNear(e.x, e.y, e.r * 1.7, (o) => { if (o === e) return; const ox = e.x - o.x, oy = e.y - o.y, d2 = ox * ox + oy * oy, m = (e.r + o.r) * 0.9; if (d2 < m * m && d2 > 0.01) { const d = Math.sqrt(d2); sx += ox / d * (m - d); sy += oy / d * (m - d); } });
  e.x += (dx * speed + e.kx + sx * 9) * dt; e.y += (dy * speed + e.ky + sy * 9) * dt;
  const k = Math.max(0, 1 - dt * 7); e.kx *= k; e.ky *= k;
  if (Math.abs(dx) > 0.2) e.face = dx < 0 ? -1 : 1;
}
function chase(e, dt, s, mul = 1) { const p = s.player; const [dx, dy] = toward(e, p.x, p.y); move(e, dt, s, dx, dy, e.speed * mul); }
function aimed(e, s, tex, speed, dmg, spread = 0, extra = {}) {
  const p = s.player, a = Math.atan2(p.y - e.y, p.x - e.x) + spread;
  s.spawnEBullet(Object.assign({ tex, x: e.x, y: e.y - e.h / 2, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, dmg: dmg * s.dmgScale, r: 6, life: 5, scale: 2.4 }, extra));
}
function ring(e, s, n, tex, speed, dmg, off = 0, extra = {}) {
  for (let i = 0; i < n; i++) { const a = off + (i / n) * Math.PI * 2; s.spawnEBullet(Object.assign({ tex, x: e.x, y: e.y - e.h / 2, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, dmg: dmg * s.dmgScale, r: 6, life: 5, scale: 2.6 }, extra)); }
}
function maybeSay(e, s, dt, every) {
  if (!e.def.phrases) return; e.sayT -= dt;
  if (e.sayT <= 0) { e.sayT = rnd(every, every * 1.8); const p = s.player; if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < 360 * 360) s.fx.say(e, e.def.phrases[Math.floor(Math.random() * e.def.phrases.length)]); }
}
const AI = {
  chase(e, dt, s) { chase(e, dt, s); },
  nopass: {
    init(e) { e.shootT = rnd(2, 5); e.sayT = rnd(3, 9); },
    update(e, dt, s) {
      chase(e, dt, s); maybeSay(e, s, dt, 9); e.shootT -= dt;
      const p = s.player, d2 = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
      if (e.shootT <= 0 && d2 < 300 * 300) { e.shootT = rnd(3.5, 5.5); aimed(e, s, 'p_ticket', 120, 6, 0, { r: 7, life: 5, spin: 4 }); }
    },
  },
  email: {
    init(e) { e.ph = Math.random() * 6; },
    update(e, dt, s) { const p = s.player; const [dx, dy] = toward(e, p.x, p.y); e.ph += dt * 6; const w = Math.sin(e.ph) * 0.45; move(e, dt, s, dx - dy * w, dy + dx * w, e.speed); },
  },
  printer: {
    init(e) { e.shootT = rnd(1, 2.5); e.fanT = rnd(3, 6); },
    update(e, dt, s) {
      const p = s.player, [dx, dy, d] = toward(e, p.x, p.y);
      if (d > 210) move(e, dt, s, dx, dy, e.speed); else move(e, dt, s, 0, 0, 0);
      e.shootT -= dt; e.fanT -= dt;
      if (d < 360 && e.shootT <= 0) { e.shootT = 2.4; aimed(e, s, 'p_toner', 150, 8, 0, { r: 6, life: 4, spin: 6 }); s.sfx('printer'); }
      if (d < 330 && e.fanT <= 0) { e.fanT = 6; for (let i = -1; i <= 1; i++) aimed(e, s, 'p_paper', 190, 5, i * 0.25, { life: 3, spin: 8 }); }
    },
  },
  av: {
    init(e) { e.pulseT = rnd(3, 7); },
    update(e, dt, s) {
      chase(e, dt, s); e.pulseT -= dt;
      if (e.pulseT <= 0) { e.pulseT = 7; const p = s.player; if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < 230 * 230) { s.fx.ring(e.x, e.y - 14, 210, 0x3b78e0, 0.5); p.antivirus(3); } }
    },
  },
  consult: {
    init(e) { e.meetT = rnd(3, 6); },
    update(e, dt, s) {
      const p = s.player, [dx, dy, d] = toward(e, p.x, p.y);
      if (d > 210) move(e, dt, s, dx, dy, e.speed); else if (d < 130) move(e, dt, s, -dx, -dy, e.speed * 0.8); else move(e, dt, s, 0, 0, 0);
      e.meetT -= dt;
      if (e.meetT <= 0 && d < 420) {
        e.meetT = 6.5; s.fx.say(e, '¡Reunión rápida!', 1.5); const zx = e.x + dx * 60, zy = e.y + dy * 60;
        s.addZone({ x: zx, y: zy, r: 52, delay: 1.1, dmg: 0, color: 0xb06bff, onDone: () => { for (let i = 0; i < 3; i++) s.spawnEnemy('minion', zx + rnd(-20, 20), zy + rnd(-20, 20)); } });
      }
    },
  },
  pm: {
    init(e) { e.sayT = rnd(2, 6); },
    update(e, dt, s) {
      chase(e, dt, s); maybeSay(e, s, dt, 7); const p = s.player;
      if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < 170 * 170) p.slowT = Math.max(p.slowT, 0.25);
    },
  },
  bossPrinter: {
    init(e) { e.phase = 1; e.atkT = 2; e.dashT = 0; },
    update(e, dt, s) {
      const p = s.player, r = e.hp / e.maxHp, ph = r > 0.66 ? 1 : r > 0.33 ? 2 : 3;
      if (ph !== e.phase) { e.phase = ph; s.fx.ring(e.x, e.y, 260, 0xffffff, 0.6); s.cameras.main.shake(300, 0.01); s.sfx('boss'); s.announce(ph === 2 ? 'FASE 2: ¡TÓNER!' : 'FASE 3: ¡ERRORES ALEATORIOS!'); e.atkT = 1.2; }
      const [dx, dy, d] = toward(e, p.x, p.y);
      if (e.dashT > 0) { e.dashT -= dt; move(e, dt, s, e.ddx, e.ddy, 360); }
      else { if (d > 130) move(e, dt, s, dx, dy, e.speed * (ph === 2 ? 1.25 : 1)); e.atkT -= dt; }
      if (e.atkT > 0 || e.dashT > 0) return;
      if (ph === 1) { e.atkT = 1.7; for (let i = -2; i <= 2; i++) aimed(e, s, 'p_paper', 210, 8, i * 0.2, { life: 4, spin: 9 }); s.sfx('printer'); s.fx.burst('paper', e.x, e.y - 30, 10); }
      else if (ph === 2) { e.atkT = 1.35; ring(e, s, 10, 'p_toner', 170, 9, Math.random() * 6, { life: 4, spin: 5 }); for (let i = -1; i <= 1; i++) aimed(e, s, 'p_toner', 220, 11, i * 0.15, { life: 4 }); s.sfx('printer'); }
      else {
        e.atkT = 2.5; const k = Math.floor(Math.random() * 3); s.fx.say(e, 'ERROR ' + hex(), 1.4, 14);
        if (k === 0) for (let i = 0; i < 6; i++) s.addZone({ x: p.x + rnd(-170, 170), y: p.y + rnd(-130, 130), r: 56, delay: 1 + i * 0.1, dmg: 18, color: 0xff3030, boom: 'digital' });
        else if (k === 1) { for (let i = 0; i < 8; i++) s.spawnEnemy('error', e.x + rnd(-50, 50), e.y + rnd(-30, 30)); s.sfx('bsod'); }
        else { e.dashT = 0.65; e.ddx = dx; e.ddy = dy; ring(e, s, 10, 'p_paper', 190, 7, 0, { life: 3, spin: 8 }); s.sfx('boom'); }
      }
    },
  },
  bossServer: {
    init(e) { e.atkT = 2.5; e.n = 0; e.phase = 1; },
    update(e, dt, s) {
      const p = s.player, r = e.hp / e.maxHp, [dx, dy, d] = toward(e, p.x, p.y);
      if (r < 0.5 && e.phase === 1) { e.phase = 2; s.fx.ring(e.x, e.y, 300, 0x34e6ff, 0.6); s.cameras.main.shake(300, 0.01); s.sfx('boss'); s.announce('FASE 2: ¡SOBRECARGA!'); }
      if (d > 230) move(e, dt, s, dx, dy, e.speed); else if (d < 150) move(e, dt, s, -dx, -dy, e.speed * 0.6);
      e.atkT -= dt; if (e.atkT > 0) return;
      const ph2 = e.phase === 2; e.atkT = ph2 ? 2.2 : 3.2; const k = e.n++ % 3;
      if (k === 0) {
        s.fx.say(e, 'PANTALLAZO AZUL', 1.6, 14); s.sfx('bsod'); s.cameras.main.flash(250, 20, 60, 255);
        const n = ph2 ? 9 : 6;
        s.addZone({ x: p.x, y: p.y, r: 66, delay: 1.2, dmg: 22, color: 0x2060ff, boom: 'digital' });
        for (let i = 0; i < n; i++) s.addZone({ x: p.x + rnd(-230, 230), y: p.y + rnd(-170, 170), r: 66, delay: 1.2 + i * 0.05, dmg: 22, color: 0x2060ff, boom: 'digital' });
      } else if (k === 1) {
        s.fx.say(e, 'CORTE DE RED', 1.6, 14); s.sfx('cut');
        const offs = [-110, 0, 110];
        for (const o of offs) s.addBeam({ x1: p.x - 800, y1: p.y + o, x2: p.x + 800, y2: p.y + o, w: 38, delay: 1.0, dur: 0.35, dmg: 20 });
        if (ph2) for (const o of [-90, 90]) s.addBeam({ x1: p.x + o, y1: p.y - 800, x2: p.x + o, y2: p.y + 800, w: 38, delay: 1.2, dur: 0.35, dmg: 20 });
      } else {
        s.fx.say(e, 'EXPLOSIÓN DIGITAL', 1.6, 14); s.sfx('boom'); ring(e, s, 14, 'p_blue', 150, 12, 0, { life: 5 });
        s.later(0.4, () => { if (!e.dead) ring(e, s, 14, 'p_blue', 200, 12, 0.22, { life: 5 }); });
        if (ph2) s.later(0.8, () => { if (!e.dead) ring(e, s, 18, 'p_orb', 170, 12, 0.1, { life: 5 }); });
      }
    },
  },
  bossUser: {
    init(e) { e.sayT = 3; e.n = 0; e.waveT = 3; e.fanT = 2; e.phase = 1; },
    update(e, dt, s) {
      const p = s.player, r = e.hp / e.maxHp, [dx, dy, d] = toward(e, p.x, p.y);
      const ph = r > 0.5 ? 1 : r > 0.25 ? 2 : 3;
      if (ph !== e.phase) { e.phase = ph; s.fx.ring(e.x, e.y, 300, 0xff4040, 0.6); s.cameras.main.shake(300, 0.01); s.sfx('boss'); s.announce(ph === 2 ? 'FASE 2: «LLEVA ASÍ MESES»' : 'FASE 3: ¡FURIA DE USUARIO!'); if (ph === 3) e.permTint = 0xff9090; e.sprite.setTint(0xff9090); }
      move(e, dt, s, dx, dy, e.speed * (ph === 1 ? 1 : ph === 2 ? 1.3 : 1.55));
      e.sayT -= dt; e.waveT -= dt;
      if (e.sayT <= 0) {
        e.sayT = ph === 1 ? 5 : 3.6; const k = e.n++ % 3;
        const lines = ['No he tocado nada.', 'Lleva así meses.', 'Me sale un error raro.']; s.fx.say(e, lines[k], 2, 16);
        const cap = s.enemies.length < 240;
        if (cap) {
          if (k === 0) for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; s.spawnEnemy('email', e.x + Math.cos(a) * 60, e.y + Math.sin(a) * 40); }
          else if (k === 1) for (let i = 0; i < 5; i++) s.spawnEnemy('nopass', e.x + rnd(-80, 80), e.y + rnd(-60, 60));
          else { for (let i = 0; i < 6; i++) s.spawnEnemy('error', e.x + rnd(-80, 80), e.y + rnd(-60, 60)); if (ph > 1) s.spawnEnemy('av', e.x + 50, e.y); }
        }
        s.sfx('mail');
      }
      if (e.waveT <= 0 && d < 150) { e.waveT = 3; s.addZone({ x: e.x, y: e.y, r: 125, delay: 0.6, dmg: 18, color: 0xff6040, boom: 'dust' }); }
      if (ph === 3) { e.fanT -= dt; if (e.fanT <= 0) { e.fanT = 2.2; for (let i = -3; i <= 3; i++) aimed(e, s, 'p_ticket', 180, 9, i * 0.17, { life: 4, spin: 5 }); } }
    },
  },
};
export function initAI(e) { const a = AI[e.def.ai]; if (a && a.init) a.init(e); }
export function updateAI(e, dt, s) { const a = AI[e.def.ai]; if (typeof a === 'function') a(e, dt, s); else if (a) a.update(e, dt, s); }
