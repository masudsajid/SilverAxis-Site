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

  // Rebuild star field
  const count = Math.floor((w * h) / 2600);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 0.5 + Math.random() * 1.4,
    speed: 0.08 + Math.random() * 0.35,
    alpha: 0.3 + Math.random() * 0.7,
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

  // base fill
  ctx.fillStyle = '#02030a';
  ctx.fillRect(0, 0, w, h);

  // subtle radial vignette
  const grad = ctx.createRadialGradient(
    w * 0.5,
    h * 0.2,
    0,
    w * 0.5,
    h * 0.5,
    Math.max(w, h) * 0.9,
  );
  grad.addColorStop(0, 'rgba(148,163,255,0.12)');
  grad.addColorStop(1, 'rgba(15,23,42,0.9)');
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
