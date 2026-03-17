/* ============================================================
   MAIN — js/main.js
   Handles: cursor, scroll progress, scroll reveal,
            card tilt, typing effect.
   Typing effect waits for the 'loaderDone' custom event.
   ============================================================ */

/* ── CUSTOM CURSOR ─────────────────────────────────────── */
const cursor = document.getElementById('cursor');
const trail  = document.getElementById('cursor-trail');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
  trail.style.left  = e.clientX + 'px';
  trail.style.top   = e.clientY + 'px';
});

document.querySelectorAll('a, button, .skill-card, .project-item').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

/* ── SCROLL PROGRESS BAR ───────────────────────────────── */
window.addEventListener('scroll', () => {
  const s = window.scrollY;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  document.getElementById('progress-bar').style.width = (s / h * 100) + '%';
});

/* ── SCROLL REVEAL ─────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('vis');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── 3D CARD TILT ──────────────────────────────────────── */
const cardWrap  = document.querySelector('.hero-3d-card');
const cardInner = document.querySelector('.card-inner');

if (cardWrap && cardInner) {
  cardWrap.addEventListener('mousemove', e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rx   = ((e.clientY - rect.top)  / rect.height - 0.5) * 20;
    const ry   = ((e.clientX - rect.left) / rect.width  - 0.5) * -20;
    cardInner.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  cardWrap.addEventListener('mouseleave', () => {
    cardInner.style.transform = 'perspective(1000px) rotateY(-10deg) rotateX(5deg)';
  });
}

/* ── TYPING EFFECT (fires after loader reveals page) ───── */
document.addEventListener('loaderDone', () => {
  const typed = document.querySelector('.hero-title');
  if (!typed) return;

  const original = 'Full Stack Developer';
  typed.textContent = '';
  let i = 0;

  setTimeout(() => {
    const iv = setInterval(() => {
      typed.textContent = '> ' + original.slice(0, i) + (i % 2 === 0 ? '█' : '');
      i++;
      if (i > original.length + 1) {
        typed.textContent = '> ' + original;
        clearInterval(iv);
      }
    }, 70);
  }, 800);
});

// ══ UPDATED MUSIC DEBUGGER ══
const playlist = [
    "/song1.mp3", 
    "/song2.mp3",
    "/song3.mp3"
];

let currentIndex = 0;
const bgm = new Audio();
bgm.volume = 0.3;
bgm.preload = "auto";

// 1. Function to attempt playback
async function playAudio() {
    try {
        bgm.src = playlist[currentIndex];
        await bgm.play();
        console.log("Success! Playing:", playlist[currentIndex]);
        
        // Remove listeners ONLY after successful playback
        cleanupListeners();
    } catch (err) {
        console.warn("Playback blocked. Use a click or tap.", err);
    }
}

// 2. Listener removal
function cleanupListeners() {
    ['click', 'touchstart', 'keydown', 'scroll'].forEach(ev => {
        window.removeEventListener(ev, playAudio);
    });
}

// 3. Attach listeners
['click', 'touchstart', 'keydown', 'scroll'].forEach(ev => {
    window.addEventListener(ev, playAudio, { once: false }); 
});

// 4. Handle song transitions
bgm.onended = () => {
    currentIndex = (currentIndex + 1) % playlist.length;
    playAudio();
};
