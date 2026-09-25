/* ============================================================
   nakul patel — minimal (portfolio v5)

   The design stays quiet; the behaviour is where the work is.
     · theme switch that wipes in as a circle from the button
       (View Transitions API, with a plain swap as the fallback)
     · text that decodes into place on load
     · scroll rail + reveal-on-scroll (IntersectionObserver)
     · spring-physics tilt on the widget cards
     · a ⌘K command palette with subsequence matching
   Every one of them is inert under prefers-reduced-motion.
   ============================================================ */

'use strict';

const root = document.documentElement;
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

/* live, not latched — the user can flip the OS setting mid-visit */
const lessMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionOK = () => !lessMotion.matches;
const finePointer = window.matchMedia('(pointer: fine)');

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/* ============================================================
   toast — one element, reused by the palette and the easter egg
   ============================================================ */
const note = $('#note');
const live = $('#live');
let noteTimer;
function toast(message) {
  note.textContent = message;
  note.hidden = false;
  // the visible toast carries [hidden] between showings, and hidden content is
  // never announced — so screen readers get their own always-present region
  live.textContent = message;
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => {
    note.hidden = true;
    live.textContent = '';
  }, 1900);
}

/* ============================================================
   theme — the switch, and the circular wipe it rides in on
   ============================================================ */
const themeButtons = $$('[data-theme-set]');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

const store = {
  get() { try { return localStorage.getItem('theme'); } catch { return null; } },
  set(v) { try { localStorage.setItem('theme', v); } catch { /* private mode — fine */ } }
};

const themeColor = $('#theme-color');
const current = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');

const syncButtons = () => {
  const now = current();
  themeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeSet === now)));
  // Read the token, not body's background: body transitions its background over
  // 0.2s, so at commit time the computed value is still the OLD colour and the
  // address bar would keep the previous theme forever. Custom properties don't
  // transition, so --bg is already correct the instant data-theme flips.
  themeColor.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim());
};

/* `origin` is the point the new theme grows from — usually the click */
function applyTheme(theme, origin) {
  const commit = () => {
    root.dataset.theme = theme;
    store.set(theme);
    syncButtons();
  };

  // no View Transitions, or motion is unwelcome: just swap
  if (!document.startViewTransition || !motionOK()) { commit(); return; }

  const transition = document.startViewTransition(commit);
  transition.ready.then(() => {
    const x = origin ? origin.x : window.innerWidth / 2;
    const y = origin ? origin.y : 0;
    // reach the furthest corner, so the circle always covers the viewport
    const radius = Math.hypot(Math.max(x, window.innerWidth - x),
                              Math.max(y, window.innerHeight - y));
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 520, easing: EASE, pseudoElement: '::view-transition-new(root)' }
    );
  }).catch(() => { /* transition was skipped; the swap already happened */ });
}

const pointOf = (event) => {
  const el = event && event.currentTarget;
  if (!el || !el.getBoundingClientRect) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

const saved = store.get();
if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
syncButtons();

themeButtons.forEach((b) => {
  b.addEventListener('click', (e) => applyTheme(b.dataset.themeSet, pointOf(e)));
});
systemDark.addEventListener('change', syncButtons);

/* ============================================================
   text scramble — each character settles at its own moment,
   so the word resolves raggedly instead of left to right
   ============================================================ */
const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789#$%&*+=/<>[]{}—·';

function scramble(el, duration = 850) {
  const text = el.textContent;
  const settleAt = Array.from(text, () => 0.12 + Math.random() * 0.72);
  const start = performance.now();

  const frame = (now) => {
    const k = Math.min(1, (now - start) / duration);
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === ' ') { out += ' '; continue; }
      out += k >= settleAt[i] ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (k < 1) requestAnimationFrame(frame);
    else el.textContent = text;
  };
  requestAnimationFrame(frame);
}

if (motionOK()) $$('[data-scramble]').forEach((el, i) => setTimeout(() => scramble(el), i * 130));

