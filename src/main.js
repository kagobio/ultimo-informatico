import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';
import { ResultScene } from './scenes/ResultScene.js';
import { PlatformScene } from './scenes/PlatformScene.js';
import { ShooterScene } from './scenes/ShooterScene.js';
import { DEBUG } from './config.js';
const game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', backgroundColor: '#0b1020', pixelArt: true, roundPixels: true,
  scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
  input: { activePointers: 3 }, fps: { target: 60 },
  render: { powerPreference: 'high-performance', antialias: false },
  scene: [BootScene, MenuScene, ShopScene, GameScene, UIScene, ResultScene, PlatformScene, ShooterScene],
});
if (DEBUG) window.__game = game;
// Solo horizontal: pausa en vertical y reanuda al girar; intenta bloquear la orientación cuando el navegador lo permite.
const portrait = () => window.innerHeight > window.innerWidth * 1.02;
let wasP = false; const chk = () => { const pt = portrait(); if (pt && !wasP) { try { game.loop.sleep(); } catch (e) {} for (const sc of game.scene.getScenes(true)) if (sc.scene.key === 'Game' && !sc.over && !sc.userPaused && !sc.levelUpOpen) { try { sc.userPaused = true; sc.paused = true; sc.scene.get('UI').setPaused(true); } catch (e) {} } } else if (!pt && wasP) { try { game.loop.wake(); } catch (e) {} } wasP = pt; };
addEventListener('resize', chk); addEventListener('orientationchange', () => setTimeout(chk, 200)); setInterval(chk, 700);
addEventListener('pointerdown', () => { try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }, { once: true });
if ('serviceWorker' in navigator && location.protocol.startsWith('http') && !DEBUG && window.top === window) navigator.serviceWorker.register('./sw.js').catch(() => {});
addEventListener('error', (e) => { const d = document.getElementById('boot'); if (d) d.textContent = 'Error: ' + e.message; });
