/* ============================================================
   Nakul Patel — THE WORLD (portfolio v3)
   A drag-to-explore 3D island with clickable project pedestals,
   plus the full kit: preloader, inertia scroll, custom cursor,
   magnetic buttons, kinetic reveals.
   ============================================================ */

'use strict';

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(pointer: coarse)').matches;
const lerp = (a, b, k) => a + (b - a) * k;

/* ============================================================
   PRELOADER — counts up, then lifts away and stages the hero
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
  const scrollLoop = () => {
    scrollCur = lerp(scrollCur, window.scrollY, 0.092);
    if (Math.abs(scrollCur - window.scrollY) < 0.05) scrollCur = window.scrollY;
    smooth.style.transform = `translate3d(0, ${-scrollCur.toFixed(2)}px, 0)`;
    requestAnimationFrame(scrollLoop);
  };
  requestAnimationFrame(scrollLoop);

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
} else {
  scrollCur = 0;
}
const pageY = () => (useSmooth ? scrollCur : window.scrollY);

/* ============================================================
   CUSTOM CURSOR + MAGNETIC BUTTONS — desktop only
   ============================================================ */
const dot = $('#cursor-dot'), ring = $('#cursor-ring');
let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

if (!isTouch && !reducedMotion) {
  document.documentElement.classList.add('has-cursor');
  document.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  const cursorLoop = () => {
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(cursorLoop);
  };
  requestAnimationFrame(cursorLoop);

  document.addEventListener('pointerover', (e) => {
    if (e.target.closest('[data-hover]')) ring.classList.add('big');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest('[data-hover]')) ring.classList.remove('big');
  });

  // magnetic pull
  $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.32}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = '';
      setTimeout(() => { el.style.transition = ''; }, 400);
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
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
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

/* ============================================================
   THE 3D WORLD
   ============================================================ */
const PROJECTS = ['Flux — Stock Predictor', 'Echo — Spotify Stats', 'Swish — NBA Predictor',
                  'Evo — Genetic Algorithm Viz', 'King Me — Checkers', 'Click — Typing Game'];
const heroEl = $('#hero');
const tip = $('#scene-tip');
let heroVisible = true;

try {
  initWorld();
} catch (err) {
  $('#world').remove();
  $('#hero-fallback').hidden = false;
}

