import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';
import { ResultScene } from './scenes/ResultScene.js';
import { DEBUG } from './config.js';
const game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', backgroundColor: '#0b1020', pixelArt: true, roundPixels: true,
  scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
  input: { activePointers: 3 }, fps: { target: 60 },
  render: { powerPreference: 'high-performance', antialias: false },
  scene: [BootScene, MenuScene, ShopScene, GameScene, UIScene, ResultScene],
});
if (DEBUG) window.__game = game;
if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !DEBUG && window.top === window) navigator.serviceWorker.register('./sw.js').catch(() => {});
addEventListener('error', (e) => { const d = document.getElementById('boot'); if (d) d.textContent = 'Error: ' + e.message; });
