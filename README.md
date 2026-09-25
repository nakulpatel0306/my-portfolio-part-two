# Nakul Patel — Origin Story (`design/v5` branch)

The first of the four designs: a superhero-comic take on the minimal editorial
portfolio. Ink black, crimson and gold, poster typography set in Bebas Neue,
halftone dot textures bleeding off the edges, and sections numbered like issues
of a comic. Vanilla HTML/CSS/JS, no dependencies at all.

> `main` holds the minimal design · `design/v3` holds the 3D world · `design/v4` holds the bento grid · this branch is the origin story.

---

## Features

- **Issue-numbered sections** — About, Selected work, Experience, Power stats and Contact are labelled `Issue 01` through `Issue 05 — Final`, each with a crimson diamond marker
- **Cursor spotlight** — a soft crimson radial gradient tracks the pointer across the whole page, set through CSS custom properties so the paint stays on the compositor
- **Halftone textures** — pure CSS dot fields, radial-gradient masked to a soft circle, bleeding off the hero, the projects rail and the contact block
- **Poster hero** — a 138px Bebas Neue headline against a framed, halftoned portrait with a hard crimson offset shadow
- **Count-up stats and cascading power bars** — the About figures roll up when scrolled into view, and the skill bars fill in a staggered cascade behind an `IntersectionObserver`
- **Hard-shadow card system** — work cards, buttons and the monogram all lift on hover into an offset solid shadow rather than a blur, keeping the print-poster feel
- **A photo filmstrip** — a horizontally snapping, desaturated strip that comes back to full colour on hover
- **The easter egg** — the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) drops a rotated `LEVEL UP!` card and a 110-piece confetti burst; the footer hint is clickable for touch

## Palette & type

Ink `#0a0c12` · panel `#11141d` · rule `#1f2430` · crimson `#e5484d` · deep crimson `#b3262b` · gold `#f0b429`
Text `#e8eaf0` · muted `#8a90a2` · faint `#565d70`
**Bebas Neue** (display) · **Manrope** (body) · **JetBrains Mono** (labels and meta)

## Structure

```
.
├── index.html   # Hero, about, projects, experience, skills, contact
├── style.css    # Ink theme, halftones, hard-shadow cards, stat bars
├── script.js    # Spotlight, reveals, nav state, count-ups, konami
└── assets/      # Photos, project images, resume PDF
```

## Run it

```bash
python3 -m http.server 5173
# → http://localhost:5173
```