/* ============================================================
   typewriter — types a title, holds, backspaces, takes the next.
   Deleting runs faster than typing, which is what makes it read
   as typing rather than as a ticker.
   ============================================================ */
const TITLES = ['software developer', 'ml engineer', 'full stack developer'];
const typeEl = $('#type');

if (typeEl && motionOK()) {
  let title = 0;
  let chars = TITLES[0].length;   // the markup already holds the first one
  let deleting = false;

  const step = () => {
    const word = TITLES[title];
    typeEl.textContent = word.slice(0, chars);

    let wait;
    if (!deleting) {
      if (chars < word.length) {
        chars++;
        wait = 58 + Math.random() * 46;    // an uneven hand, not a metronome
      } else {
        deleting = true;
        wait = 1900;                        // sit on the finished word
      }
    } else if (chars > 0) {
      chars--;
      wait = 26;
    } else {
      deleting = false;
      title = (title + 1) % TITLES.length;
      wait = 340;
    }
    setTimeout(step, wait);
  };

  setTimeout(step, 1500);   // let the name finish decoding first
}

/* ============================================================
   scroll rail — one RAF per scroll burst, never one per event
   ============================================================ */
const rail = $('#rail');
let railQueued = false;

function drawRail() {
  railQueued = false;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const k = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  rail.style.transform = `scaleX(${k.toFixed(4)})`;
}
window.addEventListener('scroll', () => {
  if (railQueued) return;
  railQueued = true;
  requestAnimationFrame(drawRail);
}, { passive: true });
drawRail();

/* ============================================================
   top bar — frost it once it pins, plain while it sits in the page
   ============================================================ */
const topbar = $('.topbar');
const sentinel = $('.topbar-sentinel');

if (topbar && sentinel) {
  new IntersectionObserver(
    ([entry]) => topbar.classList.toggle('pinned', !entry.isIntersecting),
    { threshold: 0 }
  ).observe(sentinel);
}

/* ============================================================
   reveal on scroll — the first screenful staggers, the rest
   arrive as you reach them
   ============================================================ */
const revealer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    revealer.unobserve(entry.target);
    entry.target.classList.add('in');
  });
}, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

$$('.rise').forEach((el, i) => {
  el.style.setProperty('--d', `${Math.min(i, 5) * 55}ms`);
  revealer.observe(el);
});

/* ============================================================
   spring tilt — a real integrator (force, velocity, damping)
   rather than a CSS transition, so it overshoots and settles
   ============================================================ */
function springTilt(el, { stiffness = 0.14, damping = 0.75, max = 4.5 } = {}) {
  let x = 0, y = 0, vx = 0, vy = 0, tx = 0, ty = 0, running = false;

  const step = () => {
    vx = (vx + (tx - x) * stiffness) * damping;
    vy = (vy + (ty - y) * stiffness) * damping;
    x += vx;
    y += vy;

    const atRest = Math.abs(tx - x) < 0.01 && Math.abs(vx) < 0.01 &&
                   Math.abs(ty - y) < 0.01 && Math.abs(vy) < 0.01;

    if (atRest && tx === 0 && ty === 0) {
      el.style.transform = '';
      running = false;
      return;
    }
    el.style.transform =
      `perspective(700px) rotateX(${(-y).toFixed(3)}deg) rotateY(${x.toFixed(3)}deg)`;
    requestAnimationFrame(step);
  };

  const wake = () => { if (!running) { running = true; requestAnimationFrame(step); } };

  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2 * max;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2 * max;
    wake();
  });
  el.addEventListener('pointerleave', () => { tx = 0; ty = 0; wake(); });
}

if (motionOK() && finePointer.matches) $$('.widget').forEach((el) => springTilt(el));


/* ============================================================
   command palette
   ============================================================ */
const palette = $('#palette');
const paletteInput = $('#palette-input');
const paletteList = $('#palette-list');
const hint = $('#hint');

const MAC = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');
if (!MAC) hint.querySelector('kbd').textContent = 'ctrl';

