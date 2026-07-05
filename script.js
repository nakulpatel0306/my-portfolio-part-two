/* ============================================================
   Nakul Patel — NIGHT PATROL (portfolio v3)
   A living canvas city: parallax skyline, flying hero,
   collectible signals, and a searchlight for the final chapter.
   ============================================================ */

'use strict';

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   CITY ENGINE
   ============================================================ */
const canvas = $('#city');
const ctx = canvas.getContext('2d');

/* deterministic skyline — same city every visit */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let W = 0, H = 0, DPR = 1;
let stars = [], clouds = [], layers = [], flickers = [];
let shooting = null, nextShotAt = 4; // seconds
let scrollProgress = 0;
let beamAlpha = 0, beamTarget = 0;
const trail = [];

const LAYER_SPECS = [
  { speed: 0.05, base: 0.52, hMin: 0.10, hMax: 0.26, wMin: 34, wMax: 70,  color: '#0a0e21', win: null,      winProb: 0 },
  { speed: 0.16, base: 0.30, hMin: 0.16, hMax: 0.42, wMin: 44, wMax: 96,  color: '#0b1029', win: '#3a4a7a', winProb: 0.10 },
  { speed: 0.34, base: 0.10, hMin: 0.22, hMax: 0.55, wMin: 56, wMax: 130, color: '#070a1a', win: '#ffb454', winProb: 0.16 },
];

function buildCity() {
  W = window.innerWidth;
  H = window.innerHeight;
  DPR = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  const rand = mulberry32(20260705);

  stars = Array.from({ length: 200 }, () => ({
    x: rand() * W,
    y: rand() * H * 0.62,
    r: 0.4 + rand() * 1.1,
    phase: rand() * Math.PI * 2,
    speed: 0.4 + rand() * 1.4,
  }));

  clouds = Array.from({ length: 7 }, () => ({
    x: rand() * W,
    y: H * (0.08 + rand() * 0.3),
    w: W * (0.16 + rand() * 0.22),
    h: 26 + rand() * 34,
    drift: 3 + rand() * 7,
    alpha: 0.05 + rand() * 0.06,
  }));

  flickers = [];
  layers = LAYER_SPECS.map((spec, li) => {
    const lw = Math.round(W * 1.55);
    const off = document.createElement('canvas');
    off.width = Math.round(lw * DPR);
    off.height = Math.round(H * DPR);
    const c = off.getContext('2d');
    c.setTransform(DPR, 0, 0, DPR, 0, 0);

    let x = -20;
    while (x < lw + 20) {
      const bw = spec.wMin + rand() * (spec.wMax - spec.wMin);
      const bh = H * (spec.hMin + rand() * (spec.hMax - spec.hMin));
      const by = H - bh;
      c.fillStyle = spec.color;
      c.fillRect(x, by, bw, bh);

      // rooftop details on the near layer
      if (li === 2 && rand() > 0.45) {
        const ax = x + bw * (0.2 + rand() * 0.6);
        c.fillRect(ax, by - 14, 2.5, 14);           // antenna
        if (rand() > 0.6) {
          c.fillStyle = 'rgba(255, 80, 80, 0.9)';   // aircraft warning light
          c.beginPath(); c.arc(ax + 1.2, by - 15, 1.6, 0, 7); c.fill();
          c.fillStyle = spec.color;
        }
        if (rand() > 0.55) c.fillRect(x + bw * 0.12, by - 8, bw * 0.16, 8); // roof box
      }

      // windows
      if (spec.win) {
        const cols = Math.max(2, Math.floor(bw / 16));
        const rows = Math.max(3, Math.floor(bh / 22));
        for (let cx = 0; cx < cols; cx++) {
          for (let cy = 0; cy < rows; cy++) {
            if (rand() < spec.winProb) {
              const wx = x + 5 + cx * ((bw - 10) / cols);
              const wy = by + 8 + cy * ((bh - 12) / rows);
              c.fillStyle = spec.win;
              c.globalAlpha = 0.45 + rand() * 0.5;
              c.fillRect(wx, wy, 4.5, 6);
              c.globalAlpha = 1;
              // remember a few near-layer windows to flicker live
              if (li === 2 && rand() < 0.05 && flickers.length < 26) {
                flickers.push({ x: wx, y: wy, phase: rand() * 10, freq: 2 + rand() * 5 });
              }
            }
          }
        }
        c.fillStyle = spec.color;
      }
      x += bw + (li === 0 ? 2 : 3 + rand() * 10);
    }
    return { img: off, lw, spec };
  });
}

