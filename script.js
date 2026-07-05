/* ============================================================
   Nakul Patel — portfolio.ide
   Tabs · terminal · command palette · easter eggs
   ============================================================ */

'use strict';

/* ---------- file registry ---------- */
const FILES = {
  'README.md':       { badge: 'fb-md',   badgeText: 'M↓',  lang: 'Markdown',   hint: 'home' },
  'about.md':        { badge: 'fb-md',   badgeText: 'M↓',  lang: 'Markdown',   hint: 'about me' },
  'experience.json': { badge: 'fb-json', badgeText: '{ }', lang: 'JSON',       hint: 'work history' },
  'projects.js':     { badge: 'fb-js',   badgeText: 'JS',  lang: 'JavaScript', hint: 'my builds' },
  'skills.js':       { badge: 'fb-js',   badgeText: 'JS',  lang: 'JavaScript', hint: 'the stack' },
  'contact.sh':      { badge: 'fb-sh',   badgeText: '$_',  lang: 'Shell',      hint: 'get in touch' },
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const tabbar = $('#tabbar');
const breadcrumbs = $('#breadcrumbs');
const editorArea = $('#editor-area');

let openTabs = [];
let activeFile = null;

/* ============================================================
   TABS & FILE VIEWS
   ============================================================ */
function renderTabs() {
  tabbar.innerHTML = '';
  openTabs.forEach((name) => {
    const tab = document.createElement('button');
    tab.className = 'tab' + (name === activeFile ? ' active' : '');
    tab.setAttribute('role', 'tab');
    tab.innerHTML =
      `<span class="file-badge ${FILES[name].badge}">${FILES[name].badgeText}</span>` +
      `<span>${name}</span><span class="tab-close" title="Close">×</span>`;
    tab.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-close')) {
        closeFile(name);
      } else {
        activateFile(name);
      }
    });
    tabbar.appendChild(tab);
  });
}

function activateFile(name) {
  if (!FILES[name]) return;
  activeFile = name;
  $$('.file-view').forEach((v) => v.classList.toggle('active', v.dataset.file === name));
  $$('.tree-item').forEach((t) => t.classList.toggle('active', t.dataset.open === name));
  breadcrumbs.innerHTML = `nakul-patel <span class="crumb-sep">›</span> ${name}`;
  $('#sb-lang').textContent = FILES[name].lang;
  $('#sb-pos').textContent = 'Ln 1, Col 1';
  editorArea.scrollTop = 0;
  renderTabs();
}

function openFile(name) {
  if (!FILES[name]) return;
  if (!openTabs.includes(name)) openTabs.push(name);
  activateFile(name);
  closeSidebarOnMobile();
}

function closeFile(name) {
  const idx = openTabs.indexOf(name);
  if (idx === -1) return;
  openTabs.splice(idx, 1);
  if (openTabs.length === 0) {
    // never leave the editor empty — README is the fallback
    openTabs = ['README.md'];
    activateFile('README.md');
    return;
  }
  if (activeFile === name) {
    activateFile(openTabs[Math.max(0, idx - 1)]);
  } else {
    renderTabs();
  }
}

/* wire explorer + any [data-open-file] buttons */
$$('.tree-item[data-open]').forEach((item) =>
  item.addEventListener('click', () => openFile(item.dataset.open))
);
$$('.tree-item[data-external]').forEach((item) =>
  item.addEventListener('click', () => window.open(item.dataset.external, '_blank'))
);
$$('[data-open-file]').forEach((btn) =>
  btn.addEventListener('click', () => openFile(btn.dataset.openFile))
);

/* fake cursor position that wanders as you scroll */
editorArea.addEventListener('scroll', () => {
  const ln = Math.max(1, Math.round(editorArea.scrollTop / 28) + 1);
  $('#sb-pos').textContent = `Ln ${ln}, Col ${1 + (ln * 7) % 40}`;
});

/* ============================================================
   TYPEWRITER
   ============================================================ */
const ROLES = ['Software Developer', 'ML Engineer', 'Data Scientist', 'Creative Technologist'];
const twEl = $('#typewriter');
let twRole = 0, twChar = 0, twDeleting = false;

function typeLoop() {
  const word = ROLES[twRole];
  twChar += twDeleting ? -1 : 1;
  twEl.textContent = word.slice(0, twChar);
  let delay = twDeleting ? 40 : 85;
  if (!twDeleting && twChar === word.length) {
    delay = 1800;
    twDeleting = true;
  } else if (twDeleting && twChar === 0) {
    twDeleting = false;
    twRole = (twRole + 1) % ROLES.length;
    delay = 350;
  }
  setTimeout(typeLoop, delay);
}
typeLoop();