const escapeHTML = (str) => str.replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function go(url) { window.open(url, '_blank', 'noopener'); }

function jump(id) {
  closePalette({ keepScroll: true });
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'start' });
}

async function copyEmail() {
  const email = 'nakul0306@gmail.com';
  closePalette();
  try {
    await navigator.clipboard.writeText(email);
    toast(`copied ${email}`);
  } catch {
    toast(email);   // clipboard blocked — at least put it on screen
  }
}

function levelUp(origin) {
  applyTheme(current() === 'dark' ? 'light' : 'dark', origin);
  toast('nice.');
}

const COMMANDS = [
  { label: 'about',            kind: 'jump',  run: () => jump('about') },
  { label: 'work',             kind: 'jump',  run: () => jump('work') },
  { label: 'projects',         kind: 'jump',  run: () => jump('projects') },
  { label: 'education',        kind: 'jump',  run: () => jump('education') },
  { label: 'skills',            kind: 'jump',  run: () => jump('skills') },
  { label: 'elsewhere',        kind: 'jump',  run: () => jump('elsewhere') },
  { label: 'switch to light',  kind: 'theme', run: () => { closePalette(); applyTheme('light'); } },
  { label: 'switch to dark',   kind: 'theme', run: () => { closePalette(); applyTheme('dark'); } },
  { label: 'copy email address', kind: 'copy', run: copyEmail },
  { label: 'open github',      kind: 'link',  run: () => { closePalette(); go('https://github.com/nakulpatel0306'); } },
  { label: 'open linkedin',    kind: 'link',  run: () => { closePalette(); go('https://www.linkedin.com/in/nakulpatel0306/'); } },
  { label: 'open instagram',   kind: 'link',  run: () => { closePalette(); go('https://www.instagram.com/nakulp.14/'); } },
  { label: 'open resume',      kind: 'link',  run: () => { closePalette(); go('./assets/nakul-patel-software-resume.pdf'); } },
  { label: 'level up',         kind: 'egg',   run: () => { closePalette(); levelUp(); } }
];

/* subsequence match: every character of the query, in order, anywhere
   in the label. Consecutive hits and hits near the cursor score higher. */
function score(label, query) {
  if (!query) return { points: 0, html: escapeHTML(label) };

  const hay = label.toLowerCase();
  const needle = query.toLowerCase();
  let from = 0, points = 0, streak = 0, html = '';

  for (const ch of needle) {
    const at = hay.indexOf(ch, from);
    if (at === -1) return null;
    streak = at === from ? streak + 1 : 0;
    points += 12 + streak * 6 - Math.min(at - from, 8);
    html += escapeHTML(label.slice(from, at)) + `<mark>${escapeHTML(label[at])}</mark>`;
    from = at + 1;
  }
  return { points, html: html + escapeHTML(label.slice(from)) };
}

let results = [];
let active = 0;

function render() {
  const query = paletteInput.value.trim();

  results = COMMANDS
    .map((cmd) => {
      const hit = score(cmd.label, query);
      return hit && { cmd, ...hit };
    })
    .filter(Boolean)
    .sort((a, b) => b.points - a.points);

  active = 0;

  if (!results.length) {
    paletteList.innerHTML = '<li class="palette-empty" role="presentation">nothing matches that</li>';
    return;
  }

  paletteList.innerHTML = results.map((r, i) => `
    <li role="option" id="cmd-${i}" aria-selected="${i === 0}" data-i="${i}">
      <span>${r.html}</span><span class="p-kind">${r.cmd.kind}</span>
    </li>`).join('');
  markActive();
}

function markActive() {
  const items = Array.from(paletteList.children);
  items.forEach((li, i) => li.setAttribute('aria-selected', String(i === active)));
  const el = items[active];
  if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  paletteInput.setAttribute('aria-activedescendant', el ? el.id : '');
}

function move(delta) {
  if (!results.length) return;
  active = (active + delta + results.length) % results.length;
  markActive();
}