/* the flight path both hero and signals follow (progress → screen pos) */
function pathPoint(p) {
  const sweep = 0.5 - 0.5 * Math.cos(p * Math.PI * 2);        // out and back
  const x = W * (0.16 + 0.66 * sweep);
  const y = H * (0.16 + 0.30 * p) + Math.sin(p * 9.5) * H * 0.025;
  return { x, y };
}

/* ---------- collectible signals ---------- */
const SIGNALS = [0.12, 0.32, 0.52, 0.72, 0.9].map((p) => ({ p, collected: false, pop: 0 }));
let signalsFound = 0;

function collectSignals(now) {
  SIGNALS.forEach((s) => {
    if (!s.collected && scrollProgress >= s.p) {
      s.collected = true;
      s.pop = now;
      signalsFound++;
      $('#signal-count').textContent = `${signalsFound}/${SIGNALS.length}`;
      if (signalsFound === SIGNALS.length) {
        $('#hud-signals').classList.add('all-found');
        const toast = $('#toast');
        toast.hidden = false;
        setTimeout(() => { toast.hidden = true; }, 3800);
      }
    }
  });
}

/* ---------- drawing ---------- */
function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#04050d');
  g.addColorStop(0.55, '#080c1e');
  g.addColorStop(0.85, '#101735');
  g.addColorStop(1, '#141d42');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawStars(t) {
  ctx.fillStyle = '#dfe7ff';
  stars.forEach((s) => {
    const a = 0.25 + 0.75 * Math.abs(Math.sin(s.phase + t * s.speed));
    ctx.globalAlpha = a * 0.8;
    ctx.fillRect(s.x, s.y, s.r, s.r);
  });
  ctx.globalAlpha = 1;
}