/* ============================================================
   SIDEBAR / HAMBURGER / ACTIVITY BAR
   ============================================================ */
const sidebar = $('#sidebar');
const isMobile = () => window.matchMedia('(max-width: 840px)').matches;

function toggleSidebar() {
  if (isMobile()) {
    sidebar.classList.toggle('open');
  } else {
    sidebar.classList.toggle('hidden');
  }
}
function closeSidebarOnMobile() {
  if (isMobile()) sidebar.classList.remove('open');
}

$('#hamburger').addEventListener('click', toggleSidebar);

/* menubar + activity bar commands */
const COMMANDS = {
  sidebar: toggleSidebar,
  palette: () => openPalette(),
  terminal: () => toggleTerminal(),
  'open-experience': () => openFile('experience.json'),
  'open-contact': () => openFile('contact.sh'),
  'run-contact': () => { openFile('contact.sh'); runContactScript(); },
  help: () => { toggleTerminal(true); termEcho('help'); runCommand('help'); },
  spin: (btn) => {
    btn.classList.remove('spinning');
    void btn.offsetWidth; // restart the animation
    btn.classList.add('spinning');
    termPrint('settings: already purple. no changes needed. 💜', 'term-dim');
  },
};
$$('[data-cmd]').forEach((btn) =>
  btn.addEventListener('click', () => COMMANDS[btn.dataset.cmd]?.(btn))
);

/* ============================================================
   GALLERY
   ============================================================ */
const GALLERY = [
  { src: './assets/about/about-1.JPG',  label: 'Cousins & Friends — Garba' },
  { src: './assets/about/about-2.JPG',  label: 'Waterloo Friends — Blue Mountain' },
  { src: './assets/about/about-3.JPG',  label: 'High School — Alex & Ryan' },
  { src: './assets/about/about-12.JPG', label: 'Waterloo Friends — Intramural Champions' },
  { src: './assets/about/about-13.JPG', label: 'Cousins — Escape Room' },
  { src: './assets/about/about-14.JPG', label: 'Brothers — Punta Cana' },
  { src: './assets/about/about-15.JPG', label: 'Me & Kajan — 21 Columbia Street' },
];
let galIdx = 0;
const galDots = $('#gal-dots');

GALLERY.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'gal-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Photo ${i + 1}`);
  dot.addEventListener('click', () => showSlide(i));
  galDots.appendChild(dot);
});

function showSlide(i) {
  galIdx = (i + GALLERY.length) % GALLERY.length;
  const slide = GALLERY[galIdx];
  $('#gal-img').src = slide.src;
  $('#gal-img').alt = slide.label;
  $('#gal-label').innerHTML = slide.label.replace('&', '&amp;');
  $('#gal-path').textContent = slide.src.replace('./', '');
  $$('.gal-dot').forEach((d, j) => d.classList.toggle('active', j === galIdx));
}
$('.gal-prev').addEventListener('click', () => showSlide(galIdx - 1));
$('.gal-next').addEventListener('click', () => showSlide(galIdx + 1));

/* swipe support */
let touchX = null;
$('#gallery').addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
$('#gallery').addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) showSlide(galIdx + (dx < 0 ? 1 : -1));
  touchX = null;
}, { passive: true });

/* ============================================================
   SKILLS — hover echo
   ============================================================ */
const skillEcho = $('#skill-echo');
$$('.chip').forEach((chip) => {
  chip.addEventListener('mouseenter', () => {
    skillEcho.textContent = `'${chip.textContent}: loaded ✓'`;
  });
});

/* ============================================================
   CONTACT.SH — run animation
   ============================================================ */
let contactRunning = false;
function runContactScript() {
  if (contactRunning) return;
  contactRunning = true;
  const out = $('#shell-output');
  out.innerHTML = '';
  const lines = [
    { text: '$ bash contact.sh', cls: '' },
    { text: 'status: open to internships & new-grad roles', cls: 'out-ok' },
    { text: 'opening mail client…', cls: '' },
  ];
  lines.forEach((line, i) => {
    setTimeout(() => {
      const div = document.createElement('div');
      div.className = 'out-line ' + line.cls;
      div.textContent = line.text;
      out.appendChild(div);
      if (i === lines.length - 1) {
        setTimeout(() => {
          window.location.href = 'mailto:nakul0306@gmail.com';
          contactRunning = false;
        }, 500);
      }
    }, 450 * (i + 1));
  });
}
$('#run-contact').addEventListener('click', runContactScript);

/* ============================================================
   TERMINAL
   ============================================================ */
