const V = 'ui-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './vendor/phaser.min.js', './icons/icon-192.png', './icons/icon-512.png',
  './src/main.js', './src/config.js', './src/data/content.js', './src/sprites/Textures.js', './src/systems/Save.js', './src/systems/Sfx.js', './src/systems/Fx.js', './src/systems/Widgets.js',
  './src/entities/Player.js', './src/entities/Enemy.js', './src/entities/EnemyAI.js', './src/weapons/Weapon.js', './src/weapons/index.js',
  './src/scenes/BootScene.js', './src/scenes/MenuScene.js', './src/scenes/ShopScene.js', './src/scenes/GameScene.js', './src/scenes/UIScene.js', './src/scenes/ResultScene.js'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== V).map((x) => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => { if (e.request.method !== 'GET') return; e.respondWith(fetch(e.request).then((r) => { const c = r.clone(); caches.open(V).then((ch) => ch.put(e.request, c)); return r; }).catch(() => caches.match(e.request))); });
