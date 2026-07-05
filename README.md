# 💜 Nakul Patel — Portfolio, Part Two

An IDE-style interactive developer portfolio. The whole site is designed like a code editor in a custom **Purple Dark** theme — a file explorer, tabs, a command palette, and a working terminal, with each section of the portfolio living in its own "file."

---

## ✨ Features

- **Full IDE layout** — title bar, activity bar, file explorer, tabs, breadcrumbs, status bar
- **Sections as files** — `README.md` (home), `about.md`, `experience.json`, `projects.js`, `skills.js`, `contact.sh`
- **Interactive terminal** — type `help`, `ls`, `open projects.js`, `neofetch`, `whoami`, or `sudo hire-me` 🎉
- **Command palette** — press `Ctrl+P` (or `Ctrl+K`) to fuzzy-jump between files
- **Runnable `contact.sh`** — hit ▶ Run to execute the contact script
- **Creative touches** — typewriter hero, animated headshot ring, photo gallery with swipe support, hover-to-run skill chips, purple confetti
- **Responsive** — explorer collapses into a hamburger drawer on mobile
- **Accessible** — keyboard navigation and `prefers-reduced-motion` support

## 🎨 Theme

Purple (`#a78bfa` / `#7c3aed`) on dark grey (`#121218` → `#262631`), with a purple-tinted syntax palette for the code-styled content.

## 🧱 Project Structure

```
.
├── index.html   # IDE shell + every "file" view
├── style.css    # Purple Dark theme, layout, animations, responsive rules
├── script.js    # Tabs, terminal, command palette, gallery, easter eggs
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
