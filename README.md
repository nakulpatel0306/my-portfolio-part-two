# 🦸 Nakul Patel — Portfolio, Vol. 2

A minimal, dark, single-page developer portfolio with cinematic superhero energy — condensed poster typography, comic halftone textures, sections numbered like issues, and a few gaming touches. Built with vanilla HTML, CSS and JS.

---

## ✨ Features

- **Origin-story design** — ink-black ground, crimson accent, gold detail, Bebas Neue display type
- **Numbered "issues"** — About, Projects, Experience, Skills, Contact framed as Issue 01–05
- **Motion with restraint** — scroll reveals, cursor spotlight, count-up stats, cascading skill bars
- **Comic-panel details** — halftone dot textures, offset-shadow frames, crimson issue numbers
- **Gaming nods** — "Power stats" skill bars, "Full loadout" tech list, and a Konami code easter egg (↑↑↓↓←→←→BA)
- **Responsive & accessible** — mobile menu, keyboard focus states, `prefers-reduced-motion` support

## 🎨 Palette

| Token | Value |
|---|---|
| Ink | `#0a0c12` |
| Panel | `#11141d` |
| Text | `#e8eaf0` |
| Crimson | `#e5484d` |
| Gold | `#f0b429` |

Type: **Bebas Neue** (display) · **Manrope** (body) · **JetBrains Mono** (labels)

## 🧱 Project Structure

```
.
├── index.html   # Single-page layout: hero + issues 01–05
├── style.css    # Theme tokens, layout, animations, responsive rules
├── script.js    # Reveals, spotlight, nav state, stat bars, konami
└── assets/      # Images, icons, resume PDF
```

## 🚀 Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/nakulpatel0306/my-portfolio-part-two.git
   cd my-portfolio-part-two
   ```
2. Open `index.html` in your browser, or run a local server:
   ```bash
   python3 -m http.server 5173
   ```
   Then visit: `http://localhost:5173`

> The previous IDE-style design lives in this repo's git history (`b3b5d79`).
