# Nakul Patel — The World (portfolio v3, `design/v3` branch)

An interactive 3D portfolio in the spirit of the great WebGL portfolios: the hero is a low-poly floating island rendered with Three.js — drag to orbit it, hover the six glowing pedestals (each one is a project, modeled as a tiny 3D object), and click a pedestal to jump to that project's card. Built with vanilla HTML/CSS/JS plus a single vendored copy of Three.js.

> `main` holds the origin-story design. This branch is the 3D showpiece.

---

## Features

- **A drag-to-explore 3D island** — low-poly world with trees, rocks, drifting clouds, a starfield, soft shadows, and a gentle idle auto-orbit
- **Six project pedestals** — each project is a miniature 3D sculpture (chart bars for Flux, a vinyl for Echo, a hoop for Swish, a DNA spiral for Evo, a crowned checker for King Me, a keyboard for Click); hover for a tooltip, click to jump to the project
- **The full award-site kit** — preloader with 0–100 counter, buttery inertia scrolling, custom cursor with magnetic buttons, film grain, staged kinetic text reveals
- **Cinematic scroll-away** — the camera pulls back and the world fades as you scroll into the content
- **Respectful fallbacks** — static hero if WebGL is unavailable, native scrolling on touch, everything calm under `prefers-reduced-motion`; rendering pauses when the hero is off-screen or the tab is hidden

## Palette & type

Dusk indigo `#0e1026` · coral `#ff7059` · island mint `#79c37e`
**Outfit** (display + body) · **JetBrains Mono** (labels)

## Structure

```
.
├── index.html         # Hero world + about, projects, experience, contact
├── style.css          # Dusk theme, cursor, grain, loader, reveals
├── script.js          # Three.js island, orbit/raycast interaction, scroll kit
├── vendor/three.min.js # Three.js r128 (MIT)
└── assets/            # Photos, project images, resume PDF
```

## Run it

```bash
python3 -m http.server 5173
# → http://localhost:5173
```
