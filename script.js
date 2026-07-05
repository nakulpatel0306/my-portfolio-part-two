/* ============================================================
   Nakul Patel — KEYNOTE (portfolio v4)
   Theme toggle · scroll cinema · physics tray · free throws
   ============================================================ */

'use strict';

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let gameColorsDirty = true; // the theme code below flips this before the game exists

/* ============================================================
   THEME — explicit choice beats OS, both survive reloads
   ============================================================ */
const root = document.documentElement;
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function effectiveTheme() {
  return root.dataset.theme || (darkQuery.matches ? 'dark' : 'light');
}
function applyThemeClass() {
  root.classList.toggle('is-dark', effectiveTheme() === 'dark');
  gameColorsDirty = true;
}
const savedTheme = localStorage.getItem('np-theme');
if (savedTheme === 'dark' || savedTheme === 'light') root.dataset.theme = savedTheme;
applyThemeClass();

$('#theme-toggle').addEventListener('click', () => {
  const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('np-theme', next);
  applyThemeClass();
});
darkQuery.addEventListener('change', applyThemeClass);

/* ============================================================
   SCROLL CINEMA (work showcase)
   ============================================================ */
const showWrap = $('.show-wrap');
const slides = $$('.slide');
const rail = $('#show-rail');
slides.forEach(() => rail.appendChild(document.createElement('b')));
const railDots = $$('#show-rail b');

const cinemaOK = () => !reducedMotion && window.innerWidth > 920;
function setCinemaMode() {
  document.body.classList.toggle('no-cinema', !cinemaOK());
  if (!cinemaOK()) slides.forEach((s) => s.classList.add('active'));
  else updateCinema();
}

let activeSlide = -1;
function updateCinema() {
  if (!cinemaOK()) return;
  const rect = showWrap.getBoundingClientRect();
  const total = showWrap.offsetHeight - window.innerHeight;
  const p = Math.min(1, Math.max(0, -rect.top / total));
  const idx = Math.min(slides.length - 1, Math.floor(p * slides.length));
  if (idx === activeSlide) return;
  activeSlide = idx;
  slides.forEach((s, i) => {
    s.classList.toggle('active', i === idx);
    s.classList.toggle('passed', i < idx);
  });
  railDots.forEach((d, i) => d.classList.toggle('on', i === idx));
  $('#show-idx').textContent = String(idx + 1).padStart(2, '0');
}
window.addEventListener('scroll', updateCinema, { passive: true });
window.addEventListener('resize', () => { activeSlide = -1; setCinemaMode(); });
setCinemaMode();

/* ============================================================
   REVEALS & COUNTERS
   ============================================================ */
const revealObs = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach((el) => revealObs.observe(el));

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

/* ============================================================
   PHYSICS TRAY (toolkit)
   ============================================================ */
const TOOLS = ['React', 'Node.js', 'TensorFlow', 'scikit-learn', 'Pandas', 'SQL', 'VBA',
               'Git', 'Docker', 'AWS', 'Azure', 'Linux/Unix', 'Power BI', 'Jira',
               'REST APIs', 'CI/CD', 'Data Viz', 'Quantum Optimization'];
const tray = $('#tray');
const chips = [];
let trayRunning = false, traySpawned = false;

function spawnChips() {
  traySpawned = true;
  const tw = tray.clientWidth;
  TOOLS.forEach((name, i) => {
    const el = document.createElement('button');
    el.className = 'chip' + (i % 6 === 0 ? ' accent' : '');
    el.type = 'button';
    el.textContent = name;
    tray.appendChild(el);
    const w = el.offsetWidth, h = el.offsetHeight;
    const chip = {
      el, w, h,
      r: Math.max(w, h) * 0.42,
      x: 40 + ((i * 137) % Math.max(80, tw - 120)),
      y: -40 - (i % 6) * 70,
      vx: (i % 2 ? -1 : 1) * (0.4 + (i % 5) * 0.3),
      vy: 0,
      drag: null,
    };
    chips.push(chip);
    attachDrag(chip);
  });
}

function attachDrag(chip) {
  chip.el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    chip.el.setPointerCapture(e.pointerId);
    const rect = tray.getBoundingClientRect();
    chip.drag = { dx: e.clientX - rect.left - chip.x, dy: e.clientY - rect.top - chip.y, px: chip.x, py: chip.y, t: performance.now() };
  });
  chip.el.addEventListener('pointermove', (e) => {
    if (!chip.drag) return;
    const rect = tray.getBoundingClientRect();
    const nx = e.clientX - rect.left - chip.drag.dx;
    const ny = e.clientY - rect.top - chip.drag.dy;
    const now = performance.now();
    const dt = Math.max(8, now - chip.drag.t);
    chip.vx = (nx - chip.drag.px) / dt * 16;
    chip.vy = (ny - chip.drag.py) / dt * 16;
    chip.drag.px = nx; chip.drag.py = ny; chip.drag.t = now;
    chip.x = nx; chip.y = ny;
  });
  const release = () => { chip.drag = null; };
  chip.el.addEventListener('pointerup', release);
  chip.el.addEventListener('pointercancel', release);
}