function drawMoon() {
  const mx = W * 0.8, my = H * 0.14, mr = Math.min(W, H) * 0.045;
  let g = ctx.createRadialGradient(mx, my, mr * 0.4, mx, my, mr * 5);
  g.addColorStop(0, 'rgba(210, 225, 255, 0.16)');
  g.addColorStop(1, 'rgba(210, 225, 255, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(mx - mr * 5, my - mr * 5, mr * 10, mr * 10);
  g = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.1, mx, my, mr);
  g.addColorStop(0, '#f4f7ff');
  g.addColorStop(1, '#c7d4f2');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(mx, my, mr, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(160, 175, 210, 0.35)';                 // craters
  ctx.beginPath(); ctx.arc(mx - mr * 0.3, my + mr * 0.15, mr * 0.16, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(mx + mr * 0.35, my - mr * 0.3, mr * 0.11, 0, 7); ctx.fill();
}

function drawClouds(t) {
  clouds.forEach((cl) => {
    const cx = (cl.x + t * cl.drift) % (W + cl.w) - cl.w / 2;
    const g = ctx.createRadialGradient(cx, cl.y, 2, cx, cl.y, cl.w / 2);
    g.addColorStop(0, `rgba(150, 170, 220, ${cl.alpha})`);
    g.addColorStop(1, 'rgba(150, 170, 220, 0)');
    ctx.fillStyle = g;
    ctx.save();
    ctx.scale(1, cl.h / (cl.w / 2));
    ctx.beginPath();
    ctx.arc(cx, cl.y / (cl.h / (cl.w / 2)), cl.w / 2, 0, 7);
    ctx.fill();
    ctx.restore();
  });
}

function drawShootingStar(t) {
  if (!shooting && t > nextShotAt) {
    shooting = { x: W * (0.15 + 0.6 * Math.abs(Math.sin(t * 13.7))), y: H * 0.08, t0: t };
  }
  if (shooting) {
    const life = (t - shooting.t0) / 0.9;
    if (life > 1) { shooting = null; nextShotAt = t + 5 + 8 * Math.abs(Math.sin(t * 7.3)); return; }
    const d = life * W * 0.24;
    const x = shooting.x + d, y = shooting.y + d * 0.42;
    const grad = ctx.createLinearGradient(x - 90, y - 38, x, y);
    grad.addColorStop(0, 'rgba(220, 235, 255, 0)');
    grad.addColorStop(1, `rgba(220, 235, 255, ${0.85 * (1 - life)})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x - 90, y - 38); ctx.lineTo(x, y); ctx.stroke();
  }
}

function drawBeam(t) {
  beamAlpha += (beamTarget - beamAlpha) * 0.045;
  if (beamAlpha < 0.01) return;
  const bx = W * 0.82, by = H * 0.66;                          // searchlight rooftop
  const topX = W * 0.72, topY = H * 0.07;
  const sway = Math.sin(t * 0.5) * W * 0.012;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(bx, by, topX, topY);
  g.addColorStop(0, `rgba(69, 227, 255, ${0.28 * beamAlpha})`);
  g.addColorStop(1, `rgba(69, 227, 255, ${0.02 * beamAlpha})`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(bx - 6, by);
  ctx.lineTo(topX - W * 0.085 + sway, topY);
  ctx.lineTo(topX + W * 0.085 + sway, topY);
  ctx.lineTo(bx + 6, by);
  ctx.closePath();
  ctx.fill();
  // monogram on the clouds
  const dx = topX + sway, dy = topY + H * 0.02;
  const dg = ctx.createRadialGradient(dx, dy, 4, dx, dy, W * 0.075);
  dg.addColorStop(0, `rgba(69, 227, 255, ${0.5 * beamAlpha})`);
  dg.addColorStop(1, 'rgba(69, 227, 255, 0)');
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.ellipse(dx, dy, W * 0.075, W * 0.045, -0.1, 0, 7);
  ctx.fill();
  ctx.globalAlpha = Math.min(1, beamAlpha) * 0.9;
  ctx.fillStyle = '#dffaff';
  ctx.font = `700 ${Math.round(W * 0.032)}px 'Archivo Black', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NP', dx, dy);
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawLayer(i, extraGlow) {
  const { img, lw, spec } = layers[i];
  const off = -scrollProgress * spec.speed * (lw - W);
  ctx.drawImage(img, off, 0, lw, H);
  if (extraGlow) {
    // horizon haze between far and mid layers
    const g = ctx.createLinearGradient(0, H * 0.45, 0, H);
    g.addColorStop(0, 'rgba(20, 30, 70, 0)');
    g.addColorStop(1, 'rgba(24, 34, 80, 0.5)');
    ctx.fillStyle = g;
    ctx.fillRect(0, H * 0.45, W, H * 0.55);
  }
}

function drawFlickers(t) {
  const off = -scrollProgress * LAYER_SPECS[2].speed * (layers[2].lw - W);
  flickers.forEach((f) => {
    if (Math.sin(f.phase + t * f.freq) > 0.55) {
      ctx.fillStyle = 'rgba(255, 200, 110, 0.9)';
      ctx.fillRect(f.x + off, f.y, 4.5, 6);
    }
  });
}

function drawSignals(t) {
  SIGNALS.forEach((s) => {
    const pos = pathPoint(s.p);
    if (!s.collected) {
      const pulse = 1 + 0.18 * Math.sin(t * 3 + s.p * 20);
      const g = ctx.createRadialGradient(pos.x, pos.y, 1, pos.x, pos.y, 16 * pulse);
      g.addColorStop(0, 'rgba(69, 227, 255, 0.9)');
      g.addColorStop(0.4, 'rgba(69, 227, 255, 0.35)');
      g.addColorStop(1, 'rgba(69, 227, 255, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 16 * pulse, 0, 7); ctx.fill();
      ctx.fillStyle = '#eaffff';
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 2.6, 0, 7); ctx.fill();
    } else if (t - s.pop < 0.6) {
      const k = (t - s.pop) / 0.6;
      ctx.strokeStyle = `rgba(69, 227, 255, ${0.8 * (1 - k)})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 4 + k * 30, 0, 7); ctx.stroke();
    }
  });
}

let lastPos = null;
function drawHero(t) {
  const pos = pathPoint(scrollProgress);
  const bob = Math.sin(t * 2.1) * 4;
  const x = pos.x, y = pos.y + bob;
  const dir = lastPos && x < lastPos.x - 0.1 ? -1 : 1;
  const speed = lastPos ? Math.min(18, Math.abs(x - lastPos.x) + Math.abs(y - lastPos.y)) : 0;
  lastPos = { x, y };

  // trail
  if (speed > 0.4 && trail.length < 60) {
    trail.push({ x: x - dir * 16, y: y + 4, t0: t, r: 1.5 + speed * 0.12 });
  }
  for (let i = trail.length - 1; i >= 0; i--) {
    const p = trail[i];
    const k = (t - p.t0) / 0.8;
    if (k > 1) { trail.splice(i, 1); continue; }
    ctx.fillStyle = `rgba(69, 227, 255, ${0.35 * (1 - k)})`;
    ctx.beginPath(); ctx.arc(p.x - dir * k * 26, p.y + k * 8, p.r * (1 - k * 0.6), 0, 7); ctx.fill();
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  ctx.rotate(-0.12 - speed * 0.008);

  // cape — flows behind, waving
  const w1 = Math.sin(t * 6) * 3.5, w2 = Math.sin(t * 6 + 1.6) * 4.5;
  ctx.fillStyle = '#0e1633';
  ctx.beginPath();
  ctx.moveTo(-4, -8);
  ctx.quadraticCurveTo(-20, -4 + w1, -30, 4 + w2);
  ctx.quadraticCurveTo(-19, 8 + w1, -6, 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(69, 227, 255, 0.35)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // body
  ctx.fillStyle = '#111a3d';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 6.5, 0, 0, 7);
  ctx.fill();
  // rim light
  ctx.strokeStyle = 'rgba(120, 220, 255, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, -1, 11, 6, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();

  // head
  ctx.fillStyle = '#131d45';
  ctx.beginPath(); ctx.arc(12, -6, 5, 0, 7); ctx.fill();
  // visor glow
  ctx.fillStyle = '#45e3ff';
  ctx.fillRect(12.5, -7.4, 4.4, 1.9);

  // fists forward
  ctx.fillStyle = '#111a3d';
  ctx.beginPath(); ctx.arc(19, -1, 2.6, 0, 7); ctx.fill();

  // chest signal
  const cg = ctx.createRadialGradient(2, -1, 0.4, 2, -1, 5);
  cg.addColorStop(0, 'rgba(69, 227, 255, 0.9)');
  cg.addColorStop(1, 'rgba(69, 227, 255, 0)');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.arc(2, -1, 5, 0, 7); ctx.fill();

  ctx.restore();
}

/* ---------- main loop ---------- */
let rafId = null;
function frame(now) {
  const t = now / 1000;
  drawSky();
  drawStars(t);
  drawMoon();
  drawClouds(t);
  drawShootingStar(t);
  drawLayer(0, true);
  drawBeam(t);
  drawLayer(1, false);
  drawLayer(2, false);
  drawFlickers(t);
  drawSignals(t);
  drawHero(t);
  collectSignals(t);
  rafId = requestAnimationFrame(frame);
}

function staticFrame() {
  drawSky();
  drawStars(0.5);
  drawMoon();
  drawLayer(0, true);
  drawLayer(1, false);
  drawLayer(2, false);
}

buildCity();
if (reducedMotion) {
  staticFrame();
} else {
  rafId = requestAnimationFrame(frame);
}

let resizeT = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(() => {
    buildCity();
    if (reducedMotion) staticFrame();
  }, 150);
});

document.addEventListener('visibilitychange', () => {
  if (reducedMotion) return;
  if (document.hidden) {
    cancelAnimationFrame(rafId);
  } else {
    rafId = requestAnimationFrame(frame);
  }
});

/* ============================================================
   SCROLL STATE
   ============================================================ */
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  $('#patrol-pct').textContent = Math.round(scrollProgress * 100) + '%';
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ============================================================
   DOM: kinetic type, reveals, waypoints, counters, cells
   ============================================================ */

/* split hero headline into per-letter spans */
$$('.k-line').forEach((line, li) => {
  const target = line.querySelector('em') || line;
  const text = target.textContent;
  target.textContent = '';
  text.split('').forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'kl';
    s.textContent = ch === ' ' ? ' ' : ch;
    s.style.setProperty('--d', (li * 0.14 + i * 0.028) + 's');
    target.appendChild(s);
  });
});
requestAnimationFrame(() => requestAnimationFrame(() => $('#hero-title').classList.add('in')));
setTimeout(() => $('#hero-title').classList.add('done'), 1800); // unclip the glow

/* reveals */
const revealObs = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach((el) => revealObs.observe(el));

/* waypoint dots */
const wps = $$('.waypoints a');
const wpObs = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (e.isIntersecting) {
      wps.forEach((a) => a.classList.toggle('active', a.dataset.wp === e.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main .chapter[id]').forEach((s) => wpObs.observe(s));

/* count-up stats */
const countObs = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (!e.isIntersecting) return;
    countObs.unobserve(e.target);
    const el = e.target, target = Number(el.dataset.count);
    if (reducedMotion) { el.textContent = target; return; }
    const start = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - start) / 900);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach((el) => countObs.observe(el));

/* power cells — build 10 segments, light them on view */
$$('.cell-row').forEach((row) => {
  const track = row.querySelector('.cell-track');
  for (let i = 0; i < 10; i++) track.appendChild(document.createElement('b'));
});
const cellObs = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (!e.isIntersecting) return;
    cellObs.unobserve(e.target);
    const row = e.target;
    const level = Number(row.dataset.level);
    const segs = row.querySelectorAll('.cell-track b');
    const rowIdx = Array.from(row.parentElement.children).indexOf(row);
    segs.forEach((seg, i) => {
      if (i < level) {
        setTimeout(() => seg.classList.add('on'),
          reducedMotion ? 0 : rowIdx * 90 + i * 55);
      }
    });
  });
}, { threshold: 0.5 });
$$('.cell-row').forEach((el) => cellObs.observe(el));

/* signal beam activation */
const beamObs = new IntersectionObserver((es) => {
  es.forEach((e) => { beamTarget = e.isIntersecting ? 1 : 0; });
}, { threshold: 0.25 });
beamObs.observe($('#signal'));

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

const CONFETTI_COLORS = ['#45e3ff', '#ffb454', '#ffffff', '#1892b8', '#9fefff'];
function confettiBurst() {
  if (reducedMotion) return;
  for (let i = 0; i < 110; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    p.style.animationDuration = 2 + Math.random() * 2.2 + 's';
    p.style.animationDelay = Math.random() * 0.5 + 's';
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '1px';
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}
