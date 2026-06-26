/* ── script.js — CRETA EV ── */

/* ─── 1. Navbar scroll effect ─── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

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
const spinViewport = document.getElementById('spin-viewport');
const spinImg      = document.getElementById('spin-img');
const spinDial     = document.getElementById('spin-dial');
const dialPointer  = document.querySelector('.spin-dial-pointer');
const angleBadge   = document.getElementById('spin-angle-badge');
const indBtns      = document.querySelectorAll('.spin-ind-btn');
const scpSwatches  = document.querySelectorAll('.scp-swatch');

let currentAngle = 0; // Starts facing front
let isDragging = false;
let startX = 0;
let baseAngle = 0;
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
  
  let direction = 'FRONT';
  if (currentAngle >= 45 && currentAngle < 135) direction = 'LEFT PROFILE';
  else if (currentAngle >= 135 && currentAngle < 225) direction = 'REAR';
  else if (currentAngle >= 225 && currentAngle < 315) direction = 'RIGHT PROFILE';
  
  if (angleBadge) {
    angleBadge.textContent = `ANGLE: ${currentAngle}° (${direction})`;
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

// Viewport drag interactions
if (spinViewport) {
  spinViewport.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    baseAngle = currentAngle;
    spinViewport.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const sensitivity = 0.72;
    const deltaAngle = -dx * sensitivity;
    update360View(baseAngle + deltaAngle);
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      spinViewport.style.cursor = 'grab';
    }
  });

  // Touch Support
  spinViewport.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    baseAngle = currentAngle;
  }, { passive: true });

  spinViewport.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX;
    const sensitivity = 0.72;
    const deltaAngle = -dx * sensitivity;
    update360View(baseAngle + deltaAngle);
  }, { passive: true });

  spinViewport.addEventListener('touchend', () => {
    isDragging = false;
  });
}

// Dial controls rotation drag
if (spinDial) {
  let dialDragging = false;
  
  spinDial.addEventListener('mousedown', (e) => {
    dialDragging = true;
    e.preventDefault();
  });
  
  window.addEventListener('mousemove', (e) => {
    if (!dialDragging) return;
    const rect = spinDial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = angleRad * (180 / Math.PI) + 90;
    update360View(angleDeg);
  });
  
  window.addEventListener('mouseup', () => {
    dialDragging = false;
  });
  
  spinDial.addEventListener('touchstart', (e) => {
    dialDragging = true;
  }, { passive: true });
  
  spinDial.addEventListener('touchmove', (e) => {
    if (!dialDragging) return;
    const rect = spinDial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.touches[0].clientX - centerX;
    const dy = e.touches[0].clientY - centerY;
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = angleRad * (180 / Math.PI) + 90;
    update360View(angleDeg);
  }, { passive: true });
  
  spinDial.addEventListener('touchend', () => {
    dialDragging = false;
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
