// Arte importado desde assets/ (PNG con transparencia). Cada entrada: clave de textura -> fichero.
// Si falta el fichero, se usa el sprite procedural de Textures.js.
export const ART = {
  files: ['m0','m1','m2','m3','m4','m5','m6','m7','m8','ic0','ic1','ic2','ic3', 'floor', 'boss0', 'boss1', 'boss2', 'ch0', 'ch1', 'ch2', 'ch3', 'ch4', 'fx0', 'fx1', 'fx2', 'fx3', 'fx4', 'fx5', 'fx6', 'fx7', 'fx8', 'fx9', 'hero0', 'hero1', 'hero2', 'en0', 'en1', 'en2', 'en3', 'en4', 'en5', 'sc0', 'sc1', 'sc2', 'sc3', 'sc4', 'sc5', 'sc6', 'sc7', 'sc8', 'sc9'],
  map: {
    floor: 'floor', b_printer_0: 'boss0', b_printer_1: 'boss0', b_server_0: 'boss1', b_server_1: 'boss1', b_user_0: 'boss2', b_user_1: 'boss2',
    c_junior_0: 'ch0', c_junior_1: 'ch0', c_admin_0: 'ch1', c_admin_1: 'ch1', c_ms_0: 'ch2', c_ms_1: 'ch2', c_printer_0: 'ch3', c_printer_1: 'ch3', c_devops_0: 'ch4', c_devops_1: 'ch4',
    p_paper: 'm0', p_toner: 'm1', p_ticket: 'm2', p_orb: 'm3', p_blue: 'm4', e_minion_0: 'm5', e_minion_1: 'm5', e_error_0: 'm6', e_error_1: 'm6', chest: 'm7', coffee: 'm8', i_doc: 'ic0', i_coffee: 'ic1', i_switch: 'ic2', i_star: 'ic3',
    p_key: 'fx0', p_mouse: 'fx1', p_cable: 'fx2', p_hammer: 'fx3', p_mail: 'fx4', p_ps: 'fx5', gem: 'fx6', chip: 'fx7',
    p_0: 'hero1', p_1: 'hero2',
    e_nopass_0: 'en0', e_nopass_1: 'en0', e_printer_0: 'en1', e_printer_1: 'en1', e_email_0: 'en2', e_email_1: 'en2',
    e_av_0: 'en3', e_av_1: 'en3', e_consult_0: 'en4', e_consult_1: 'en4', e_pm_0: 'en5', e_pm_1: 'en5',
    prop_desk: 'sc0', prop_rack: 'sc1', prop_cooler: 'sc2', prop_printer: 'sc3', prop_plant: 'sc4', prop_box: 'sc5', prop_table: 'sc6', prop_bin: 'sc7', prop_cone: 'sc8', prop_cab: 'sc9',
  },
  // ciclos de caminar de 4 fotogramas (assets/walk/<n>_w0..3.png)
  walk: { p: 'tec', c_junior: 'ch0', c_admin: 'ch1', c_ms: 'ch2', c_printer: 'ch3', c_devops: 'ch4', e_nopass: 'en0', e_printer: 'en1', e_email: 'en2', e_av: 'en3', e_consult: 'en4', e_pm: 'en5', b_printer: 'boss0', b_server: 'boss1', b_user: 'boss2' },
  wframe(tex, n) { const w = ART.walk[tex]; return w && ART.wOk ? 'wk_' + w + '_w' + (n & 3) : null; },
  wOk: false,
  has: new Set(),
  // squash & stretch + inclinación: da vida a un sprite de un solo frame
  anim(sp, bx, by, t, moving, face, amp = 1) {
    const w = moving ? Math.sin(t * Math.PI * 2) : Math.sin(t * 1.4) * 0.35;
    const k = (moving ? 0.07 : 0.025) * amp;
    sp.setScale(bx * (1 - k * w * 0.6), by * (1 + k * w)).setAngle((moving ? 4 : 0) * Math.sin(t * Math.PI) * face * amp);
  },
  is(key) { return ART.has.has(key.replace(/_[01]$/, '')); },
  fitS(scene, key, px, fb) { if (!ART.is(key)) return fb; const i = scene.textures.get(key).getSourceImage(); return px / Math.max(i.width, i.height); },
  scale(key, def) { return ART.has.has(key.replace(/_[01]$/, '')) ? 1 : def; },
};
