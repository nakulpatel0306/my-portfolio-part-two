# 🌃 Nakul Patel — Night Patrol (portfolio v3, `design/v3` branch)

An experimental, cinematic portfolio: the entire background is a living, procedurally-drawn night city rendered on a canvas — parallax skyline layers, twinkling stars, drifting clouds, flickering windows, shooting stars — and a small caped hero who flies across the city as you scroll. Zero libraries, zero images for the world: every pixel of the city is drawn in code.

> `main` holds the origin-story minimal design. This branch is a separate aesthetic experiment.

---

## ✨ Features

- **Living canvas city** — 3 parallax building layers, deterministic skyline (seeded PRNG), amber windows with live flicker, moon, clouds, shooting stars
- **Scroll-driven flight** — a hero sprite with a waving cape and particle trail follows your scroll along a flight path over the city
- **Collectible signals** — 5 glowing orbs on the flight path; a HUD tracks `SIGNALS n/5` and finding all of them earns a toast
- **The signal beam** — reaching the contact chapter switches on a searchlight that projects the NP monogram onto the clouds
- **Game HUD** — patrol progress %, signal counter, waypoint dots for chapter navigation
- **Kinetic type** — per-letter headline rise-in, chapter reveals, count-up stats, segmented power cells
- **Konami code** (↑↑↓↓←→←→BA) — LEVEL UP! burst
- **Respectful fallbacks** — `prefers-reduced-motion` gets a static skyline and no animation; the page pauses rendering when the tab is hidden

## 🎨 Palette & type

Midnight ink `#05060f` · panel glass `rgba(9,13,31,.66)` · signal cyan `#45e3ff` · window amber `#ffb454`
**Archivo Black** (display) · **Sora** (body) · **IBM Plex Mono** (HUD/labels)

## 🧱 Structure

```
.
├── index.html   # HUD + chapters CH.01–05 (about, projects, experience, skills, contact)
├── style.css    # Glass panels, kinetic type, HUD, responsive rules
├── script.js    # Canvas city engine, flight path, signals, beam, konami
└── assets/      # Photos, project images, resume PDF
```

## 🚀 Run it

```bash
python3 -m http.server 5173
# → http://localhost:5173
```
