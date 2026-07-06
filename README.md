# Nakul Patel — Portfolio Design Lab

One portfolio, three completely different designs — each on its own branch, each exploring a different inspiration. All of them are hand-built with vanilla HTML, CSS and JavaScript: no frameworks, no build step, same content (projects, experience, skills, contact) reimagined three ways.

## 🎨 The three designs

| Branch | Design | Inspiration | Signature moments |
|---|---|---|---|
| [`main`](../../tree/main) | **Origin Story** | Superhero comics × minimal editorial portfolios — ink black, crimson & gold, poster typography, halftone textures | Sections numbered like comic issues, cursor spotlight, cascading "power stats" skill bars |
| [`design/v3`](../../tree/design/v3) | **Night Patrol** | Cinematic hero-over-the-city flights × games — every pixel of the night city is drawn in code on a canvas | A caped hero flies across a parallax skyline as you scroll, 5 collectible signal orbs, a searchlight that projects the NP monogram onto the clouds |
| [`design/v4`](../../tree/design/v4) | **Keynote** | Apple product launches — luxury restraint, gradient serif accents, light **and** dark themes with a toggle | Scroll-cinema project showcase, a physics pile of draggable skill chips, a playable basketball free-throw mini-game |

There's also a fourth design in this repo's history: an **IDE-style portfolio** (a working VS Code-like interface in a purple dark theme, with a file explorer, tabs, command palette and interactive terminal) at commit [`a2260e1`](../../commit/a2260e121e639547db4a0ac26cecf2063d0e09f8).

## ✦ Shared DNA

Every design carries the same principles:

- **Vanilla everything** — plain HTML/CSS/JS, zero dependencies
- **Responsive** — desktop to mobile, with layout fallbacks where the fancy version doesn't fit
- **Accessible motion** — every animation respects `prefers-reduced-motion`
- **An easter egg** — the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) does something in all of them

## 🚀 Run any design locally

```bash
git clone https://github.com/nakulpatel0306/my-portfolio-part-two.git
cd my-portfolio-part-two

git checkout main        # Origin Story
git checkout design/v3   # Night Patrol
git checkout design/v4   # Keynote

python3 -m http.server 5173
# → http://localhost:5173
```

Each branch's own README documents that design's palette, type system and features in detail.

---

**Nakul Patel** · CS + BBA @ Wilfrid Laurier University · [LinkedIn](https://www.linkedin.com/in/nakulpatel0306/) · [GitHub](https://github.com/nakulpatel0306)
