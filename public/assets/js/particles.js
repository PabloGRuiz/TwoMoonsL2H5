// ==========================================================================
// Cosmic Starfield & Embers Animation
// High-Performance canvas particle system (Zero Lag, Optimized 60fps)
// ==========================================================================

(function initCosmicParticles() {
  const canvas = document.getElementById('cosmic-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, 150);
  }, { passive: true });

  // Moderate particle count for silk-smooth performance
  const particleCount = Math.min(45, Math.floor((width * height) / 25000));
  const particles = [];

  const colors = [
    { r: 199, g: 125, b: 255 }, // Light Purple
    { r: 157, g: 78, b: 221 },  // Mid Purple
    { r: 255, g: 170, b: 0 },   // Solar Gold
    { r: 255, g: 119, b: 0 },   // Fiery Ember
    { r: 226, g: 232, b: 240 }  // Starlight Silver
  ];

  for (let i = 0; i < particleCount; i++) {
    const c = colors[Math.floor(Math.random() * colors.length)];
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.6,
      r: c.r,
      g: c.g,
      b: c.b,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      baseAlpha: Math.random() * 0.5 + 0.3,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: Math.random() * 0.02 + 0.01
    });
  }

  let isPageVisible = true;
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    if (isPageVisible) requestAnimationFrame(animate);
  });

  function animate() {
    if (!isPageVisible) return;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particleCount; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.phase += p.phaseSpeed;

      // Wrap around edges
      if (p.y < 0) {
        p.y = height + 5;
        p.x = Math.random() * width;
      }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      const alpha = p.baseAlpha + Math.sin(p.phase) * 0.2;
      const safeAlpha = alpha < 0.1 ? 0.1 : (alpha > 0.85 ? 0.85 : alpha);

      // Fast drawing without expensive shadowBlur
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${safeAlpha.toFixed(2)})`;
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