function initWorld() {
  const canvas = $('#world');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  if (!renderer.getContext()) throw new Error('no webgl');
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvas.style.touchAction = 'pan-y'; // vertical swipes scroll, horizontal drags orbit

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x11132e);
  scene.fog = new THREE.Fog(0x11132e, 15, 32);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 3.9, 14.2);
  camera.lookAt(0, 0.4, 0);

  scene.add(new THREE.HemisphereLight(0x9fa8ff, 0x3a2b55, 0.9));
  const sun = new THREE.DirectionalLight(0xffc9a0, 1.15);
  sun.position.set(6, 9, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 });
  scene.add(sun);

  const root = new THREE.Group();   // bobs up and down
  const world = new THREE.Group();  // rotates with drag
  root.add(world);
  scene.add(root);

  const mat = (color, opts = {}) =>
    new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.9, metalness: 0, ...opts });

  /* ---------- the island ---------- */
  const grass = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 5.7, 0.5, 10), mat(0x79c37e));
  grass.receiveShadow = true;
  world.add(grass);
  const dirt = new THREE.Mesh(new THREE.CylinderGeometry(5.7, 4.9, 1.2, 10), mat(0x8a6a52));
  dirt.position.y = -0.85;
  world.add(dirt);
  const rock = new THREE.Mesh(new THREE.CylinderGeometry(4.9, 0.5, 3.4, 9), mat(0x584f75));
  rock.position.y = -3.1;
  world.add(rock);

  /* trees + rocks */
  function tree(x, z, s = 1) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * s, 0.18 * s, 0.8 * s, 6), mat(0x8a6a52));
    trunk.position.y = 0.4 * s;
    g.add(trunk);
    [[1.0, 0.95], [0.75, 1.55], [0.5, 2.05]].forEach(([r, y]) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(r * s, 0.85 * s, 7), mat(0x5eab63));
      cone.position.y = y * s;
      cone.castShadow = true;
      g.add(cone);
    });
    g.position.set(x, 0.25, z);
    world.add(g);
  }
  tree(-1.6, -1.1, 1.25);
  tree(1.9, -1.7, 0.9);
  tree(-0.2, -2.3, 0.7);
  [[2.6, 1.9, 0.28], [-2.9, 0.9, 0.22], [0.9, 2.6, 0.18]].forEach(([x, z, s]) => {
    const r = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), mat(0x9a94bd));
    r.position.set(x, 0.28 + s * 0.4, z);
    r.castShadow = true;
    world.add(r);
  });

  /* flag */
  const flag = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.9, 6), mat(0xf0ead9));
  pole.position.y = 0.95;
  flag.add(pole);
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.42, 0.03), mat(0xff7059));
  cloth.position.set(0.4, 1.6, 0);
  cloth.castShadow = true;
  flag.add(cloth);
  flag.position.set(0.55, 0.25, 0.75);
  world.add(flag);

  /* ---------- project pedestals ---------- */
  const pedestals = [];
  const rings = [];

  function pedestalObject(i) {
    const g = new THREE.Group();
    const M = { coral: mat(0xff7059), teal: mat(0x57c7c2), gold: mat(0xf0b429), dark: mat(0x2a2c52), white: mat(0xf0ead9) };
    switch (i) {
      case 0: // Flux — ascending chart bars
        [[-0.22, 0.3, M.teal], [0, 0.52, M.gold], [0.22, 0.76, M.coral]].forEach(([x, h, m]) => {
          const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, h, 0.16), m);
          b.position.set(x, h / 2, 0);
          g.add(b);
        });
        break;
      case 1: { // Echo — vinyl record
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 20), M.dark);
        disc.rotation.x = Math.PI / 2.4;
        disc.position.y = 0.42;
        g.add(disc);
        const label = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 12), M.coral);
        label.rotation.x = Math.PI / 2.4;
        label.position.y = 0.42;
        g.add(label);
        break;
      }
      case 2: { // Swish — ball + hoop
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), mat(0xe8873a));
        ball.position.set(-0.16, 0.28, 0);
        g.add(ball);
        const hoopPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 6), M.white);
        hoopPole.position.set(0.26, 0.42, 0);
        g.add(hoopPole);
        const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 8, 14), M.coral);
        hoop.rotation.x = Math.PI / 2;
        hoop.position.set(0.13, 0.8, 0);
        g.add(hoop);
        break;
      }
      case 3: // Evo — spiral of spheres
        for (let k = 0; k < 6; k++) {
          const s = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 6), k % 2 ? M.teal : M.coral);
          const a = k * 1.15;
          s.position.set(Math.cos(a) * 0.2, 0.16 + k * 0.13, Math.sin(a) * 0.2);
          g.add(s);
        }
        break;
      case 4: { // King Me — crowned checker stack
        const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.1, 14), M.coral);
        c1.position.y = 0.2;
        const c2 = c1.clone();
        c2.position.y = 0.32;
        g.add(c1, c2);
        const crown = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 5), M.gold);
        crown.position.y = 0.5;
        g.add(crown);
        break;
      }
      case 5: { // Click — tiny keyboard
        const board = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.07, 0.34), M.dark);
        board.position.y = 0.22;
        board.rotation.x = -0.25;
        g.add(board);
        for (let kx = 0; kx < 4; kx++) {
          for (let kz = 0; kz < 2; kz++) {
            const key = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.1),
              kx === 1 && kz === 1 ? M.coral : M.white);
            key.position.set(-0.21 + kx * 0.14, 0.27 + (0.21 - kz * 0.14) * 0.25, 0.07 - kz * 0.14);
            key.rotation.x = -0.25;
            g.add(key);
          }
        }
        break;
      }
    }
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    return g;
  }

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const px = Math.cos(a) * 3.85, pz = Math.sin(a) * 3.85;
    const p = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.64, 0.5, 8), mat(0xefe4d3));
    base.position.y = 0.5;
    base.castShadow = true;
    p.add(base);
    const ringGlow = new THREE.Mesh(
      new THREE.TorusGeometry(0.66, 0.035, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0xff7059 })
    );
    ringGlow.rotation.x = Math.PI / 2;
    ringGlow.position.y = 0.28;
    p.add(ringGlow);
    rings.push(ringGlow);
    const obj = pedestalObject(i);
    obj.position.y = 0.75;
    p.add(obj);
    p.position.set(px, 0.25, pz);
    p.userData.idx = i;
    world.add(p);
    pedestals.push(p);
  }

  /* clouds + stars */
  const clouds = [];
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Group();
    [[0, 0, 0, 0.5], [0.5, 0.09, 0.1, 0.34], [-0.45, 0.04, -0.1, 0.3]].forEach(([x, y, z, r]) => {
      c.add(new THREE.Mesh(new THREE.SphereGeometry(r, 7, 6),
        new THREE.MeshLambertMaterial({ color: 0xdadff5, emissive: 0x555a7d, flatShading: true })));
      c.children[c.children.length - 1].position.set(x, y, z);
    });
    c.userData = { r: 6.2 + i * 0.5, a: i * 1.7, h: 4.4 + (i % 3) * 0.9, sp: 0.025 + i * 0.007 };
    scene.add(c);
    clouds.push(c);
  }
  {
    const N = 380, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2, e = Math.random() * Math.PI * 0.48, r = 19 + Math.random() * 8;
      pos[i * 3] = Math.cos(a) * Math.cos(e) * r;
      pos[i * 3 + 1] = Math.sin(e) * r * 0.75 + 1;
      pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xcdd3ff, size: 0.07, transparent: true, opacity: 0.85 })));
  }

  /* ---------- interaction ---------- */
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2(-2, -2);
  let clientX = 0, clientY = 0;
  let dragging = false, downX = 0, downY = 0, downT = 0, moved = 0;
  let rotY = 0, targetRotY = 0, tilt = 0, targetTilt = 0;
  let idle = 0, hovered = -1;

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    moved = 0;
    downX = e.clientX; downY = e.clientY; downT = performance.now();
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    clientX = e.clientX; clientY = e.clientY;
    const r = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    if (dragging) {
      targetRotY += e.movementX * 0.0055;
      targetTilt = Math.max(-0.1, Math.min(0.22, targetTilt + e.movementY * 0.0016));
      moved += Math.abs(e.movementX) + Math.abs(e.movementY);
      idle = 0;
    }
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    idle = -2.5; // pause auto-rotate briefly after interacting
    if (performance.now() - downT < 350 && moved < 8 && hovered >= 0) goToProject(hovered);
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => { ndc.set(-2, -2); });

  function goToProject(i) {
    const card = $('#p' + i);
    const top = card.getBoundingClientRect().top + pageY() - 90;
    window.scrollTo({ top, behavior: useSmooth ? 'auto' : 'smooth' });
    $$('.proj').forEach((c) => c.classList.remove('flash'));
    card.classList.add('flash');
    setTimeout(() => card.classList.remove('flash'), 1800);
  }

  /* keep rendering only while the hero is on screen */
  new IntersectionObserver((es) => {
    es.forEach((e) => { heroVisible = e.isIntersecting; });
  }, { threshold: 0.02 }).observe(heroEl);

  let baseY = -0.2;
  function resize() {
    const w = heroEl.clientWidth, h = heroEl.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (w > 860) {           // island sits right of the copy on desktop
      root.position.x = 2.4;
      root.scale.setScalar(1);
      baseY = -0.2;
    } else {                 // smaller and higher on phones, copy below it
      root.position.x = 0;
      root.scale.setScalar(0.62);
      baseY = 0.9;
    }
  }
  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  let el = 0;

  function frame() {
    requestAnimationFrame(frame);
    if (!heroVisible || document.hidden) return;
    const delta = Math.min(0.05, clock.getDelta());
    el += delta;
    idle += delta;

    if (!dragging && idle > 2.5 && !reducedMotion) targetRotY += delta * 0.1;
    rotY = lerp(rotY, targetRotY, 0.07);
    tilt = lerp(tilt, targetTilt, 0.07);
    world.rotation.y = rotY;
    root.rotation.x = tilt;
    root.position.y = baseY + (reducedMotion ? 0 : Math.sin(el * 0.8) * 0.13);

    clouds.forEach((c) => {
      c.userData.a += delta * c.userData.sp;
      c.position.set(Math.cos(c.userData.a) * c.userData.r, c.userData.h, Math.sin(c.userData.a) * c.userData.r);
    });
    rings.forEach((r, i) => {
      const s = 1 + Math.sin(el * 2.2 + i) * 0.07;
      r.scale.set(s, s, 1);
    });

    // hover raycast
    if (!dragging && ndc.x > -1.5) {
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(pedestals, true)[0];
      let idx = -1;
      if (hit) {
        let o = hit.object;
        while (o && o.userData.idx === undefined) o = o.parent;
        if (o) idx = o.userData.idx;
      }
      if (idx !== hovered) {
        hovered = idx;
        if (hovered >= 0) {
          tip.textContent = PROJECTS[hovered];
          tip.classList.add('on');
          ring.classList.add('big');
        } else {
          tip.classList.remove('on');
          ring.classList.remove('big');
        }
      }
      if (hovered >= 0) tip.style.transform = `translate(${clientX + 14}px, ${clientY - 34}px)`;
    }
    pedestals.forEach((p, i) => {
      const target = i === hovered ? 1.16 : 1;
      p.scale.setScalar(lerp(p.scale.x, target, 0.14));
    });

    // pull back + fade as you scroll into the content
    const prog = Math.min(1, pageY() / (heroEl.clientHeight || 1));
    camera.position.z = 14.2 + prog * 3.2;
    canvas.style.opacity = String(1 - prog * 0.85);

    renderer.render(scene, camera);
  }
  frame();
}

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

const CONFETTI_COLORS = ['#ff7059', '#79c37e', '#f0b429', '#ffffff', '#57c7c2'];
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
