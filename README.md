# Nakul Patel — Portfolio Design Lab

One portfolio, four completely different designs — each on its own branch, each exploring a different inspiration. All of them are hand-built with vanilla HTML, CSS and JavaScript: no frameworks, no build step, same content (projects, experience, skills, contact) reimagined four ways.

## 🎨 The four designs

| Branch | Design | Inspiration | Signature moments |
|---|---|---|---|
| [`main`](../../tree/main) | **Origin Story** | Superhero comics × minimal editorial portfolios — ink black, crimson & gold, poster typography, halftone textures | Sections numbered like comic issues, cursor spotlight, cascading "power stats" skill bars |
| [`design/v3`](../../tree/design/v3) | **The World** | The great WebGL portfolios (Bruno Simon) — a low-poly 3D island rendered with Three.js | Drag to orbit the island, hover six glowing pedestals (each project is a tiny 3D sculpture), click to jump to a project; preloader, inertia scroll, custom cursor |
| [`design/v4`](../../tree/design/v4) | **Bento** | Dashboard bento grids — graphite tiles, a mint signal colour, everything scannable at a glance | 11 hero tiles that tilt in 3D on hover, dual skills marquees running in opposite directions, a drag-to-scroll photo strip |
| [`design/v5`](../../tree/design/v5) | **Minimal** | The quiet single-column personal sites — lowercase, unhurried, no ornament | A light/dark switch that remembers your choice, a three-card widget row answering status, location and current role, one hand-drawn icon set, and no images at all |

There's a fifth design that never got a branch of its own, living only in this repo's history: an **IDE-style portfolio** (a working VS Code-like interface in a purple dark theme, with a file explorer, tabs, command palette and interactive terminal) at commit [`a2260e1`](../../commit/a2260e121e639547db4a0ac26cecf2063d0e09f8).

## ✦ Shared DNA

Every design carries the same principles:

- **Vanilla everything** — plain HTML/CSS/JS with no framework and no build step; the only third-party file anywhere in the repo is the vendored Three.js that `design/v3` needs
- **Responsive** — desktop to mobile, with layout fallbacks where the fancy version doesn't fit
- **Accessible motion** — every animation respects `prefers-reduced-motion`
- **An easter egg** — the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) does something in all of them

## 🚀 Run any design locally

```bash
git clone https://github.com/nakulpatel0306/my-portfolio-part-two.git
cd my-portfolio-part-two

git checkout main        # Origin Story
git checkout design/v3   # The World
git checkout design/v4   # Bento
git checkout design/v5   # Minimal

python3 -m http.server 5173
# → http://localhost:5173
```

Each branch's own README documents that design's palette, type system and features in detail.

---

**Nakul Patel** · CS + BBA @ Wilfrid Laurier University · [LinkedIn](https://www.linkedin.com/in/nakulpatel0306/) · [GitHub](https://github.com/nakulpatel0306)
