/* ============================================================
   Nakul Patel — Portfolio Vol. 2
   Reveals · spotlight · nav state · stat bars · konami
   ============================================================ */

'use strict';

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- cursor spotlight ---------- */
const spotlight = $('#spotlight');
if (!reducedMotion) {
  document.addEventListener('pointermove', (e) => {
    spotlight.style.setProperty('--mx', e.clientX + 'px');
    spotlight.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });
}

/* ---------- scroll reveals ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach((el) => revealObserver.observe(el));

/* ---------- active nav link ---------- */
const navLinks = $$('.nav-links a[data-section]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((a) => a.classList.toggle('active', a.dataset.section === entry.target.id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
$$('.section[id]').forEach((s) => sectionObserver.observe(s));

/* ---------- mobile menu ---------- */
const burger = $('#nav-burger');
const links = $('#nav-links');
burger.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
});
navLinks.forEach((a) => a.addEventListener('click', () => {
  links.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));

/* ---------- about: count-up stats ---------- */
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    countObserver.unobserve(entry.target);
    const el = entry.target;
    const target = Number(el.dataset.count);
    if (reducedMotion) { el.textContent = target; return; }
    const start = performance.now();
    const dur = 900;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
$$('.stat-num').forEach((el) => countObserver.observe(el));

/* ---------- skills: fill stat bars on view ---------- */
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    barObserver.unobserve(entry.target);
    const bar = entry.target;
    bar.style.setProperty('--level', bar.dataset.level + '%');
    // small stagger so the bars cascade
    const idx = Array.from(bar.parentElement.children).indexOf(bar);
    setTimeout(() => bar.classList.add('filled'), reducedMotion ? 0 : idx * 110);
  });
}, { threshold: 0.5 });
$$('.sbar').forEach((el) => barObserver.observe(el));

/* ---------- konami: level up ---------- */
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiPos = 0;
const powup = $('#powup');

document.addEventListener('keydown', (e) => {
  if (!powup.hidden && (e.key === 'Escape' || e.key === 'Enter')) { powup.hidden = true; return; }
  konamiPos = e.key === KONAMI[konamiPos] ? konamiPos + 1 : (e.key === KONAMI[0] ? 1 : 0);
  if (konamiPos === KONAMI.length) {
    konamiPos = 0;
    levelUp();
  }
});
powup.addEventListener('click', () => { powup.hidden = true; });

function levelUp() {
  powup.hidden = false;
  confettiBurst();
  setTimeout(() => { powup.hidden = true; }, 2600);
}

const CONFETTI_COLORS = ['#e5484d', '#f0b429', '#ffffff', '#b3262b', '#ffd98a'];
function confettiBurst() {
  if (reducedMotion) return;
  for (let i = 0; i < 110; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.animationDuration = 2 + Math.random() * 2.2 + 's';
    piece.style.animationDelay = Math.random() * 0.5 + 's';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '1px';
    document.body.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

/* footer hint doubles as a button for touch devices */
$('.footer-hint').addEventListener('click', levelUp);