let lastFocus = null;

function openPalette() {
  if (!palette.hidden) return;
  lastFocus = document.activeElement;
  palette.hidden = false;
  paletteInput.value = '';
  render();
  paletteInput.focus();
}

function closePalette({ keepScroll = false } = {}) {
  if (palette.hidden) return;
  palette.hidden = true;
  // preventScroll matters: restoring focus to the footer button would
  // otherwise yank the page back down after a jump
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  if (keepScroll) lastFocus = null;
}

hint.addEventListener('click', openPalette);

/* a modal dialog must not leak focus to the page behind it. The palette's
   only focusable control is the input, so Tab just lands back on it. */
palette.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  paletteInput.focus();
});

palette.addEventListener('pointerdown', (e) => {
  if (e.target === palette) closePalette();
});

paletteInput.addEventListener('input', render);

paletteList.addEventListener('click', (e) => {
  const li = e.target.closest('li[data-i]');
  if (!li) return;
  active = Number(li.dataset.i);
  results[active].cmd.run();
});

paletteInput.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
  else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) results[active].cmd.run(); }
  else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
});

/* ============================================================
   glass — the reflection follows the pointer across each surface
   ============================================================ */
if (finePointer.matches) {
  $$('.glass, .widget').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(1)}px`);
      el.style.setProperty('--my', `${(e.clientY - r.top).toFixed(1)}px`);
    }, { passive: true });
  });
}

/* ============================================================
   skills — filtering with FLIP, so chips slide to their new
   positions instead of teleporting.

   First: measure where everything is. Then mutate. Then measure
   again, invert the delta as a transform, and play it off.
   ============================================================ */
const skillTabs = $$('.skill-tabs button');
const skillChips = $$('#skill-chips li');
const skillEmpty = $('#skill-empty');

function filterSkills(group, animate = true) {
  // FIRST — positions before the DOM changes
  const before = new Map();
  skillChips.forEach((chip) => {
    if (!chip.hidden) before.set(chip, chip.getBoundingClientRect());
  });

  let shown = 0;
  skillChips.forEach((chip) => {
    const keep = group === 'all'
      || (group === 'strong' ? chip.hasAttribute('data-strong') : chip.dataset.group === group);
    chip.hidden = !keep;
    if (keep) shown++;
  });
  skillEmpty.hidden = shown > 0;
  skillTabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.group === group)));

  if (!animate || !motionOK()) return;

  skillChips.forEach((chip) => {
    if (chip.hidden) return;
    const after = chip.getBoundingClientRect();   // LAST
    const prev = before.get(chip);

    if (!prev) {
      // wasn't on screen a moment ago — fade it in where it landed
      chip.animate(
        [{ opacity: 0, transform: 'scale(0.92)' }, { opacity: 1, transform: 'none' }],
        { duration: 240, easing: EASE }
      );
      return;
    }
    const dx = prev.left - after.left;
    const dy = prev.top - after.top;
    if (!dx && !dy) return;

    // INVERT back to the old spot, then PLAY forward to the new one
    chip.animate(
      [{ transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)` }, { transform: 'none' }],
      { duration: 340, easing: EASE }
    );
  });
}

skillTabs.forEach((tab) => tab.addEventListener('click', () => filterSkills(tab.dataset.group)));

// every chip ships visible so the deck still reads with JS off; narrow it to
// the strongest set here, before first paint, so there is nothing to flash
filterSkills('strong', false);

/* ============================================================
   keyboard: ⌘K / Ctrl+K, and the konami code
   ============================================================ */
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiAt = 0;

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    palette.hidden ? openPalette() : closePalette();
    return;
  }
  if (!palette.hidden) return;   // the palette owns the keyboard while it's up

  konamiAt = e.key === KONAMI[konamiAt] ? konamiAt + 1 : (e.key === KONAMI[0] ? 1 : 0);
  if (konamiAt === KONAMI.length) { konamiAt = 0; levelUp(); }
});
