/* ============================================================
   LOADER — js/loader.js
   Controls the S-draw animation, fake progress bar, and
   the final reveal transition into the main page.
   ============================================================ */

(function () {

  /* ── BUILD LOADER HTML DYNAMICALLY ─────────────────────── */
  const loader = document.getElementById('loader');

  /* Floating background particles */
  const particlesDiv = document.createElement('div');
  particlesDiv.className = 'loader-particles';
  const colors = ['#00f5ff', '#9b5de5', '#f72585', '#ffffff'];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'lp';
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      box-shadow: 0 0 ${size * 3}px ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration:${6 + Math.random() * 10}s;
      animation-delay:${Math.random() * 5}s;
      opacity:0;
    `;
    particlesDiv.appendChild(p);
  }
  loader.appendChild(particlesDiv);

  /* Corner brackets */
  const cornersDiv = document.createElement('div');
  cornersDiv.className = 'loader-corners';
  cornersDiv.innerHTML = `
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>
  `;
  loader.appendChild(cornersDiv);

  /* Scan line */
  const scan = document.createElement('div');
  scan.className = 'loader-scan';
  loader.appendChild(scan);

  /* ── S LETTER SVG ─────────────────────────────────────── */
  const letterDiv = document.createElement('div');
  letterDiv.className = 'loader-letter';
  letterDiv.innerHTML = `
    <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#00f5ff"/>
          <stop offset="50%"  stop-color="#9b5de5"/>
          <stop offset="100%" stop-color="#f72585"/>
        </linearGradient>
      </defs>
      <!-- S path: smooth bezier curve forming an S shape -->
      <path class="s-path" d="
        M 75,25
        C 75,10 55,5 45,10
        C 30,17 25,30 35,42
        C 42,50 60,54 68,63
        C 80,76 75,95 60,105
        C 48,113 28,112 22,100
      "/>
    </svg>
    <div class="s-orbit"><div class="s-orbit-dot"></div></div>
    <div class="s-orbit2"><div class="s-orbit-dot2"></div></div>
  `;
  loader.appendChild(letterDiv);

  /* Tagline */
  const tagline = document.createElement('div');
  tagline.className = 'loader-text';
  tagline.textContent = 'Stellen · Full Stack Developer';
  loader.appendChild(tagline);

  /* Progress wrap */
  const progressWrap = document.createElement('div');
  progressWrap.className = 'loader-progress-wrap';
  progressWrap.innerHTML = `
    <div class="loader-progress-track">
      <div class="loader-progress-fill" id="loader-fill"></div>
    </div>
    <div class="loader-percent" id="loader-pct">0%</div>
  `;
  loader.appendChild(progressWrap);

  /* Status text */
  const status = document.createElement('div');
  status.className = 'loader-status';
  status.id = 'loader-status';
  loader.appendChild(status);

  /* ── PROGRESS SIMULATION ───────────────────────────────── */
  const fill = document.getElementById('loader-fill');
  const pct  = document.getElementById('loader-pct');
  const stat = document.getElementById('loader-status');

  const steps = [
    { target: 20, delay: 200,  label: 'Initialising environment...' },
    { target: 40, delay: 600,  label: 'Loading 3D scenes...' },
    { target: 60, delay: 400,  label: 'Building components...' },
    { target: 80, delay: 500,  label: 'Preparing animations...' },
    { target: 95, delay: 400,  label: 'Almost ready...' },
    { target: 100, delay: 300, label: 'Launching portfolio' },
  ];

  let current = 0;
  let progress = 0;

  /* Wait for S to finish drawing (≈2.1s) then start bar */
  setTimeout(() => {
    runStep(0);
  }, 2200);

  function runStep(i) {
    if (i >= steps.length) return;
    const step = steps[i];

    setTimeout(() => {
      stat.textContent = step.label;
      animateTo(step.target, () => runStep(i + 1));
    }, step.delay);
  }

  function animateTo(target, cb) {
    const interval = setInterval(() => {
      progress++;
      fill.style.width = progress + '%';
      pct.textContent  = progress + '%';
      if (progress >= target) {
        clearInterval(interval);
        if (progress >= 100) {
          setTimeout(reveal, 400);
        } else {
          cb && cb();
        }
      }
    }, 18);
  }

  /* ── PAGE REVEAL ──────────────────────────────────────── */
  function reveal() {
    stat.textContent = '✓ Ready';

    /* Flash the S glow */
    const path = loader.querySelector('.s-path');
    if (path) {
      path.style.filter = 'drop-shadow(0 0 30px #00f5ff) drop-shadow(0 0 60px rgba(0,245,255,0.9))';
      path.style.transition = 'filter 0.2s ease';
    }

    setTimeout(() => {
      /* Slide the loader up off screen */
      loader.style.transition = 'transform 0.9s cubic-bezier(0.7,0,0.3,1), opacity 0.6s ease';
      loader.style.transform  = 'translateY(-100%)';
      loader.style.opacity    = '0';

      setTimeout(() => {
        loader.classList.add('hidden');
        /* Fire an event so main.js can start page animations */
        document.dispatchEvent(new CustomEvent('loaderDone'));
      }, 900);
    }, 500);
  }

})();
