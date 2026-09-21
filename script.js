/* ============================================================
   nakul patel — minimal (portfolio v5)
   theme switcher · konami
   ============================================================ */

'use strict';

const root = document.documentElement;
const buttons = Array.from(document.querySelectorAll('[data-theme-set]'));
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

const store = {
  get() {
    try { return localStorage.getItem('theme'); } catch { return null; }
  },
  set(v) {
    try { localStorage.setItem('theme', v); } catch { /* private mode — fine */ }
  }
};

// no stored choice means we're still following the system
const current = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');

const sync = () => {
  const now = current();
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeSet === now)));
};

const apply = (theme) => {
  root.dataset.theme = theme;
  store.set(theme);
  sync();
};

const saved = store.get();
if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
sync();

buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.themeSet)));

// keep following the system until an explicit choice is made
systemDark.addEventListener('change', sync);

/* ------------------------------------------------------------
   konami — the one easter egg every design shares.
   here it just flips the lights.
   ------------------------------------------------------------ */
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const note = document.getElementById('note');
let pos = 0;
let noteTimer;

document.addEventListener('keydown', (e) => {
  pos = e.key === KONAMI[pos] ? pos + 1 : (e.key === KONAMI[0] ? 1 : 0);
  if (pos !== KONAMI.length) return;
  pos = 0;

  apply(current() === 'dark' ? 'light' : 'dark');
  note.hidden = false;
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => { note.hidden = true; }, 1800);
});