const terminal = $('#terminal');
const termScroll = $('#term-scroll');
const termInput = $('#term-input');
const termHistory = [];
let histIdx = -1;

function toggleTerminal(forceOpen) {
  const open = forceOpen === true || terminal.classList.contains('collapsed');
  terminal.classList.toggle('collapsed', !open);
  if (open) setTimeout(() => termInput.focus(), 260);
}

$('#term-head').addEventListener('click', (e) => {
  if (e.target.id === 'term-toggle' || e.target.closest('#term-toggle')) return;
  toggleTerminal(true);
});
$('#term-toggle').addEventListener('click', (e) => {
  e.stopPropagation();
  toggleTerminal();
});
$('#term-body')?.addEventListener('click', (e) => {
  if (window.getSelection().toString() === '') termInput.focus();
});

function termPrint(text, cls = '') {
  toggleTerminal(true);
  const div = document.createElement('div');
  div.className = 'term-line ' + cls;
  div.textContent = text;
  termScroll.appendChild(div);
  termScroll.scrollTop = termScroll.scrollHeight;
}
function termPrintHTML(html, cls = '') {
  const div = document.createElement('div');
  div.className = 'term-line ' + cls;
  div.innerHTML = html;
  termScroll.appendChild(div);
  termScroll.scrollTop = termScroll.scrollHeight;
}
function termEcho(cmd) {
  termPrintHTML(
    `<span class="term-hi">nakul@portfolio</span><span class="term-dim">:~$</span> ${escapeHTML(cmd)}`
  );
}
function escapeHTML(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const NEOFETCH = String.raw`
   ███╗   ██╗    nakul@portfolio
   ████╗  ██║    ---------------
   ██╔██╗ ██║    OS:       PortfolioOS (Purple Dark)
   ██║╚██╗██║    Host:     Wilfrid Laurier University
   ██║ ╚████║    Kernel:   CS + BBA dual degree
   ╚═╝  ╚═══╝    Uptime:   5+ years coding
                 Shell:    nakul-sh 2.0
                 Theme:    purple on dark grey
                 Status:   hireable=true`;

const TERM_COMMANDS = {
  help() {
    termPrintHTML(
      [
        'available commands:',
        '  <span class="term-hi">ls</span>            list portfolio files',
        '  <span class="term-hi">open &lt;file&gt;</span>   open a file (e.g. open projects.js)',
        '  <span class="term-hi">whoami</span>        quick intro',
        '  <span class="term-hi">neofetch</span>      system info, portfolio edition',
        '  <span class="term-hi">contact</span>       ways to reach me',
        '  <span class="term-hi">resume</span>        open resume.pdf',
        '  <span class="term-hi">clear</span>         clear the terminal',
        '  <span class="term-hi">sudo hire-me</span>  ...try it',
      ].join('\n'),
      'term-dim'
    );
  },
  ls() {
    termPrintHTML(
      Object.keys(FILES).map((f) => `<span class="term-hi">${f}</span>`).join('  ') +
      '  <span class="term-dim">resume.pdf</span>'
    );
  },
  pwd() { termPrint('/home/nakul/portfolio'); },
  whoami() {
    termPrint('Nakul Patel — CS + BBA @ Wilfrid Laurier University.');
    termPrint('Software developer, ML engineer & data scientist. Open to internships.', 'term-dim');
  },
  neofetch() { termPrint(NEOFETCH, 'term-ascii'); },
  contact() {
    termPrintHTML('email:    <a href="mailto:nakul0306@gmail.com">nakul0306@gmail.com</a>');
    termPrintHTML('linkedin: <a href="https://www.linkedin.com/in/nakulpatel0306/" target="_blank" rel="noopener">linkedin.com/in/nakulpatel0306</a>');
    termPrintHTML('github:   <a href="https://github.com/nakulpatel0306" target="_blank" rel="noopener">github.com/nakulpatel0306</a>');
  },
  resume() {
    termPrint('opening resume.pdf…', 'term-dim');
    window.open('./assets/nakul-patel-software-resume.pdf', '_blank');
  },
  clear() { termScroll.innerHTML = ''; },
  date() { termPrint(new Date().toString()); },
  echo(args) { termPrint(args.join(' ')); },
  coffee() { termPrint('☕ brewing… done. productivity +20%.', 'term-ok'); },
  theme() { termPrint("current theme: 'Purple Dark' — it's not a phase, mom.", 'term-dim'); },
  exit() { termPrint('nice try. this terminal is load-bearing.', 'term-err'); },
  open(args) {
    const file = args[0];
    if (!file) return termPrint('usage: open <file>', 'term-err');
    if (file === 'resume.pdf') return TERM_COMMANDS.resume();
    if (FILES[file]) {
      openFile(file);
      termPrint(`opened ${file} ✓`, 'term-ok');
    } else {
      termPrint(`open: ${file}: no such file`, 'term-err');
    }
  },
  cat(args) { TERM_COMMANDS.open(args); },
  sudo(args) {
    if (args.join(' ').replace(/\s+/g, ' ').trim() === 'hire-me') {
      termPrint('[sudo] permission granted — excellent decision.', 'term-ok');
      termPrint('deploying confetti…', 'term-dim');
      confettiBurst();
      setTimeout(() => openFile('contact.sh'), 900);
    } else {
      termPrint('nakul is not in the sudoers file. this incident will be reported. (to no one)', 'term-err');
    }
  },
};

function runCommand(raw) {
  const input = raw.trim();
  if (!input) return;
  const [cmd, ...args] = input.split(/\s+/);
  const fn = TERM_COMMANDS[cmd.toLowerCase()];
  if (fn) {
    fn(args);
  } else {
    termPrintHTML(`command not found: ${escapeHTML(cmd)} — try <span class="term-hi">help</span>`, 'term-err');
  }
}

termInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const value = termInput.value;
    termEcho(value);
    if (value.trim()) {
      termHistory.push(value);
      histIdx = termHistory.length;
    }
    runCommand(value);
    termInput.value = '';
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (histIdx > 0) termInput.value = termHistory[--histIdx] || '';
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (histIdx < termHistory.length) termInput.value = termHistory[++histIdx] || '';
  }
});

