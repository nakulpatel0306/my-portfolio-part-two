/* ============================================================
   nakul patel — minimal (portfolio v5)
   theme toggle · konami
   ============================================================ */

'use strict';

const root = document.documentElement;
const btn = document.getElementById('theme');

/* ------------------------------------------------------------
   theme — follows the system until you say otherwise
   ------------------------------------------------------------ */
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

const store = {
  get() {
    try { return localStorage.getItem('theme'); } catch { return null; }
  },
  set(v) {
    try { localStorage.setItem('theme', v); } catch { /* private mode — fine */ }
  }
};

// the theme actually on screen right now
const current = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');

// the button offers the other one
const syncLabel = () => { btn.textContent = current() === 'dark' ? 'light' : 'dark'; };

const saved = store.get();
if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
syncLabel();

btn.addEventListener('click', () => {
  const next = current() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  store.set(next);
  syncLabel();
});

// keep up with the system while no explicit choice is stored
systemDark.addEventListener('change', () => { if (!root.dataset.theme) syncLabel(); });

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

  btn.click();
  note.hidden = false;
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => { note.hidden = true; }, 1800);
});
