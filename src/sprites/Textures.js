// Sprites temporales generados por código (pixel art). Sustituibles por PNG reales:
// basta con cargar una textura con la misma clave en BootScene.
const S = 1;
function make(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return;
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const R = (x, y, ww, hh, col) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); };
  draw(R, g, w, h);
  const b = document.createElement('canvas'); b.width = w * S; b.height = h * S; const bg = b.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, w * S, h * S);
  scene.textures.addCanvas(key, b);
}
const K = '#141022'; // contorno
function person(R, o, f) {
  const lo = f ? 1 : 0, ro = f ? 0 : 1;
  // piernas
  R(4, 15 + lo - 1, 3, 4, K); R(9, 15 + ro - 1, 3, 4, K);
  R(5, 15 + lo - 1, 1, 3, o.pants); R(10, 15 + ro - 1, 1, 3, o.pants);
  // cuerpo
  R(3, 8, 10, 8, K); R(4, 9, 8, 6, o.shirt);
  if (o.tie) R(7, 9, 2, 5, o.tie);
  R(2, 9, 2, 5, K); R(12, 9, 2, 5, K); R(2, 10, 1, 3, o.skin); R(13, 10, 1, 3, o.skin);
  // cabeza
  R(3, 1, 10, 8, K); R(4, 2, 8, 6, o.skin);
  R(3, 0, 10, 3, o.hair); if (o.hairLong) { R(3, 3, 2, 5, o.hair); R(11, 3, 2, 5, o.hair); }
  if (o.cap) { R(2, 0, 12, 2, o.cap); R(10, 1, 5, 1, o.cap); }
  // ojos
  if (o.glasses) { R(4, 4, 3, 2, '#fff'); R(9, 4, 3, 2, '#fff'); R(7, 4, 2, 1, K); R(5, 4, 1, 2, K); R(10, 4, 1, 2, K); }
  else if (o.shades) { R(4, 4, 8, 2, '#111'); }
  else { R(5, 4, 1, 2, K); R(10, 4, 1, 2, K); }
  if (o.angry) { R(4, 3, 3, 1, '#a00'); R(9, 3, 3, 1, '#a00'); R(6, 7, 4, 1, '#600'); }
  if (o.extra) o.extra(R);
}
const skins = { clasico: null };
export function buildTextures(scene) {
  // Floor tile iso 64x32: rombo central + esquinas del vecino (patrón de ajedrez isométrico)
  if (!scene.textures.exists('floor')) {
    const c = document.createElement('canvas'); c.width = 64; c.height = 32; const g = c.getContext('2d');
    g.fillStyle = '#9aa0ad'; g.fillRect(0, 0, 64, 32);
    g.fillStyle = '#b7bcc8'; g.beginPath(); g.moveTo(32, 0); g.lineTo(64, 16); g.lineTo(32, 32); g.lineTo(0, 16); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(32, 2); g.lineTo(58, 15); g.lineTo(32, 15); g.closePath(); g.fill();
    scene.textures.addCanvas('floor', c);
  }
  const mk = (key, o) => { make(scene, key + '_0', 16, 20, (R) => person(R, o, 0)); make(scene, key + '_1', 16, 20, (R) => person(R, o, 1)); };
  mk('p', { skin: '#f2b98f', hair: '#5a3a22', shirt: '#2f6fe0', pants: '#27304a', glasses: true, tie: '#ffd24a', extra: (R) => { R(1, 8, 3, 5, '#2a2f45'); R(12, 12, 3, 2, '#c9d2e8'); R(12, 13, 4, 1, '#222'); } });
  mk('e_nopass', { skin: '#f0c9a0', hair: '#7a4a2a', shirt: '#f4f4f4', pants: '#3a4a6a', tie: '#3b6be0', extra: (R) => { R(11, 0, 3, 1, '#ffd24a'); R(12, 1, 1, 1, '#ffd24a'); } });
  mk('e_consult', { skin: '#e9b890', hair: '#222', shirt: '#4a4f66', pants: '#2c3044', tie: '#ffc83a', shades: true, extra: (R) => { R(0, 13, 5, 4, '#6b4a2a'); R(1, 12, 3, 1, '#222'); } });
  mk('e_pm', { skin: '#f08a70', hair: '#222', shirt: '#b02040', pants: '#2a2a3a', tie: '#111', angry: true, extra: (R) => { R(0, 9, 4, 6, '#f4e8c8'); R(1, 10, 2, 1, '#888'); R(1, 12, 2, 1, '#888'); } });
  mk('e_minion', { skin: '#f0c9a0', hair: '#333', shirt: '#7ac0ff', pants: '#3a4a6a' });
  mk('b_user', { skin: '#e8a98a', hair: '#9c9a98', shirt: '#6b6f7a', pants: '#4a3a2a', angry: true, extra: (R) => { R(0, -0, 16, 1, '#9c9a98'); R(1, 11, 3, 4, '#fff'); R(4, 12, 1, 2, '#fff'); R(1, 12, 3, 1, '#c33'); } });
  // Skins de jugador (variantes de color)
  const sk = (id, o) => { make(scene, 'p_' + id + '_0', 16, 20, (R) => person(R, o, 0)); make(scene, 'p_' + id + '_1', 16, 20, (R) => person(R, o, 1)); };
  const base = { skin: '#f2b98f', hair: '#5a3a22', glasses: true };
  sk('hacker', { ...base, shirt: '#16331f', pants: '#0d1a12', tie: '#5df28a', hair: '#111' });
  sk('dorado', { ...base, shirt: '#fff3c4', pants: '#5a4a1a', tie: '#ffb400' });
  sk('rgb', { ...base, shirt: '#ff3dcb', pants: '#3a1a6a', tie: '#3dffe8', hair: '#8a2be2' });
  // personajes jugables (cabello/camiseta distintos)
  const ch = (id, o) => { make(scene, 'c_' + id + '_0', 16, 20, (R) => person(R, o, 0)); make(scene, 'c_' + id + '_1', 16, 20, (R) => person(R, o, 1)); };
  ch('junior', { skin: '#f2b98f', hair: '#c4742a', shirt: '#f4f4f4', pants: '#4a6a9a', cap: '#2f6fe0' });
  ch('admin', { skin: '#d9a07a', hair: '#222', shirt: '#2a2f45', pants: '#1a1d2e', glasses: true, tie: '#5df28a', extra: (R) => { R(1, 10, 4, 4, '#556'); R(2, 11, 2, 1, '#5df28a'); } });
  ch('ms', { skin: '#f2b98f', hair: '#7a2a2a', shirt: '#0a6ccc', pants: '#222d44', glasses: true, tie: '#f25022', hairLong: true });
  ch('printer', { skin: '#e0a880', hair: '#222', shirt: '#e0e0e0', pants: '#3a3a4a', shades: true, tie: '#00bcd4', extra: (R) => { R(0, 12, 5, 4, '#bbb'); R(1, 11, 3, 1, '#fff'); } });
  ch('devops', { skin: '#f2b98f', hair: '#7a2be2', shirt: '#17102e', pants: '#17102e', glasses: true, tie: '#ff3dcb', hairLong: true, extra: (R) => { R(0, 0, 16, 1, '#ff3dcb'); } });

  // Enemigos no humanos (2 frames)
  const email = (f) => (R) => { R(0, 3 + f, 14, 10, K); R(1, 4 + f, 12, 8, '#f4f4ff'); R(1, 4 + f, 12, 1, '#c8c8e8'); R(2, 5 + f, 4, 2, '#c8c8e8'); R(8, 5 + f, 4, 2, '#c8c8e8'); R(3, 6 + f, 2, 2, '#c00'); R(9, 6 + f, 2, 2, '#c00'); R(5, 9 + f, 4, 1, '#600'); R(-0, 1 + f, 2, 3, '#aef'); R(12, 1 + f, 2, 3, '#aef'); };
  make(scene, 'e_email_0', 14, 14, email(0)); make(scene, 'e_email_1', 14, 14, email(1));
  const printer = (f) => (R) => { R(0, 6, 24, 14, K); R(1, 7, 22, 12, '#b8bcc8'); R(2, 3, 20, 4, K); R(3, 4, 18, 3, '#f6f6f6'); R(3, 8, 18, 3, '#8a90a0'); R(5, 12, 3, 3, '#e11'); R(16, 12, 3, 3, '#e11'); R(6, 16, 12, 2, K); R(8, 17, 8, 1, '#fff'); R(4 + f * 14, 1, 5, 3, '#fff'); R(19, 9, 3, 2, '#0c0'); };
  make(scene, 'e_printer_0', 24, 20, printer(0)); make(scene, 'e_printer_1', 24, 20, printer(1));
  const av = (f) => (R) => { R(1, 0, 14, 16, K); R(2, 1, 12, 13, '#3b78e0'); R(3, 2, 10, 4, '#6aa0ff'); R(4, 14, 8, 2, K); R(7, 15 - f, 2, 2, K); R(5, 5, 6, 6, '#fff'); R(5, 5, 2, 2, '#d22'); R(9, 5, 2, 2, '#d22'); R(7, 7, 2, 2, '#d22'); R(5, 9, 2, 2, '#d22'); R(9, 9, 2, 2, '#d22'); };
  make(scene, 'e_av_0', 16, 16, av(0)); make(scene, 'e_av_1', 16, 16, av(1));
  const err = (f) => (R) => { R(0, 0 + f, 10, 10, K); R(1, 1 + f, 8, 8, '#e22'); R(4, 2 + f, 2, 4, '#fff'); R(4, 7 + f, 2, 1, '#fff'); };
  make(scene, 'e_error_0', 10, 11, err(0)); make(scene, 'e_error_1', 10, 11, err(1));
  // Jefes
  const bprinter = (f) => (R) => { R(0, 14, 40, 26, K); R(2, 15, 36, 24, '#a9aebb'); R(4, 6, 32, 9, K); R(6, 7, 28, 7, '#f8f8f8'); R(6, 17, 28, 6, '#7a8090'); R(8, 25, 6, 6, '#ff2020'); R(26, 25, 6, 6, '#ff2020'); R(9, 26, 2, 2, '#fff'); R(27, 26, 2, 2, '#fff'); R(10, 33, 20, 4, K); for (let i = 0; i < 6; i++) R(11 + i * 3, 33, 2, 3 + (i + f) % 2, '#fff'); R(0, 0 + f * 2, 8, 6, '#fff'); R(32, 2 - f * 2, 8, 6, '#fff'); R(12, 1 + f, 6, 5, '#ddd'); };
  make(scene, 'b_printer_0', 40, 42, bprinter(0)); make(scene, 'b_printer_1', 40, 42, bprinter(1));
  const bserver = (f) => (R) => { R(0, 0, 32, 52, K); R(2, 2, 28, 48, '#2a3050'); for (let i = 0; i < 6; i++) { R(4, 4 + i * 8, 24, 6, '#3d4670'); R(6, 6 + i * 8, 2, 2, ((i + f) % 2) ? '#5df28a' : '#ff4040'); R(10, 6 + i * 8, 2, 2, ((i + f + 1) % 2) ? '#5df28a' : '#ffd24a'); R(18, 6 + i * 8, 8, 2, '#1a2040'); } R(8, 44, 16, 4, '#ff2020'); R(10, 45, 12, 2, '#fff'); };
  make(scene, 'b_server_0', 32, 52, bserver(0)); make(scene, 'b_server_1', 32, 52, bserver(1));
  // Proyectiles / armas
  make(scene, 'p_key', 8, 8, (R) => { R(0, 0, 8, 8, K); R(1, 1, 6, 5, '#e8eaf2'); R(1, 6, 6, 1, '#9aa0b0'); R(3, 2, 2, 2, '#333'); });
  make(scene, 'p_mouse', 8, 10, (R) => { R(1, 0, 6, 10, K); R(2, 1, 4, 8, '#2a2f45'); R(2, 1, 4, 3, '#ff2050'); R(3, 0, 2, 3, '#ff80a0'); R(3, 4, 2, 2, '#fff'); });
  make(scene, 'p_cable', 10, 10, (R) => { R(1, 1, 8, 8, K); R(2, 2, 6, 6, '#2a7bff'); R(3, 3, 4, 4, '#7fd4ff'); R(4, 4, 2, 2, '#fff'); });
  make(scene, 'p_hammer', 16, 18, (R) => { R(6, 6, 4, 12, K); R(7, 7, 2, 11, '#a0643a'); R(0, 0, 16, 8, K); R(1, 1, 14, 6, '#d02030'); R(1, 1, 14, 2, '#ff7080'); R(12, 1, 3, 6, '#901020'); });
  make(scene, 'p_mail', 10, 8, (R) => { R(0, 0, 10, 8, K); R(1, 1, 8, 6, '#fff'); R(1, 1, 3, 2, '#0a6ccc'); R(4, 2, 2, 2, '#0a6ccc'); R(6, 1, 3, 2, '#0a6ccc'); });
  make(scene, 'p_ps', 10, 10, (R) => { R(0, 0, 10, 10, K); R(1, 1, 8, 8, '#0b2a6a'); R(2, 3, 2, 1, '#fff'); R(3, 4, 2, 1, '#fff'); R(2, 5, 2, 1, '#fff'); R(5, 6, 3, 1, '#fff'); });
  make(scene, 'p_paper', 8, 10, (R) => { R(0, 0, 8, 10, K); R(1, 1, 6, 8, '#fff'); R(2, 3, 4, 1, '#99a'); R(2, 5, 4, 1, '#99a'); });
  make(scene, 'p_toner', 8, 8, (R) => { R(1, 0, 6, 8, K); R(0, 1, 8, 6, K); R(1, 1, 6, 6, '#1a1a22'); R(2, 2, 2, 2, '#00e5ff'); });
  make(scene, 'p_ticket', 10, 7, (R) => { R(0, 0, 10, 7, K); R(1, 1, 8, 5, '#ffd24a'); R(2, 2, 4, 1, '#a07000'); R(2, 4, 6, 1, '#a07000'); });
  make(scene, 'p_orb', 10, 10, (R) => { R(2, 0, 6, 10, K); R(0, 2, 10, 6, K); R(1, 1, 8, 8, '#ff3d6e'); R(2, 2, 6, 6, '#ff9db6'); });
  make(scene, 'p_blue', 10, 10, (R) => { R(2, 0, 6, 10, K); R(0, 2, 10, 6, K); R(1, 1, 8, 8, '#1a50ff'); R(2, 2, 6, 6, '#8ab0ff'); });
  make(scene, 'gem', 6, 7, (R) => { R(2, 0, 2, 7, K); R(0, 2, 6, 3, K); R(1, 1, 4, 5, '#34e6ff'); R(2, 1, 1, 2, '#fff'); });
  make(scene, 'coffee', 9, 10, (R) => { R(0, 2, 7, 8, K); R(1, 3, 5, 6, '#fff'); R(1, 3, 5, 2, '#7a4a2a'); R(6, 4, 3, 4, K); R(7, 5, 1, 2, '#fff'); R(2, 0, 1, 2, '#ddd'); R(4, 0, 1, 2, '#ddd'); });
  make(scene, 'chip', 8, 8, (R) => { R(0, 0, 8, 8, K); R(1, 1, 6, 6, '#ffd24a'); R(3, 3, 2, 2, '#a07000'); });
  make(scene, 'chest', 14, 12, (R) => { R(0, 2, 14, 10, K); R(1, 3, 12, 8, '#d0802a'); R(1, 3, 12, 3, '#f0a64a'); R(6, 5, 2, 4, '#ffd24a'); R(0, 6, 14, 1, K); });
  make(scene, 'shadow', 16, 6, (R) => { R(3, 0, 10, 6, 'rgba(0,0,0,0.35)'); R(0, 1, 16, 4, 'rgba(0,0,0,0.35)'); });
  make(scene, 'spark', 3, 3, (R) => { R(0, 0, 3, 3, '#fff'); });
  // Iconos de passives
  make(scene, 'i_doc', 12, 14, (R) => { R(0, 0, 12, 14, K); R(1, 1, 10, 12, '#fff3c4'); for (let i = 0; i < 5; i++) R(2, 3 + i * 2, 8, 1, '#a07000'); R(2, 2, 5, 1, '#d02030'); });
  make(scene, 'i_coffee', 12, 12, (R) => { R(0, 2, 9, 10, K); R(1, 3, 7, 8, '#fff'); R(1, 3, 7, 3, '#5a3a22'); R(9, 4, 3, 5, K); R(10, 5, 1, 3, '#fff'); R(3, 7, 3, 2, '#ffd24a'); });
  make(scene, 'i_switch', 14, 8, (R) => { R(0, 0, 14, 8, K); R(1, 1, 12, 6, '#2a3050'); for (let i = 0; i < 6; i++) { R(2 + i * 2, 2, 1, 2, '#5df28a'); R(2 + i * 2, 5, 1, 1, '#ffd24a'); } });
  make(scene, 'i_star', 12, 12, (R) => { R(5, 0, 2, 12, '#ffd24a'); R(0, 5, 12, 2, '#ffd24a'); R(3, 3, 6, 6, '#fff3c4'); });
  // Props isométricos
  const box = (w, h, top, side, dark) => (R, g) => { g.fillStyle = K; g.fillRect(0, 0, w, h); R(1, 1, w - 2, h - 2, side); R(1, 1, w - 2, Math.floor(h * 0.4), top); R(1, h - 3, w - 2, 2, dark); };
  make(scene, 'prop_desk', 28, 18, (R) => { R(0, 3, 28, 15, K); R(1, 4, 26, 5, '#c9a46a'); R(1, 9, 26, 8, '#8a6a3a'); R(3, 0, 10, 5, K); R(4, 1, 8, 4, '#7fd4ff'); R(6, 5, 4, 1, K); R(16, 2, 8, 3, '#222'); R(17, 3, 6, 1, '#555'); R(3, 11, 4, 5, '#6a4a22'); R(21, 11, 4, 5, '#6a4a22'); });
  make(scene, 'prop_rack', 18, 34, (R) => { R(0, 0, 18, 34, K); R(1, 1, 16, 32, '#2a3050'); for (let i = 0; i < 6; i++) { R(2, 2 + i * 5, 14, 4, '#3d4670'); R(3, 3 + i * 5, 2, 2, i % 2 ? '#5df28a' : '#ffd24a'); R(7, 3 + i * 5, 8, 1, '#1a2040'); } });
  make(scene, 'prop_printer', 22, 16, (R) => { R(0, 4, 22, 12, K); R(1, 5, 20, 10, '#c8ccd8'); R(3, 1, 16, 4, K); R(4, 2, 14, 3, '#fff'); R(3, 8, 16, 3, '#8a90a0'); R(16, 11, 3, 2, '#0c0'); });
  make(scene, 'prop_plant', 12, 20, (R) => { R(3, 12, 6, 8, K); R(4, 13, 4, 6, '#b05a2a'); R(0, 2, 12, 11, K); R(1, 3, 10, 9, '#2fb24a'); R(3, 3, 3, 4, '#6af08a'); R(6, 7, 4, 3, '#1a7a30'); });
  make(scene, 'prop_cooler', 12, 24, (R) => { R(0, 0, 12, 24, K); R(1, 1, 10, 10, '#7fd4ff'); R(2, 2, 3, 6, '#d4f4ff'); R(1, 11, 10, 12, '#e8eaf2'); R(4, 14, 4, 2, '#3b78e0'); });
  make(scene, 'prop_box', 16, 14, box(16, 14, '#d9b27a', '#b88a50', '#8a6a3a'));
  make(scene, 'prop_cable', 22, 8, (R) => { R(0, 3, 22, 3, K); R(1, 4, 20, 1, '#2a7bff'); R(4, 1, 2, 3, K); });
  make(scene, 'prop_table', 30, 18, (R) => { R(0, 0, 30, 18, K); R(1, 1, 28, 10, '#d8d0c0'); R(1, 11, 28, 6, '#8a7a5a'); R(6, 3, 6, 4, '#7fd4ff'); R(16, 4, 8, 3, '#ffd24a'); });
  make(scene, 'prop_pillar', 14, 40, (R) => { R(0, 0, 14, 40, K); R(1, 1, 12, 38, '#8a90a8'); R(1, 1, 5, 38, '#b6bcd0'); R(0, 34, 14, 6, '#555a70'); });
  make(scene, 'prop_lamp', 8, 30, (R) => { R(3, 6, 2, 24, K); R(0, 0, 8, 7, K); R(1, 1, 6, 5, '#fff3a0'); });
  make(scene, 'icon_app', 32, 32, (R) => { R(0, 0, 32, 32, '#0b1020'); R(2, 2, 28, 28, '#7fd4ff'); R(4, 4, 24, 24, '#16233f'); R(8, 8, 16, 12, '#2f6fe0'); R(9, 9, 14, 8, '#7fd4ff'); R(12, 22, 8, 2, '#c9d2e8'); R(11, 12, 10, 2, '#16233f'); });
}
