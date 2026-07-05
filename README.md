# ✨ Nakul Patel — Keynote (portfolio v4, `design/v4` branch)

A luxury product-launch portfolio: Apple-keynote restraint, a light **and** dark theme with a toggle, and three interactive set pieces — an Apple-style scroll-cinema project showcase, a physics pile of draggable skill chips, and a playable basketball free-throw mini-game.

> `main` holds the origin-story design · `design/v3` holds Night Patrol · this branch is the keynote experiment.

---

## ✨ Features

- **Dual theme** — token-level light/dark with a toggle; explicit choice persists and beats the OS preference in both directions
- **Scroll cinema** — the six projects present themselves one at a time on a pinned stage as you scroll, keynote-slide style (stacked-card fallback on mobile and reduced-motion)
- **Physics toolkit** — 18 skill chips drop into a tray with gravity, collisions, and momentum; grab and toss them
- **Halftime mini-game** — slingshot basketball free throws on a canvas court, with score, attempts, and streaks
- **Keynote copy** — "Engineering, designed." / projects taglined like products / "One more thing" contact
- **The usual polish** — aurora gradient backdrop, count-up stats, scroll reveals, Konami code, `prefers-reduced-motion` fallbacks everywhere

## 🎨 Palette & type

Light `#fafafc` / dark `#0b0b10` · iris `#5b4dff` (light) / `#8f84ff` (dark) · signature gradient iris → violet → champagne
**Instrument Sans** (everything) + **Instrument Serif italic** (accent words)

## 🧱 Structure

```
.
├── index.html   # Hero, scroll-cinema work, story, halftime game, toolkit, track record, contact
├── style.css    # Dual-theme tokens, glass nav, cinema stage, tray, court
├── script.js    # Theme system, cinema, chip physics, free-throw game, konami
└── assets/      # Photos, project images, resume PDF
```

## 🚀 Run it

```bash
python3 -m http.server 5173
# → http://localhost:5173
```
