/**
 * toggles the mobile menu open/closed state
 * adds or removes the 'open' class to menu and hamburger icon
 **/

function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    
    menu.classList.toggle("open");
    icon.classList.toggle("open");
}

/* class to create typewriter effect */

class TxtType {
    constructor(el, toRotate, period) {
      this.toRotate = toRotate;
      this.el = el;
      this.loopNum = 0;
      this.period = parseInt(period, 10) || 2000;
      this.txt = '';
      this.isDeleting = false;
      this.tick();
    }
  
    tick() {
      const i = this.loopNum % this.toRotate.length;
      const fullTxt = this.toRotate[i];
  
      this.txt = this.isDeleting 
        ? fullTxt.substring(0, this.txt.length - 1)
        : fullTxt.substring(0, this.txt.length + 1);
  
      this.el.innerHTML = `<span class="wrap">${this.txt}</span>`;
      let delta = this.isDeleting ? 100 : 200 - Math.random() * 100;
  
      if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
      } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;
      }
  
      setTimeout(() => this.tick(), delta);
    }
}        
  
/* initialize typewriter effect on page load */

window.onload = function () {
    document.querySelectorAll('.typewrite').forEach((el) => {
      const toRotate = el.getAttribute('data-type');
      const period = el.getAttribute('data-period');
      if (toRotate) new TxtType(el, JSON.parse(toRotate), period);
    });
  
    const css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #fff}";
    document.body.appendChild(css);
  
    handleResize();/* Mobile menu toggle */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        const open = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', String(!open));
        mobileMenu.classList.toggle('open');
      });
    
      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          hamburger.setAttribute('aria-expanded', 'false');
          mobileMenu.classList.remove('open');
        });
      });
    }
    
    /* Smooth scroll for buttons/links with data-scroll */
    document.querySelectorAll('[data-scroll]').forEach(btn => {
      btn.addEventListener('click', e => {
        const target = document.querySelector(btn.getAttribute('data-scroll'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    
    /* Open CV */
    document.querySelectorAll('[data-action="open-cv"]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.open('./assets/nakul-patel-software-resume.pdf', '_blank', 'noopener');
      });
    });
    
    /* Typewriter effect */
    class TypeWriter {
      constructor(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.isDeleting = false;
        this.tick();
      }
      tick() {
        const i = this.loopNum % this.toRotate.length;
        const fullTxt = this.toRotate[i];
    
        this.txt = this.isDeleting
          ? fullTxt.substring(0, this.txt.length - 1)
          : fullTxt.substring(0, this.txt.length + 1);
    
        this.el.textContent = this.txt;
    
        let delta = 120 - Math.random() * 60;
        if (this.isDeleting) delta /= 2;
    
        if (!this.isDeleting && this.txt === fullTxt) {
          delta = this.period;
          this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
          this.isDeleting = false;
          this.loopNum++;
          delta = 300;
        }
        setTimeout(() => this.tick(), delta);
      }
    }
    
    window.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.typewrite').forEach(el => {
        const toRotate = el.getAttribute('data-type');
        const period = el.getAttribute('data-period');
        if (toRotate) new TypeWriter(el, JSON.parse(toRotate), period);
      });
    });
    
    /* Active nav highlight */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a, #mobile-menu a');
    
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0.1 }
    );
    sections.forEach(sec => observer.observe(sec));
    };

    // ==== Techy particles: layered constellation with cursor halo & pulse ====
