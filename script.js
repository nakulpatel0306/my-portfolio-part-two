/* ============================================================
   Nakul Patel — BENTO (portfolio v4)
   Tile grid with 3D tilt, plus the full kit: preloader,
   inertia scroll, custom cursor, magnetic buttons, reveals.
   ============================================================ */

'use strict';

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(pointer: coarse)').matches;
const lerp = (a, b, k) => a + (b - a) * k;

/* ============================================================
   PRELOADER
   ============================================================ */
const loader = $('#loader');
(function preload() {
  if (reducedMotion) {
    $('#loader-pct').textContent = '100';
    loader.classList.add('done');
    document.body.classList.add('loaded');
    return;
  }
  const start = performance.now();
  const DUR = 1100;
  const tick = (now) => {
    const k = Math.min(1, (now - start) / DUR);
    $('#loader-pct').textContent = Math.round(100 * (1 - Math.pow(1 - k, 2.4)));
    if (k < 1) { requestAnimationFrame(tick); return; }
    loader.classList.add('done');
    document.body.classList.add('loaded');
  };
  requestAnimationFrame(tick);
})();

/* ============================================================
   SMOOTH INERTIA SCROLL — desktop only
   ============================================================ */
const smooth = $('#smooth');
let scrollCur = window.scrollY;
const useSmooth = !isTouch && !reducedMotion;

if (useSmooth) {
  document.documentElement.classList.add('has-smooth');
  const setBodyHeight = () => { document.body.style.height = smooth.scrollHeight + 'px'; };
  new ResizeObserver(setBodyHeight).observe(smooth);
  setBodyHeight();
  const loop = () => {
    scrollCur = lerp(scrollCur, window.scrollY, 0.092);
    if (Math.abs(scrollCur - window.scrollY) < 0.05) scrollCur = window.scrollY;
    smooth.style.transform = `translate3d(0, ${-scrollCur.toFixed(2)}px, 0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  // the wrapper is position:fixed, so native anchor scrolling can't reach
  // into it — resolve #links to document positions ourselves
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const id = a.getAttribute('href');
    const t = id.length > 1 && document.querySelector(id);
    window.scrollTo({ top: t ? t.getBoundingClientRect().top + scrollCur - 80 : 0 });
  });
}

/* ============================================================
   CUSTOM CURSOR + MAGNETIC — desktop only
   ============================================================ */
const dot = $('#cursor-dot'), ring = $('#cursor-ring');
let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

if (!isTouch && !reducedMotion) {
  document.documentElement.classList.add('has-cursor');
  document.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  const cur = () => {
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(cur);
  };
  requestAnimationFrame(cur);

  document.addEventListener('pointerover', (e) => {
    if (e.target.closest('[data-hover]')) ring.classList.add('big');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest('[data-hover]')) ring.classList.remove('big');
  });

  $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.32}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = '';
      setTimeout(() => { el.style.transition = ''; }, 400);
    });
  });
}

/* ============================================================
   3D TILE TILT — desktop only
   ============================================================ */
if (!isTouch && !reducedMotion) {
  $$('[data-tilt]').forEach((tile) => {
    tile.addEventListener('pointermove', (e) => {
      const r = tile.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tile.style.transform = `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-3px)`;
    });
    tile.addEventListener('pointerleave', () => {
      tile.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
      tile.style.transform = '';
      setTimeout(() => { tile.style.transition = ''; }, 500);
    });
  });
}

/* ============================================================
   REVEALS + COUNTERS
   ============================================================ */
const revealObs = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach((el) => revealObs.observe(el));

const countObs = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (!e.isIntersecting) return;
    countObs.unobserve(e.target);
    const el = e.target, target = Number(el.dataset.count);
    if (reducedMotion) { el.textContent = target; return; }
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / 900);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach((el) => countObs.observe(el));

/* gallery: drag to scroll */
const strip = $('.gallery-strip');
let stripDown = null;
strip.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  stripDown = { x: e.clientX, left: strip.scrollLeft };
  strip.setPointerCapture(e.pointerId);
});
strip.addEventListener('pointermove', (e) => {
  if (stripDown) strip.scrollLeft = stripDown.left - (e.clientX - stripDown.x);
});
['pointerup', 'pointercancel'].forEach((ev) => strip.addEventListener(ev, () => { stripDown = null; }));

/* ============================================================
   KONAMI
   ============================================================ */
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let kPos = 0;
const powup = $('#powup');

document.addEventListener('keydown', (e) => {
  if (!powup.hidden && (e.key === 'Escape' || e.key === 'Enter')) { powup.hidden = true; return; }
  kPos = e.key === KONAMI[kPos] ? kPos + 1 : (e.key === KONAMI[0] ? 1 : 0);
  if (kPos === KONAMI.length) { kPos = 0; levelUp(); }
});
powup.addEventListener('click', () => { powup.hidden = true; });
$('.footer-hint').addEventListener('click', levelUp);

function levelUp() {
  powup.hidden = false;
  confettiBurst();
  setTimeout(() => { powup.hidden = true; }, 2600);
}

const CONFETTI_COLORS = ['#64ffda', '#ffffff', '#3ecfae', '#9aa0af', '#c8fff1'];
function confettiBurst() {
  if (reducedMotion) return;
  for (let i = 0; i < 110; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    p.style.animationDuration = 2 + Math.random() * 2.2 + 's';
    p.style.animationDelay = Math.random() * 0.5 + 's';
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}
