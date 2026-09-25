# Nakul Patel — Portfolio Design Lab

One portfolio, four completely different designs — each on its own branch, each exploring a different inspiration. All of them are hand-built with vanilla HTML, CSS and JavaScript: no frameworks, no build step, same content (projects, experience, skills, contact) reimagined four ways.

**`main` carries the Minimal design**, documented in full further down. The other three live on their own branches.

## 🎨 The four designs

| Branch | Design | Inspiration | Signature moments |
|---|---|---|---|
| [`main`](../../tree/main) | **Minimal** | The quiet single-column personal sites — lowercase, unhurried, no ornament | A ⌘K command palette, a theme change that wipes in as a circle, text that decodes on load, spring-physics tilt on the widget cards |
| [`design/v3`](../../tree/design/v3) | **The World** | The great WebGL portfolios (Bruno Simon) — a low-poly 3D island rendered with Three.js | Drag to orbit the island, hover six glowing pedestals (each project is a tiny 3D sculpture), click to jump to a project; preloader, inertia scroll, custom cursor |
| [`design/v4`](../../tree/design/v4) | **Bento** | Dashboard bento grids — graphite tiles, a mint signal colour, everything scannable at a glance | 11 hero tiles that tilt in 3D on hover, dual skills marquees running in opposite directions, a drag-to-scroll photo strip |
| [`design/v5`](../../tree/design/v5) | **Origin Story** | Superhero comics × minimal editorial portfolios — ink black, crimson & gold, poster typography, halftone textures | Sections numbered like comic issues, cursor spotlight, cascading "power stats" skill bars |

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

git checkout main        # Minimal      (this one)
git checkout design/v3   # The World
git checkout design/v4   # Bento
git checkout design/v5   # Origin Story

python3 -m http.server 5173
# → http://localhost:5173
```

Each branch's own README documents that design's palette, type system and features in detail.

---

# The design on this branch — Minimal

The quiet one. A single narrow column, everything lowercase, no photo — just the
name, the work, the projects and a way to reach me, in the order you'd actually
read them.

The restraint is in the *design*, not the code: underneath there's a ⌘K command
palette, a theme change that wipes in as a circle, text that decodes into place,
and spring physics on the cards. Still vanilla HTML/CSS/JS, one web font, zero
dependencies — every effect is a browser API used directly.

## Features

- **One column, 40rem wide** — the whole site is a single read, top to bottom, on every screen size, wide enough that rows don't wrap a single word onto a line of its own
- **All lowercase** — written that way in the markup, not forced with `text-transform`, so it copies and reads as intended
- **Light and dark** — a two-option switch (`light` / `dark`) sits at the top right; it starts on whichever the system prefers and the choice sticks from then on. An inline head script applies the stored theme before first paint, so there's no flash of the wrong colours
- **A three-card widget row** — status, location and current role, sitting under the name so the three things a recruiter screens on are answered before any scrolling
- **A liquid-glass surface** — the widget cards, theme switch, skill panel and command palette are translucent, blurred and saturated, with a highlight along the top lip and a specular reflection that tracks the pointer. Backdrop blur does nothing over a flat colour, so the page carries a faint three-blob aurora for the glass to bend
- **A filterable skill deck** — 37 skills from the résumé in four groups behind a tab row. The chips *slide* to their new positions using FLIP (measure First, mutate, measure Last, Invert the delta as a transform, then Play it off), so filtering reads as rearranging rather than repainting
- **Interests as chips** — music, chess, gym, basketball, travelling, superheroes, video games, meditation, hiking
- **One icon set** — twelve hand-written inline SVGs at a single 1.75 stroke weight, inheriting `currentColor` so they re-tone with the theme
- **A ⌘K command palette** — subsequence matching (`ghb` finds *open github*), matched characters highlighted as you type, full keyboard control, and `aria-activedescendant` wired to a real listbox. Jump to a section, switch theme, copy the email, open a link
- **A theme change that wipes in** — the new palette grows as a circle from the button you clicked, via the View Transitions API driven by a `clipPath` keyframe on `::view-transition-new(root)`. Browsers without it get the plain instant swap
- **Text that decodes on load** — the name and role resolve out of noise, each character settling at its own random moment so the word arrives raggedly instead of left to right
- **Scroll rail and reveal-on-scroll** — a hairline progress bar driven by one `requestAnimationFrame` per scroll burst (never one per event), and an `IntersectionObserver` that staggers the first screenful and reveals the rest as you reach them
- **Spring physics on the widget cards** — a real integrator, force into velocity into position with damping, so the tilt overshoots and settles rather than easing on a fixed curve. It stops its own RAF loop once at rest
- **A live Toronto clock** — `Intl.DateTimeFormat` with a `timeZone`, no date library
- **The easter egg, quietly** — the Konami code flips the lights and says `nice.`
- **Accessible by default** — real landmarks and lists, a labelled theme group whose buttons carry `aria-pressed`, a palette that restores focus on close (with `preventScroll`, so a jump isn't yanked back), and contrast that holds in both themes
- **Degrades honestly** — every effect is feature-detected and every one is inert under `prefers-reduced-motion`. Content is only hidden for reveal if the inline head script proved JS is alive, so with JS off the page renders in full rather than blank

## Palette & type

Paper `#fcfcfb` · ink `#17171a` · muted `#55555d` · faint `#74747c` · rule `#e7e7e3` · available `#4a9e6a`
Dark: `#0f0f10` · `#ededee` · `#a1a1a9` · `#7e7e87` · `#232326` · `#5cba80`
Every text tone clears WCAG AA (4.5:1) against its background in both themes.
**Inter** 400/500/600 at 15px — one family, three weights, no display face