// Listens on WINDOW so it works even when the canvas is behind other elements.
(() => {
  const canvas = document.getElementById("particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2); // crisp but not too heavy

  let W, H, particles = [];
  const CONFIG = {
    baseCount: 60,           // starting count at 1920x1080 (scales with area)
    maxRadius: 2,            // dot radius base
    speed: 0.30,             // drift speed
    linkDist: 110,           // default link distance (overridden per layer)
    dotAlpha: 0.50,          // dots opacity
    lineAlpha: 0.40,         // lines opacity
    lineWidth: 0.7,          // line thickness
    layers: [                // two-depth parallax
      { scale: 0.55, speed: 0.14, linkDist: 90,  dotAlpha: 0.28 },
      { scale: 1.00, speed: 0.22, linkDist: 130, dotAlpha: 0.35 }
    ]
  };

  // Respect reduced motion (if you want to force on, set: let running = true)
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  let running = !mq.matches;

  // Cursor halo — listen on WINDOW so it works behind content
  const mouse = { x: -9999, y: -9999, active: false };
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }, { passive: true });
  window.addEventListener("mouseout", () => { mouse.active = false; }, { passive: true });
  // Touch support
  window.addEventListener("touchmove", (e) => {
    const t = e.touches && e.touches[0];
    if (t) {
      mouse.x = t.clientX;
      mouse.y = t.clientY;
      mouse.active = true;
    }
  }, { passive: true });
  window.addEventListener("touchend", () => { mouse.active = false; }, { passive: true });

  function sizeCanvas() {
    W = canvas.clientWidth = window.innerWidth;
    H = canvas.clientHeight = window.innerHeight;
    canvas.width  = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function scaleByArea(countAt1080p) {
    const baseArea = 1920 * 1080;
    const area = W * H;
    return Math.round(countAt1080p * (area / baseArea));
  }

  function initParticles() {
    const total = Math.max(30, scaleByArea(CONFIG.baseCount));
    particles = [];
    CONFIG.layers.forEach((L, idx) => {
      const count = Math.round(total * (idx === 0 ? 0.55 : 0.45));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * (CONFIG.maxRadius - 0.8) + 0.8,
          vx: (Math.random() - 0.5) * L.speed,
          vy: (Math.random() - 0.5) * L.speed,
          layer: idx
        });
      }
    });
  }

  function wrap(p) {
    if (p.x < -20) p.x = W + 20;
    if (p.x > W + 20) p.x = -20;
    if (p.y < -20) p.y = H + 20;
    if (p.y > H + 20) p.y = -20;
  }

  // Network pulse (soft shimmer)
  let pulseT = 0, pulsing = false;
  const PULSE_LEN = 2; // seconds
  setInterval(() => { pulsing = true; pulseT = 0; }, 6000);

  function draw() {
    if (!running) return;

    ctx.clearRect(0, 0, W, H);

    // Pulse timing
    if (pulsing) {
      pulseT += 1 / 60; // approx
      if (pulseT >= PULSE_LEN) { pulsing = false; pulseT = 0; }
    }
    const pulseBoost = pulsing ? (1 + 0.35 * Math.sin(Math.PI * pulseT)) : 1;

    // Draw links
    const CURSOR_R = 140; // cursor influence
    ctx.lineWidth = CONFIG.lineWidth;

    // Sort by x to prune link checks
    const sorted = particles.slice().sort((a, b) => a.x - b.x);
    for (let i = 0; i < sorted.length; i++) {
      const a = sorted[i];
      for (let j = i + 1; j < sorted.length; j++) {
        const b = sorted[j];

        const maxL = (CONFIG.layers[a.layer].linkDist + CONFIG.layers[b.layer].linkDist) * 0.5;
        const dx = b.x - a.x;
        if (dx > maxL) break; // early exit by x

        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxL) {
          const t = 1 - dist / maxL;

          // Boost visibility near cursor (midpoint distance)
          let boost = 1;
          if (mouse.active) {
            const midx = (a.x + b.x) * 0.5, midy = (a.y + b.y) * 0.5;
            const md = Math.hypot(midx - mouse.x, midy - mouse.y);
            boost = md < CURSOR_R ? (1.25 - md / CURSOR_R) : 1;
          }

          const alpha = (CONFIG.lineAlpha * t * boost * pulseBoost);
          if (alpha > 0.005) {
            ctx.strokeStyle = `rgba(0,0,0,${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    // Draw dots
    particles.forEach(p => {
      const L = CONFIG.layers[p.layer];
      ctx.fillStyle = `rgba(0,0,0,${L.dotAlpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (p.layer === 0 ? 0.9 : 1.15), 0, Math.PI * 2);
      ctx.fill();
    });

    // Update motion + cursor repulsion + gentle wobble
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // gentle noise to avoid straight lines
      p.vx += (Math.random() - 0.5) * 0.002;
      p.vy += (Math.random() - 0.5) * 0.002;

      // cursor repulsion
      if (mouse.active) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < CURSOR_R && d > 0.0001) {
          const force = (1 - d / CURSOR_R) * 0.06;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }
      }

      // cap speed per layer
      const L = CONFIG.layers[p.layer];
      const s = Math.hypot(p.vx, p.vy);
      const maxS = L.speed * 1.4;
      if (s > maxS) { p.vx *= maxS / s; p.vy *= maxS / s; }

      wrap(p);
    });

    requestAnimationFrame(draw);
  }

  function onResize() {
    sizeCanvas();
    initParticles();
  }
  window.addEventListener("resize", onResize, { passive: true });

  // Start
  sizeCanvas();
  initParticles();
  if (running) requestAnimationFrame(draw);

  // React to reduced-motion changes
  mq.addEventListener?.("change", e => {
    running = !e.matches;
    if (running) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, W, H);
  });
})();

// Reveal experience cards on scroll
(() => {
  const items = document.querySelectorAll('.timeline ul > li');
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target); // reveal once
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

  items.forEach(li => io.observe(li));
})();