/* ============================================================
   COMMAND PALETTE (Ctrl+P)
   ============================================================ */
const paletteOverlay = $('#palette-overlay');
const paletteInput = $('#palette-input');
const paletteList = $('#palette-list');
let paletteSel = 0;

function paletteEntries(query) {
  const q = query.trim().toLowerCase();
  return Object.keys(FILES).filter((f) => f.toLowerCase().includes(q) || FILES[f].hint.includes(q));
}

function renderPalette() {
  const entries = paletteEntries(paletteInput.value);
  paletteSel = Math.min(paletteSel, Math.max(0, entries.length - 1));
  paletteList.innerHTML = '';
  if (entries.length === 0) {
    paletteList.innerHTML = '<li class="palette-empty">no files match — try "projects"</li>';
    return;
  }
  entries.forEach((name, i) => {
    const li = document.createElement('li');
    li.className = 'palette-item' + (i === paletteSel ? ' selected' : '');
    li.innerHTML =
      `<span class="file-badge ${FILES[name].badge}">${FILES[name].badgeText}</span>` +
      `<span>${name}</span><span class="pi-hint">${FILES[name].hint}</span>`;
    li.addEventListener('click', () => { openFile(name); closePalette(); });
    li.addEventListener('mousemove', () => { paletteSel = i; renderPalette(); });
    paletteList.appendChild(li);
  });
}

function openPalette() {
  paletteOverlay.hidden = false;
  paletteInput.value = '';
  paletteSel = 0;
  renderPalette();
  paletteInput.focus();
}
function closePalette() { paletteOverlay.hidden = true; }

paletteInput.addEventListener('input', () => { paletteSel = 0; renderPalette(); });
paletteInput.addEventListener('keydown', (e) => {
  const entries = paletteEntries(paletteInput.value);
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    paletteSel = Math.min(paletteSel + 1, entries.length - 1);
    renderPalette();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    paletteSel = Math.max(paletteSel - 1, 0);
    renderPalette();
  } else if (e.key === 'Enter' && entries[paletteSel]) {
    openFile(entries[paletteSel]);
    closePalette();
  } else if (e.key === 'Escape') {
    closePalette();
  }
});
paletteOverlay.addEventListener('click', (e) => {
  if (e.target === paletteOverlay) closePalette();
});

/* global shortcuts */
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'k')) {
    e.preventDefault();
    paletteOverlay.hidden ? openPalette() : closePalette();
  } else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
    e.preventDefault();
    toggleTerminal();
  } else if (e.key === 'Escape' && !paletteOverlay.hidden) {
    closePalette();
  }
});

/* ============================================================
   CONFETTI
   ============================================================ */
const CONFETTI_COLORS = ['#a78bfa', '#c4b5fd', '#7c3aed', '#e9d5ff', '#6d5bb8', '#f0abfc'];
function confettiBurst() {
  for (let i = 0; i < 120; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.animationDuration = 2.2 + Math.random() * 2.2 + 's';
    piece.style.animationDelay = Math.random() * 0.6 + 's';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

/* ============================================================
   BOOT
   ============================================================ */
openFile('README.md');
