// Background starfield
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

let stars = [];
let raf = 0;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const { innerWidth: w, innerHeight: h } = window;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.floor((w * h) / 2600);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 0.6 + Math.random() * 1.6,
    speed: 0.06 + Math.random() * 0.32,
    alpha: 0.3 + Math.random() * 0.6,
    twinkleOffset: Math.random() * Math.PI * 2,
  }));
}

window.addEventListener('resize', resize, { passive: true });
resize();

let lastTime = performance.now();

function tick(now = performance.now()) {
  const dt = Math.min(now - lastTime, 50);
  lastTime = now;

  const { innerWidth: w, innerHeight: h } = window;

  ctx.fillStyle = '#02030a';
  ctx.fillRect(0, 0, w, h);

  const grad = ctx.createRadialGradient(
    w * 0.5,
    h * 0.2,
    0,
    w * 0.5,
    h * 0.55,
    Math.max(w, h) * 0.9,
  );
  grad.addColorStop(0, 'rgba(148,163,255,0.18)');
  grad.addColorStop(1, 'rgba(15,23,42,0.96)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const t = now * 0.001;

  for (const s of stars) {
    s.y += s.speed * dt;
    if (s.y > h + 10) {
      s.y = -10;
      s.x = Math.random() * w;
    }

    const twinkle = 0.65 + 0.35 * Math.sin(t * 2 + s.twinkleOffset);
    ctx.beginPath();
    ctx.fillStyle = `rgba(209, 213, 219, ${s.alpha * twinkle})`;
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  raf = requestAnimationFrame(tick);
}

if (!prefersReducedMotion) {
  tick();
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  } else if (!prefersReducedMotion && !raf) {
    lastTime = performance.now();
    tick();
  }
});

// Smooth scrolling for in-page links (for older browsers)
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href')?.slice(1);
    const target = targetId && document.getElementById(targetId);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

// Contact form (front-end only)
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');

if (form && statusEl) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !email || !message) {
      statusEl.textContent = 'Please fill in the required fields.';
      statusEl.style.color = '#fecaca';
      return;
    }

    statusEl.textContent =
      'Thank you. Your message has been captured. Please ensure an email channel is configured to receive these details.';
    statusEl.style.color = '#bbf7d0';
    form.reset();
  });
}