// ==== About carousel (no libraries) ====
(() => {
  const root = document.querySelector('.about-carousel');
  if (!root) return;

  const track = root.querySelector('.ac-track');
  const slides = Array.from(root.querySelectorAll('.ac-slide'));
  const prevBtn = root.querySelector('.ac-prev');
  const nextBtn = root.querySelector('.ac-next');
  const dotsWrap = root.querySelector('.ac-dots');

  let index = 0;
  const last = slides.length - 1;
  const autoplayMs = 5000;
  let timer;

  // build dots
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Go to slide ${i+1}`);
    b.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(b);
  });

  function updateDots() {
    dotsWrap.querySelectorAll('button').forEach((b, i) => {
      b.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  }

  function goTo(i, user=false) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    updateDots();
    if (user) restartAutoplay();
  }

  function next() { goTo(index + 1, true); }
  function prev() { goTo(index - 1, true); }

  // arrows + keyboard
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });
  root.setAttribute('tabindex', '0'); // enable keyboard focus

  // swipe (touch) support
  let startX = 0, dx = 0, isTouch = false;
  root.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startX = t.clientX;
    dx = 0;
    isTouch = true;
    pauseAutoplay();
  }, { passive: true });

  root.addEventListener('touchmove', (e) => {
    if (!isTouch) return;
    dx = e.touches[0].clientX - startX;
  }, { passive: true });

  root.addEventListener('touchend', () => {
    if (Math.abs(dx) > 40) (dx < 0 ? next() : prev());
    isTouch = false;
    restartAutoplay();
  });

  // autoplay (pause on hover/focus)
  function startAutoplay() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stopAutoplay();
    timer = setInterval(() => goTo(index + 1), autoplayMs);
  }
  function stopAutoplay() { if (timer) clearInterval(timer); }
  function pauseAutoplay() { stopAutoplay(); }
  function restartAutoplay() { startAutoplay(); }

  root.addEventListener('mouseenter', pauseAutoplay);
  root.addEventListener('mouseleave', restartAutoplay);
  root.addEventListener('focusin', pauseAutoplay);
  root.addEventListener('focusout', restartAutoplay);

  // init
  goTo(0);
  startAutoplay();

  // resize: keep track width accurate (flex handles most)
  window.addEventListener('resize', () => {
    // no special handling needed; transform uses percentages
  }, { passive: true });
})();

// ===== Skills: rotating-term looping typewriter for hireable() =====
(() => {
  const section = document.getElementById('skills');
  if (!section) return;
  const el = section.querySelector('.typewrite');
  if (!el) return;

  // terms to rotate and expression template with {term}
  const terms = (el.getAttribute('data-terms') || 'Problem Solving')
    .split('|')
    .map(s => s.trim())
    .filter(Boolean);
  const template = el.getAttribute('data-template') ||
    "this.strengths.includes('{term}') && this.programmingLanguages.length >= 5";

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // timings (tweak if you like)
  const TYPE_MS     = 65;   // per char while typing
  const ERASE_MS    = 35;   // per char while erasing
  const HOLD_END    = 900;  // pause after finishing typing
  const HOLD_EMPTY  = 500;  // pause after erase
  const START_DELAY = 250;

  function makeText(term) {
    // use single quotes around the skill term inside the expression
    return template.replace('{term}', term.replace(/'/g, "\\'"));
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  function type(node, str) {
    return new Promise(resolve => {
      let i = 0;
      const tick = () => {
        node.textContent = str.slice(0, i + 1);
        i++;
        if (i < str.length) setTimeout(tick, TYPE_MS);
        else resolve();
      };
      setTimeout(tick, START_DELAY);
    });
  }

  function erase(node) {
    return new Promise(resolve => {
      let i = node.textContent.length;
      const full = node.textContent;
      const tick = () => {
        node.textContent = full.slice(0, i - 1);
        i--;
        if (i > 0) setTimeout(tick, ERASE_MS);
        else { node.textContent = ""; resolve(); }
      };
      tick();
    });
  }

  async function runLoop() {
    // start only when section is visible
    await new Promise(res => {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { res(); io.disconnect(); } });
      }, { threshold: 0.25 });
      io.observe(section);
    });

    if (prefersReduced) {
      el.textContent = makeText(terms[0]); // static for reduced motion
      return;
    }

    let idx = 0;
    // loop forever
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const expr = makeText(terms[idx]);
      await type(el, expr);
      await wait(HOLD_END);
      await erase(el);
      await wait(HOLD_EMPTY);
      idx = (idx + 1) % terms.length;
    }
  }

  runLoop();
})();