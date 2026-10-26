# ÚLTIMO INFORMÁTICO

Survival roguelite de soporte técnico (Phaser 3, HTML5 + JavaScript, sin build). Partidas de 10-20 min, táctil + teclado, instalable como app (PWA).

## Ejecutar en local
Necesita un servidor estático (los módulos ES no cargan con file://):

    cd ultimo-informatico
    python3 -m http.server 8000      # o: npx serve .

Abre http://localhost:8000 . En el móvil, abre la URL de tu ordenador en la misma red o publica la carpeta (GitHub Pages, Netlify) y usa «Añadir a pantalla de inicio».

## Controles
Mover: joystick táctil / WASD / flechas. Pausa: botón o ESC/P. Las armas disparan solas.

## Estructura
- `src/data/content.js`: armas, enemigos, jefes, mapas, personajes, mejoras (datos)
- `src/weapons/`: clases de armas (añade una clase y regístrala en `index.js`)
- `src/entities/`: Player, Enemy, EnemyAI (comportamientos y jefes)
- `src/systems/`: Save (LocalStorage), Sfx (audio sintetizado), Fx, Widgets
- `src/scenes/`: Boot, Menu, Shop, Game, UI, Result
- `src/sprites/Textures.js`: sprites temporales generados por código (reemplazables por PNG)
- `manifest.webmanifest`, `sw.js`, `icons/`: PWA
- `vendor/phaser.min.js`: Phaser 3.80.1

Modo depuración: añade `?debug` a la URL.
