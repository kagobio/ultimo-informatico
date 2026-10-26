// Todo el contenido del juego está aquí como datos. Para añadir un arma, enemigo o mapa
// basta con añadir una entrada (y, si es arma, su clase en weapons/ registrada en weapons/index.js).
export const WEAPONS = {
  keyboard: { name: 'Teclado Mecánico', icon: 'p_key', desc: 'Disparo automático. Lanza teclas físicas.', evo: { passive: 'doc', id: 'keyboardEvo', name: 'Teclado Devastador RGB', desc: 'Ráfaga RGB perforante de 5 teclas.' }, cost: 0 },
  mouse: { name: 'Ratón Láser', icon: 'p_mouse', desc: 'Disparo rápido. Rebota entre enemigos.', evo: { passive: 'cafe', id: 'mouseEvo', name: 'Ratón Gamer Supremo', desc: '8 rebotes, doble disparo y más daño.' }, cost: 20 },
  ethernet: { name: 'Cable Ethernet Legendario', icon: 'p_cable', desc: 'Gira alrededor del jugador. Daño continuo.', evo: { passive: 'switch', id: 'ethernetEvo', name: 'Red Definitiva', desc: '6 cables, más radio y empuje.' }, cost: 35 },
  hammer: { name: 'Martillo de Mantenimiento', icon: 'p_hammer', desc: 'Daño masivo. Ataque lento.', cost: 45 },
  outlook: { name: 'Outlook Launcher', icon: 'p_mail', desc: 'Dispara correos. Explosión en área.', cost: 60 },
  powershell: { name: 'Script PowerShell', icon: 'p_ps', desc: 'Invoca automatizaciones que atacan solas.', cost: 75 },
};
export const PASSIVES = {
  doc: { name: 'Documentación Legendaria', icon: 'i_doc', desc: '+10% daño. Evoluciona el Teclado Mecánico (nv.5).', apply: (p) => { p.dmgMult += 0.1; } },
  cafe: { name: 'Café Premium', icon: 'i_coffee', desc: '+10% velocidad, -8% recarga. Evoluciona el Ratón Láser (nv.5).', apply: (p) => { p.speedMult += 0.1; p.cdMult *= 0.92; } },
  switch: { name: 'Switch Legendario', icon: 'i_switch', desc: '+10% área, +20 vida. Evoluciona el Cable Ethernet (nv.5).', apply: (p) => { p.areaMult += 0.1; p.maxHp += 20; p.hp += 20; } },
};
export const STAT_UPS = [
  { id: 'dmg', name: 'Más daño', desc: '+10% de daño', icon: 'i_star', apply: (p) => { p.dmgMult += 0.1; } },
  { id: 'speed', name: 'Más velocidad', desc: '+8% de velocidad', icon: 'i_coffee', apply: (p) => { p.speedMult += 0.08; } },
  { id: 'hp', name: 'Más vida', desc: '+20 vida máxima y cura 20', icon: 'coffee', apply: (p) => { p.maxHp += 20; p.heal(20); } },
  { id: 'crit', name: 'Más crítico', desc: '+4% prob. de crítico', icon: 'chip', apply: (p) => { p.crit += 0.04; } },
  { id: 'cd', name: 'Menos recarga', desc: '-8% tiempo de recarga', icon: 'i_switch', apply: (p) => { p.cdMult = Math.max(0.35, p.cdMult * 0.92); } },
];
export const CHARACTERS = {
  tecnico: { name: 'Técnico de Soporte', tex: 'p', weapon: 'keyboard', hp: 100, speed: 100, dmg: 10, crit: 5, cost: 0, desc: 'El de siempre. Equilibrado.' },
  junior: { name: 'Técnico Junior', tex: 'c_junior', weapon: 'mouse', hp: 80, speed: 110, dmg: 9, crit: 5, xp: 0.2, cost: 25, desc: 'Ágil y aprende rápido (+20% XP).' },
  admin: { name: 'Administrador de Sistemas', tex: 'c_admin', weapon: 'ethernet', hp: 140, speed: 90, dmg: 10, crit: 5, cost: 50, desc: 'Resistente. Empieza con Cable Ethernet.' },
  ms: { name: 'Especialista Microsoft', tex: 'c_ms', weapon: 'outlook', hp: 100, speed: 100, dmg: 11, crit: 8, cost: 80, desc: 'Empieza con Outlook Launcher.' },
  impresoras: { name: 'Experto en Impresoras', tex: 'c_printer', weapon: 'hammer', hp: 120, speed: 95, dmg: 12, crit: 5, cost: 110, desc: 'Pega fuerte. Empieza con el Martillo.' },
  devops: { name: 'DevOps Supremo', tex: 'c_devops', weapon: 'powershell', hp: 110, speed: 105, dmg: 12, crit: 10, cd: 0.9, cost: 160, desc: 'Automatiza todo. Recarga -10%.' },
};
export const SKINS = {
  clasico: { name: 'Clásico', cost: 0 }, hacker: { name: 'Hacker Verde', cost: 20 },
  dorado: { name: 'Corbata Dorada', cost: 40 }, rgb: { name: 'Gamer RGB', cost: 60 },
};
export const META_UPS = {
  hp: { name: 'Vida +10', per: 10, max: 10, base: 15, desc: 'Vida máxima inicial' },
  dmg: { name: 'Daño +5%', per: 0.05, max: 10, base: 20, desc: 'Daño inicial' },
  speed: { name: 'Velocidad +3%', per: 0.03, max: 8, base: 15, desc: 'Velocidad inicial' },
  crit: { name: 'Crítico +1%', per: 0.01, max: 10, base: 15, desc: 'Probabilidad de crítico' },
  xp: { name: 'Experiencia +5%', per: 0.05, max: 10, base: 18, desc: 'XP ganada' },
  magnet: { name: 'Imán +10%', per: 0.1, max: 8, base: 12, desc: 'Radio de recogida' },
};
export const MAPS = {
  oficina: { name: 'Oficina Corporativa', cost: 0, floor: 0xdfe6f5, bg: '#1b2338', diff: 1.0, density: 1.0, bossAt: [200, 440, 690], props: ['prop_desk', 'prop_plant', 'prop_cooler', 'prop_box', 'prop_table', 'prop_printer'], weights: {}, blurb: 'Tu planta de siempre. Nivel de caos: medio.' },
  cpd: { name: 'CPD', cost: 40, floor: 0x7c98c8, bg: '#0a1224', diff: 1.2, density: 1.05, bossAt: [200, 440, 690], props: ['prop_rack', 'prop_rack', 'prop_box', 'prop_cable', 'prop_pillar'], weights: { email: 1.6, av: 1.5 }, blurb: 'Racks, cables y antivirus rebeldes.' },
  impresoras: { name: 'Planta de Impresoras', cost: 80, floor: 0xd8c9b0, bg: '#2a1e1c', diff: 1.4, density: 1.1, bossAt: [200, 440, 690], props: ['prop_printer', 'prop_printer', 'prop_box', 'prop_pillar', 'prop_plant'], weights: { printer: 2.6 }, blurb: 'Papel por todas partes. Mucha impresora.' },
  openspace: { name: 'Open Space del Caos', cost: 140, floor: 0xcfe8d4, bg: '#17261f', diff: 1.6, density: 1.2, bossAt: [210, 470, 740], props: ['prop_desk', 'prop_desk', 'prop_table', 'prop_plant', 'prop_cooler', 'prop_lamp'], weights: { consult: 2.2, pm: 1.8 }, blurb: 'Consultores y jefes de proyecto sin parar.' },
  global: { name: 'Centro de Soporte Global', cost: 220, floor: 0xb7a6e8, bg: '#1a1233', diff: 1.9, density: 1.3, bossAt: [230, 500, 800], props: ['prop_desk', 'prop_rack', 'prop_printer', 'prop_pillar', 'prop_lamp', 'prop_table'], weights: { email: 1.4, printer: 1.3, av: 1.3, consult: 1.4, pm: 1.4 }, blurb: 'Todo a la vez. Solo para veteranos.' },
};
// Enemigos comunes. ai: nombre de comportamiento en entities/EnemyAI.js
export const ENEMIES = {
  nopass: { name: 'Usuario sin contraseña', tex: 'e_nopass', hp: 18, speed: 52, dmg: 8, r: 8, xp: 1, ai: 'nopass', from: 0, w: 10, phrases: ['No recuerdo la clave.', 'Ayer funcionaba.'], scale: 3 },
  email: { name: 'Correo infinito', tex: 'e_email', hp: 6, speed: 92, dmg: 4, r: 6, xp: 1, ai: 'email', from: 40, w: 7, scale: 3 },
  printer: { name: 'Impresora asesina', tex: 'e_printer', hp: 70, speed: 34, dmg: 10, r: 11, xp: 4, ai: 'printer', from: 110, w: 3.2, scale: 3 },
  av: { name: 'Antivirus rebelde', tex: 'e_av', hp: 48, speed: 50, dmg: 8, r: 9, xp: 4, ai: 'av', from: 170, w: 2.6, scale: 3 },
  consult: { name: 'Consultor externo', tex: 'e_consult', hp: 95, speed: 40, dmg: 10, r: 9, xp: 7, ai: 'consult', from: 230, w: 2.2, scale: 3 },
  pm: { name: 'Jefe de proyecto', tex: 'e_pm', hp: 240, speed: 44, dmg: 14, r: 11, xp: 12, ai: 'pm', from: 300, w: 1.2, phrases: ['Lo necesito para ayer.', '¿Está ya?'], scale: 3.4 },
  minion: { name: 'Participante', tex: 'e_minion', hp: 10, speed: 70, dmg: 5, r: 7, xp: 0.5, ai: 'chase', from: 9999, w: 0, scale: 2.6 },
  error: { name: 'Error', tex: 'e_error', hp: 8, speed: 105, dmg: 6, r: 6, xp: 0.5, ai: 'chase', from: 9999, w: 0, scale: 2.6 },
};
export const BOSSES = [
  { id: 'printer', name: 'LA IMPRESORA POSEÍDA', tex: 'b_printer', hp: 1200, speed: 30, dmg: 16, r: 22, xp: 60, ai: 'bossPrinter', scale: 3.2 },
  { id: 'server', name: 'EL SERVIDOR DE PRODUCCIÓN', tex: 'b_server', hp: 3200, speed: 20, dmg: 18, r: 20, xp: 120, ai: 'bossServer', scale: 3.4 },
  { id: 'user', name: 'EL USUARIO QUE NUNCA REINICIA', tex: 'b_user', hp: 6500, speed: 40, dmg: 20, r: 18, xp: 300, ai: 'bossUser', scale: 5 },
];