Glass: a translucent fill over an 18px backdrop blur at 180% saturation, a hairline
edge, an inset highlight along the top lip, and a pointer-tracked specular sweep in
`soft-light`. The aurora behind it is three blurred radial blobs at 9–20% alpha —
enough for the glass to have something to bend, faint enough to stay out of the way.

## Structure

```
.
├── index.html   # Intro + widgets, about, work, projects, education, skills, elsewhere
├── 404.html     # Same shell, for a mistyped URL
├── style.css    # Tokens for both themes, glass + aurora, skills, focus, print
├── script.js    # Theme + view-transition wipe, scramble, rail, reveals, spring
│                #   tilt, specular tracking, FLIP skill filter, clock, palette
├── assets/
│   ├── favicon.svg           # Tab icon
│   ├── apple-touch-icon.png  # Home-screen icon, 180×180
│   ├── preview.png           # Link-preview card, 1200×630
│   └── nakul-patel-software-resume.pdf
└── .github/workflows/pages.yml   # Publishes main to GitHub Pages on push
```

## Things to try

| | |
|---|---|
| <kbd>⌘</kbd><kbd>K</kbd> / <kbd>Ctrl</kbd><kbd>K</kbd> | open the command palette — then type `ghb`, or `zzz` to see it come up empty |
| Click `light` / `dark` | the new theme wipes out in a circle from the button |
| Reload | watch the name decode into place |
| Hover a widget card | spring tilt that overshoots and settles, with the reflection following your pointer |
| Click a skill group | the chips slide to their new places rather than jumping |
| <kbd>↑</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd><kbd>←</kbd><kbd>→</kbd><kbd>B</kbd><kbd>A</kbd> | flips the lights and says `nice.` |

## Deploying

`.github/workflows/pages.yml` publishes `main` to GitHub Pages on every push.
It needs one manual step, once:

**Settings → Pages → Source → "GitHub Actions"**

The site then goes live at `https://nakulpatel0306.github.io/my-portfolio-part-two/`,
which is the URL currently in the link-preview tags.

### Pointing a custom domain at it

When the domain is registered:

1. **Settings → Pages → Custom domain** — enter it and save. GitHub writes the
   `CNAME` file into the repo for you; don't create it by hand.
2. **Add the DNS records at the registrar.** For an apex domain
   (`example.com`) that's four `A` records, plus four `AAAA` records if you
   want IPv6; for a subdomain (`www.example.com`) it's a single `CNAME`
   pointing at `nakulpatel0306.github.io`. Take the current IP addresses from
   GitHub's own *"Managing a custom domain for your GitHub Pages site"* page
   rather than from any copy — they have changed before.
3. **Tick "Enforce HTTPS"** once the certificate is issued; that can take up to
   an hour after DNS propagates.
4. **Update two lines in `index.html`** — `og:url` and `og:image`. They are the
   only absolute URLs in the project and are marked with a comment. Link
   previews will otherwise keep pointing at the old Pages address.

---

**Nakul Patel** · CS + BBA @ Wilfrid Laurier University · [LinkedIn](https://www.linkedin.com/in/nakulpatel0306/) · [GitHub](https://github.com/nakulpatel0306)