let trayLastT = 0;
function trayStep(now) {
  if (!trayRunning) return;
  const steps = Math.min(5, Math.max(1, Math.round((now - trayLastT) / 16.67)));
  trayLastT = now;
  for (let i = 0; i < steps; i++) traySubStep();
  chips.forEach((c) => {
    c.el.style.transform = `translate(${(c.x - c.w / 2).toFixed(1)}px, ${(c.y - c.h / 2).toFixed(1)}px)`;
  });
  requestAnimationFrame(trayStep);
}

function traySubStep() {
  const tw = tray.clientWidth, th = tray.clientHeight;
  const G = 0.45, DAMP = 0.55, FRICTION = 0.995;

  chips.forEach((c) => {
    if (c.drag) return;
    c.vy += G;
    c.vx *= FRICTION;
    c.x += c.vx;
    c.y += c.vy;
    const hw = c.w / 2 + 2, hh = c.h / 2 + 2;
    if (c.y > th - hh) { c.y = th - hh; c.vy = Math.abs(c.vy) > 1.2 ? -c.vy * DAMP : 0; c.vx *= 0.92; }
    if (c.x < hw) { c.x = hw; c.vx = -c.vx * DAMP; }
    if (c.x > tw - hw) { c.x = tw - hw; c.vx = -c.vx * DAMP; }
  });

  // gentle pairwise separation so the pile stacks instead of overlapping
  for (let i = 0; i < chips.length; i++) {
    for (let j = i + 1; j < chips.length; j++) {
      const a = chips[i], b = chips[j];
      let dx = b.x - a.x, dy = b.y - a.y;
      const min = a.r + b.r;
      const d2 = dx * dx + dy * dy;
      if (d2 > min * min || d2 === 0) continue;
      const d = Math.sqrt(d2);
      const push = (min - d) / d / 2;
      dx *= push; dy *= push;
      if (!a.drag) { a.x -= dx; a.y -= dy; a.vx -= dx * 0.25; a.vy -= dy * 0.25; }
      if (!b.drag) { b.x += dx; b.y += dy; b.vx += dx * 0.25; b.vy += dy * 0.25; }
    }
  }
}

const trayObs = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (e.isIntersecting) {
      if (!traySpawned) {
        spawnChips();
        setTimeout(() => { $('#tray-hint').style.opacity = 0.5; }, 1600);
      }
      if (!trayRunning && !reducedMotion) { trayRunning = true; trayLastT = performance.now(); requestAnimationFrame(trayStep); }
      if (reducedMotion) settleChipsStatic();
    } else {
      trayRunning = false;
    }
  });
}, { threshold: 0.2 });
trayObs.observe(tray);

function settleChipsStatic() {
  // reduced motion: lay chips out in neat rows, no simulation
  const tw = tray.clientWidth;
  let x = 20, y = tray.clientHeight - 30;
  chips.forEach((c) => {
    if (x + c.w > tw - 20) { x = 20; y -= c.h + 10; }
    c.el.style.transform = `translate(${x}px, ${y - c.h}px)`;
    x += c.w + 10;
  });
}

/* ============================================================
   FREE THROWS (halftime mini-game)
   ============================================================ */
const court = $('#court');
const gtx = court.getContext('2d');
const CW = court.width, CH = court.height;

const GROUND = CH - 44;
const BALL_START = { x: 130, y: GROUND - 16 };
const RIM_Y = 172, RIM_L = CW - 156, RIM_R = CW - 96, BOARD_X = CW - 84;
const BALL_R = 15;

const game = {
  ball: { ...BALL_START, vx: 0, vy: 0, flying: false, bounces: 0 },
  aim: null,
  score: 0, shots: 0, streak: 0,
  scoredThisFlight: false, prevY: 0,
  swish: 0,
  colors: null,
};
let gameRunning = false;

function gameColors() {
  const cs = getComputedStyle(root);
  game.colors = {
    text: cs.getPropertyValue('--text').trim(),
    muted: cs.getPropertyValue('--faint').trim(),
    line: cs.getPropertyValue('--line-strong').trim(),
    iris: cs.getPropertyValue('--iris').trim(),
    panel: cs.getPropertyValue('--panel-strong').trim(),
  };
  gameColorsDirty = false;
}

