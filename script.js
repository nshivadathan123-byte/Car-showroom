/* ─── 1. Hero Random Car Showcase ─── */
const heroCarImg = document.getElementById('hero-car-img');
if (heroCarImg) {
  const heroColors = [
    'ocean-blue',
    'abyss-black',
    'fiery-red',
    'robust-emerald-matte',
    'atlas-white',
    'titan-grey',
    'starry-night',
    'knight-black-matte'
  ];
  const heroFrames = [11, 12, 13, 14];

  const randomColor = heroColors[Math.floor(Math.random() * heroColors.length)];
  const randomFrame = heroFrames[Math.floor(Math.random() * heroFrames.length)];

  heroCarImg.src = `https://www.hyundai.com/content/dam/hyundai/in/en/data/find-a-car/creta-electric/360/${randomColor}/pc/${randomColor}_${randomFrame}.png`;
  heroCarImg.alt = `CRETA EV (${randomColor})`;
}

/* ─── 2. Gallery tabs ─── */
const tabBtns = document.querySelectorAll('.tab-btn');
const panels  = document.querySelectorAll('.gallery-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const target = document.getElementById('panel-' + btn.dataset.tab);
    if (target) target.classList.add('active');
  });
});

/* ─── 3. Gallery image fallback ─── */
const fallbackColors = {
  front: '#1a3a5c',
  side:  '#0d1b2a',
  rear:  '#1a1a1a',
};
document.querySelectorAll('.gallery-single-wrap img').forEach(img => {
  img.addEventListener('error', function () {
    const panel = this.closest('.gallery-panel');
    const key   = panel ? panel.id.replace('panel-', '') : 'front';
    const color = fallbackColors[key] || '#1a3a5c';
    this.parentElement.style.background = color;
    this.style.display = 'none';
  });
});

/* ─── 4. 360° Spin System (36-Frame Hyundai Engine) ─── */
const spinImg      = document.getElementById('spin-img');
const spinDial     = document.getElementById('spin-dial');
const dialPointer  = document.querySelector('.spin-dial-pointer');
const indBtns      = document.querySelectorAll('.spin-ind-btn');
const scpSwatches  = document.querySelectorAll('.scp-swatch');

let currentAngle = 0; // Starts facing front
let activeColorFolder = 'ocean-blue';

const preloadCache = {};
function preloadImagesForFolder(folder) {
  if (preloadCache[folder]) return;
  preloadCache[folder] = [];
  for (let i = 0; i < 36; i++) {
    const img = new Image();
    img.src = `https://www.hyundai.com/content/dam/hyundai/in/en/data/find-a-car/creta-electric/360/${folder}/pc/${folder}_${i}.png`;
    preloadCache[folder].push(img);
  }
}

// Start preloading default color immediately
preloadImagesForFolder('ocean-blue');

function update360View(angle) {
  currentAngle = (Math.round(angle) % 360 + 360) % 360;
  
  if (dialPointer) {
    dialPointer.style.transform = `translateX(-50%) rotate(${currentAngle}deg)`;
  }
  
  const frameNumber = (Math.floor(currentAngle / 10) + 9) % 36;
  const finalImgSrc = `https://www.hyundai.com/content/dam/hyundai/in/en/data/find-a-car/creta-electric/360/${activeColorFolder}/pc/${activeColorFolder}_${frameNumber}.png`;
  
  if (spinImg && spinImg.src !== finalImgSrc) {
    spinImg.src = finalImgSrc;
  }
  
  
  const closestAngle = Math.round(currentAngle / 90) * 90 % 360;
  indBtns.forEach(btn => {
    const btnAngle = parseInt(btn.dataset.angle, 10);
    btn.classList.toggle('active', btnAngle === closestAngle);
  });
}

// Initialize on page load
update360View(0);

// Swatches selector
scpSwatches.forEach(swatch => {
  swatch.addEventListener('click', () => {
    scpSwatches.forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    activeColorFolder = swatch.dataset.folder;
    preloadImagesForFolder(activeColorFolder);
    update360View(currentAngle);
  });
});

// Click Quick Jump buttons
indBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetAngle = parseInt(btn.dataset.angle, 10);
    update360View(targetAngle);
  });
});

// Dial controls rotation drag & scroll locking
if (spinDial) {
  let dialDragging = false;
  let isDialLocked = false;

  function lockScroll() {
    isDialLocked = true;
    spinDial.classList.add('dial-active');
    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('scroll-locked');
  }

  function unlockScroll() {
    if (!isDialLocked) return;
    isDialLocked = false;
    spinDial.classList.remove('dial-active');
    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');
  }

  function rotateDialToPoint(clientX, clientY) {
    const rect = spinDial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = angleRad * (180 / Math.PI) + 90;
    update360View(angleDeg);
  }

  // Mouse interactions
  spinDial.addEventListener('mousedown', (e) => {
    dialDragging = true;
    lockScroll();
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!dialDragging) return;
    rotateDialToPoint(e.clientX, e.clientY);
  });

  window.addEventListener('mouseup', () => {
    dialDragging = false;
  });

  // Touch interactions
  spinDial.addEventListener('touchstart', (e) => {
    dialDragging = true;
    lockScroll();
  }, { passive: true });

  spinDial.addEventListener('touchmove', (e) => {
    if (!dialDragging) return;
    e.preventDefault();
    if (e.touches && e.touches[0]) {
      rotateDialToPoint(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  spinDial.addEventListener('touchend', () => {
    dialDragging = false;
  });

  // Lock entire window scrolling while dial is active
  window.addEventListener('touchmove', (e) => {
    if (isDialLocked) {
      e.preventDefault();
    }
  }, { passive: false });

  // Unlock scroll when pressing anything outside the dial
  document.addEventListener('touchstart', (e) => {
    if (!spinDial.contains(e.target)) {
      unlockScroll();
    }
  }, { passive: true });

  document.addEventListener('mousedown', (e) => {
    if (!spinDial.contains(e.target)) {
      unlockScroll();
    }
  });
}


/* ─── 5. Hamburger menu (mobile) ─── */
const hamburger = document.getElementById('nav-hamburger');
const navLinks  = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}

/* ─── 6. Anchor link handling (auto-closes mobile navbar) ─── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    if (navLinks && window.innerWidth <= 768) {
      navLinks.classList.remove('active');
    }
  });
});
