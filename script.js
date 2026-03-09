/* ═══════════════════════════════════════════════════════════════
   BUS × BEUS Digital Photobook — script.js
   St.PageFlip integration · Responsive · Sparkles · Barcode
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────────
     1. SPARKLE FIELD
  ───────────────────────────────────────────── */
  (function initSparkles() {
    const field = document.getElementById('sparkleField');
    if (!field) return;
    const COUNT = 60;
    for (let i = 0; i < COUNT; i++) {
      const s = document.createElement('div');
      s.className = 'sparkle';
      const size = Math.random() * 3 + 1;
      s.style.cssText = `
        left:  ${Math.random() * 100}vw;
        top:   ${Math.random() * 100}vh;
        width: ${size}px;
        height: ${size}px;
        --dur:   ${(Math.random() * 4 + 2).toFixed(2)}s;
        --delay: ${(Math.random() * -6).toFixed(2)}s;
      `;
      field.appendChild(s);
    }
  })();

  /* ─────────────────────────────────────────────
     2. BARCODE GENERATOR (canvas)
  ───────────────────────────────────────────── */
  (function drawBarcode() {
    const canvas = document.getElementById('barcodeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const serial = 'BEUS-ANV-2024-001';
    let seed = 0;
    for (let i = 0; i < serial.length; i++) seed += serial.charCodeAt(i);

    function rand() {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      return (seed >>> 0) / 0xffffffff;
    }

    ctx.clearRect(0, 0, W, H);

    let x = 3;

    // Left guard bars
    ctx.fillStyle = 'rgba(248,184,208,0.9)';
    ctx.fillRect(x, 4, 1.5, H - 12); x += 2.5;
    ctx.fillRect(x, 4, 0.8, H - 12); x += 1.5;

    for (let i = 0; i < 55; i++) {
      const barW = rand() * 2.5 + 0.8;
      const barH = rand() > 0.3 ? H - 14 : H - 22;
      const alpha = 0.55 + rand() * 0.45;
      ctx.fillStyle = 'rgba(248,184,208,' + alpha.toFixed(2) + ')';
      ctx.fillRect(x, 4, barW, barH);
      x += barW + (rand() * 1.5 + 0.5);
      if (x > W - 8) break;
    }

    // Right guard bars
    ctx.fillStyle = 'rgba(248,184,208,0.9)';
    x = W - 6;
    ctx.fillRect(x, 4, 0.8, H - 12); x += 1.5;
    ctx.fillRect(x, 4, 1.5, H - 12);
  })();

  /* ─────────────────────────────────────────────
     3. RESPONSIVE DIMENSIONS
  ───────────────────────────────────────────── */
  function getBookDimensions() {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      const w = Math.min(window.innerWidth - 24, 400);
      const h = Math.round(window.innerHeight * 0.70);
      return { width: w, height: h, mode: 'portrait' };
    }
    return { width: 900, height: 600, mode: 'landscape' };
  }

  /* ─────────────────────────────────────────────
     4. STPAGEFLIP INIT
  ───────────────────────────────────────────── */
  const bookEl = document.getElementById('book-container');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const currentPageEl = document.getElementById('currentPage');
  const totalPagesEl  = document.getElementById('totalPages');

  let pageFlip = null;
  let dims = getBookDimensions();

  function buildPageFlip(d) {
    bookEl.style.width  = d.width  + 'px';
    bookEl.style.height = d.height + 'px';

    const isPortrait = d.mode === 'portrait';
    const singleW = isPortrait ? d.width : Math.floor(d.width / 2);

    pageFlip = new St.PageFlip(bookEl, {
      width:  singleW,
      height: d.height,
      size:   'fixed',
      maxShadowOpacity: 0.5,
      showCover: true,
      mobileScrollSupport: true,
      clickEventForward: true,
      usePortrait: isPortrait,
      startPage: 0,
      drawShadow: true,
      flippingTime: 900,
      useMouseEvents: true,
      swipeDistance: 30,
      showPageCorners: true,
      disableFlipByClick: false,
      autoSize: false,
    });

    pageFlip.loadFromHTML(document.querySelectorAll('.page'));

    const total = pageFlip.getPageCount();
    totalPagesEl.textContent = total;
    updateCounter();

    pageFlip.on('flip',        () => updateCounter());
    pageFlip.on('changeState', () => updateCounter());

    return pageFlip;
  }

  function updateCounter() {
    if (!pageFlip) return;
    const curr  = pageFlip.getCurrentPageIndex() + 1;
    const total = pageFlip.getPageCount();
    currentPageEl.textContent = curr;
    totalPagesEl.textContent  = total;
    prevBtn.disabled = (curr <= 1);
    nextBtn.disabled = (curr >= total);
  }

  pageFlip = buildPageFlip(dims);

  /* ─────────────────────────────────────────────
     5. NAV BUTTONS + KEYBOARD
  ───────────────────────────────────────────── */
  prevBtn.addEventListener('click', () => { if (pageFlip) pageFlip.flipPrev('top'); });
  nextBtn.addEventListener('click', () => { if (pageFlip) pageFlip.flipNext('top'); });

  document.addEventListener('keydown', (e) => {
    if (!pageFlip) return;
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   pageFlip.flipPrev();
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') pageFlip.flipNext();
  });

  /* ─────────────────────────────────────────────
     6. RESPONSIVE RESIZE
  ───────────────────────────────────────────── */
  let resizeTimer;
  let lastMode = dims.mode;

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newDims = getBookDimensions();
      if (newDims.mode !== lastMode) {
        lastMode = newDims.mode;
        dims = newDims;
        const savedPage = pageFlip ? pageFlip.getCurrentPageIndex() : 0;
        if (pageFlip) { pageFlip.destroy(); pageFlip = null; }
        pageFlip = buildPageFlip(dims);
        if (savedPage > 0 && pageFlip) pageFlip.turnToPage(savedPage);
        updateCounter();
      }
    }, 300);
  });

  /* ─────────────────────────────────────────────
     7. HOLOGRAPHIC TILT on photocards
  ───────────────────────────────────────────── */
  document.querySelectorAll('.sleeve-body').forEach(sleeve => {
    sleeve.addEventListener('mousemove', (e) => {
      const rect = sleeve.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top)  / rect.height;
      const rX = (y - 0.5) * -18;
      const rY = (x - 0.5) *  18;
      sleeve.style.transform = `perspective(400px) rotateX(${rX}deg) rotateY(${rY}deg) translateY(-4px)`;
      const ov = sleeve.querySelector('.holo-overlay');
      if (ov) {
        ov.style.background = `radial-gradient(circle at ${x*100}% ${y*100}%,
          rgba(255,255,255,0.9) 0%, rgba(255,182,193,0.6) 20%,
          rgba(200,220,255,0.5) 40%, rgba(200,255,220,0.4) 60%, transparent 80%)`;
        ov.style.opacity = '0.75';
      }
    });
    sleeve.addEventListener('mouseleave', () => {
      sleeve.style.transform = '';
      const ov = sleeve.querySelector('.holo-overlay');
      if (ov) ov.style.opacity = '0';
    });
  });

  /* ─────────────────────────────────────────────
     8. ENTRANCE FADE
  ───────────────────────────────────────────── */
  const scene = document.querySelector('.book-scene');
  scene.style.opacity = '0';
  setTimeout(() => {
    scene.style.transition = 'opacity 0.8s ease';
    scene.style.opacity = '1';
  }, 120);

});