function resetBall() {
  Object.assign(game.ball, { ...BALL_START, vx: 0, vy: 0, flying: false, bounces: 0 });
  game.scoredThisFlight = false;
}

function drawCourt(t) {
  if (gameColorsDirty) gameColors();
  const C = game.colors;
  gtx.clearRect(0, 0, CW, CH);

  // floor
  gtx.strokeStyle = C.line;
  gtx.lineWidth = 2;
  gtx.beginPath(); gtx.moveTo(24, GROUND + BALL_R + 2); gtx.lineTo(CW - 24, GROUND + BALL_R + 2); gtx.stroke();

  // hoop: pole shadow line, backboard, rim, net
  gtx.strokeStyle = C.text;
  gtx.lineWidth = 3;
  gtx.beginPath(); gtx.moveTo(BOARD_X, RIM_Y - 62); gtx.lineTo(BOARD_X, RIM_Y + 10); gtx.stroke();
  gtx.lineWidth = 2.5;
  gtx.beginPath(); gtx.moveTo(RIM_L, RIM_Y); gtx.lineTo(RIM_R, RIM_Y); gtx.stroke();
  gtx.strokeStyle = C.muted;
  gtx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const nx = RIM_L + (RIM_R - RIM_L) * (i / 4);
    gtx.beginPath();
    gtx.moveTo(nx, RIM_Y + 1);
    gtx.lineTo(RIM_L + (RIM_R - RIM_L) * 0.5 + (nx - (RIM_L + (RIM_R - RIM_L) * 0.5)) * 0.35, RIM_Y + 34);
    gtx.stroke();
  }

  // aim preview
  if (game.aim && !game.ball.flying) {
    const { vx, vy } = aimVelocity();
    gtx.fillStyle = C.iris;
    let px = game.ball.x, py = game.ball.y, pvx = vx, pvy = vy;
    for (let i = 0; i < 30; i++) {
      pvy += 0.42; px += pvx; py += pvy;
      if (i % 2 === 0) { gtx.globalAlpha = 1 - i / 34; gtx.beginPath(); gtx.arc(px, py, 3, 0, 7); gtx.fill(); }
    }
    gtx.globalAlpha = 1;
  }

  // ball
  const b = game.ball;
  gtx.fillStyle = '#e8873a';
  gtx.beginPath(); gtx.arc(b.x, b.y, BALL_R, 0, 7); gtx.fill();
  gtx.strokeStyle = 'rgba(30, 15, 5, 0.55)';
  gtx.lineWidth = 1.4;
  gtx.beginPath(); gtx.arc(b.x, b.y, BALL_R, 0, 7); gtx.stroke();
  gtx.beginPath(); gtx.moveTo(b.x - BALL_R, b.y); gtx.lineTo(b.x + BALL_R, b.y); gtx.stroke();
  gtx.beginPath(); gtx.arc(b.x - BALL_R, b.y, BALL_R, -Math.PI / 3, Math.PI / 3); gtx.stroke();

  // swish flash
  if (game.swish > 0) {
    gtx.globalAlpha = game.swish;
    gtx.fillStyle = C.iris;
    gtx.font = '700 30px "Instrument Sans", sans-serif';
    gtx.textAlign = 'center';
    gtx.fillText(game.streak > 1 ? `SWISH ×${game.streak}` : 'SWISH!', (RIM_L + RIM_R) / 2 - 40, RIM_Y - 60);
    gtx.globalAlpha = 1;
    game.swish -= 0.02;
  }
}

function aimVelocity() {
  const dx = game.aim.sx - game.aim.cx;
  const dy = game.aim.sy - game.aim.cy;
  return { vx: Math.max(-16, Math.min(16, dx * 0.14)), vy: Math.max(-19, Math.min(6, dy * 0.14)) };
}

