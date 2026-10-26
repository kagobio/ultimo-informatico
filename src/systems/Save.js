const KEY = 'ultimo-informatico.save.v1';
const DEFAULT = () => ({
  points: 0, unlockedChars: ['tecnico'], unlockedWeapons: ['keyboard'], unlockedMaps: ['oficina'],
  skins: ['clasico'], skin: 'clasico', char: 'tecnico', map: 'oficina',
  up: { hp: 0, dmg: 0, speed: 0, crit: 0, xp: 0, magnet: 0 },
  stats: { runs: 0, wins: 0, bestTime: 0, kills: 0 }, muted: false,
});
let data = null;
let memoryOnly = false;
export const Save = {
  load() {
    const d = DEFAULT();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const o = JSON.parse(raw); Object.assign(d, o); d.up = Object.assign(DEFAULT().up, o.up || {}); d.stats = Object.assign(DEFAULT().stats, o.stats || {}); }
    } catch (e) { memoryOnly = true; }
    data = d; return d;
  },
  get() { return data || this.load(); },
  write() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { memoryOnly = true; } },
  get memoryOnly() { return memoryOnly; },
  reset() { data = DEFAULT(); this.write(); },
};