function stepGame() {
  const b = game.ball;
  if (b.flying) {
    game.prevY = b.y;
    b.vy += 0.42;
    // soft aim assist: predict where the arc crosses the rim plane; if that's
    // a near-miss, steer toward the center — wild shots get no help
    const rimC = (RIM_L + RIM_R) / 2;
    if (b.vy > -2 && b.y < RIM_Y - 4) {
      const disc = b.vy * b.vy + 2 * 0.42 * (RIM_Y - b.y);
      const framesLeft = Math.max(1, (-b.vy + Math.sqrt(disc)) / 0.42);
      const landX = b.x + b.vx * framesLeft;
      if (Math.abs(landX - rimC) < 42) {
        const idealVx = (rimC - b.x) / framesLeft;
        b.vx += (idealVx - b.vx) * 0.22;
      }
    }
    b.x += b.vx;
    b.y += b.vy;

    // backboard
    if (b.x + BALL_R > BOARD_X && b.y > RIM_Y - 62 && b.y < RIM_Y + 8 && b.vx > 0) {
      b.x = BOARD_X - BALL_R; b.vx = -b.vx * 0.55;
    }
    // rim points
    [{ x: RIM_L, y: RIM_Y }, { x: RIM_R, y: RIM_Y }].forEach((p) => {
      const dx = b.x - p.x, dy = b.y - p.y;
      const d = Math.hypot(dx, dy);
      if (d < BALL_R + 1 && d > 0) {
        const nx = dx / d, ny = dy / d;
        const dot = b.vx * nx + b.vy * ny;
        if (dot < 0) { b.vx -= 2 * dot * nx; b.vy -= 2 * dot * ny; b.vx *= 0.65; b.vy *= 0.65; }
        b.x = p.x + nx * (BALL_R + 1.2);
        b.y = p.y + ny * (BALL_R + 1.2);
      }
    });
    // failsafe: a ball balancing on the rim is not a shot — take it back
    if (Math.abs(b.vx) + Math.abs(b.vy) < 1.3 && b.y < GROUND - 4) {
      b.slow = (b.slow || 0) + 1;
      if (b.slow > 45) { b.slow = 0; resetBall(); }
    } else {
      b.slow = 0;
    }
    // score: crossed the rim plane downward, between the rims
    if (!game.scoredThisFlight && game.prevY < RIM_Y && b.y >= RIM_Y && b.vy > 0 &&
        b.x > RIM_L + 2 && b.x < RIM_R - 2) {
      game.scoredThisFlight = true;
      game.score++; game.streak++;
      game.swish = 1;
      $('#game-score').textContent = game.score;
      const st = $('#game-streak');
      st.hidden = game.streak < 2;
      st.textContent = `🔥×${game.streak}`;
    }
    // ground / walls
    if (b.y > GROUND && b.vy > 0) {
      b.y = GROUND; b.vy = -b.vy * 0.5; b.vx *= 0.85;
      b.bounces++;
      if (!game.scoredThisFlight) { game.streak = 0; $('#game-streak').hidden = true; }
      if (Math.abs(b.vy) < 1.4 || b.bounces >= 1) setTimeout(resetBall, 400);
    }
    if (b.x < BALL_R) { b.x = BALL_R; b.vx = -b.vx * 0.6; }
    if (b.x > CW + 60 || (Math.abs(b.vx) < 0.15 && Math.abs(b.vy) < 0.4 && b.y >= GROUND - 1)) {
      resetBall();
    }
  }
}

/* fixed 60Hz timestep — identical ball flight on 13fps laptops and 120Hz monitors */
let gameLastT = 0;
function gameLoop(now) {
  if (!gameRunning) return;
  const steps = Math.min(5, Math.max(1, Math.round((now - gameLastT) / 16.67)));
  gameLastT = now;
  for (let i = 0; i < steps; i++) stepGame();
  drawCourt(now / 1000);
  requestAnimationFrame(gameLoop);
}

/* pointer input — slingshot from anywhere near the ball */
function courtPos(e) {
  const r = court.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (CW / r.width), y: (e.clientY - r.top) * (CH / r.height) };
}
court.addEventListener('pointerdown', (e) => {
  const p = courtPos(e);
  // grabbing at the start spot always gives you a fresh ball
  if (game.ball.flying) {
    if (Math.hypot(p.x - BALL_START.x, p.y - BALL_START.y) < 70) resetBall();
    else return;
  }
  if (Math.hypot(p.x - game.ball.x, p.y - game.ball.y) < 70) {
    court.setPointerCapture(e.pointerId);
    game.aim = { sx: game.ball.x, sy: game.ball.y, cx: p.x, cy: p.y };
  }
});
court.addEventListener('pointermove', (e) => {
  if (!game.aim) return;
  const p = courtPos(e);
  game.aim.cx = p.x; game.aim.cy = p.y;
});
court.addEventListener('pointerup', () => {
  if (!game.aim) return;
  const { vx, vy } = aimVelocity();
  if (Math.hypot(vx, vy) > 2.5) {
    game.ball.vx = vx; game.ball.vy = vy;
    game.ball.flying = true;
    game.shots++;
    $('#game-shots').textContent = game.shots;
  }
  game.aim = null;
});

const courtObs = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (e.isIntersecting && !gameRunning) {
      gameRunning = true;
      gameLastT = performance.now();
      requestAnimationFrame(gameLoop);
    } else if (!e.isIntersecting) {
      gameRunning = false;
    }
  });
}, { threshold: 0.2 });
courtObs.observe(court);
drawCourt(0); // first paint even before it scrolls into view

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

const CONFETTI_COLORS = ['#5b4dff', '#b16dff', '#ffb27a', '#ffffff', '#8f84ff'];
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
