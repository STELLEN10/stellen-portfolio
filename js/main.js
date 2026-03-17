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

// ══ FIXED MUSIC SYSTEM ══
const playlist = [
    "./Pitfall(MP3_160K).mp3", // Added ./ to ensure it looks in the root folder
    "./17. Bryant Barnes - Last Year.mp3",
    "./Love Me(M4A_128K).m4a"
];

let currentIndex = 0;
const bgm = new Audio();
bgm.volume = 0.5; // Bumped up to 0.5 so you can definitely hear it

async function playAudio() {
    // Only try to play if the source isn't already set or playing
    if (!bgm.src || bgm.paused) {
        try {
            // Re-assign src only if it's empty to prevent restarting the same song
            if (!bgm.src.includes(playlist[currentIndex])) {
                bgm.src = playlist[currentIndex];
            }
            
            await bgm.play();
            console.log("🔊 Playing:", playlist[currentIndex]);
            
            // Success! Remove the listeners so they don't fire again
            cleanupListeners();
        } catch (err) {
            // This will log if the user hasn't interacted "enough" yet
            console.warn("Interaction needed for audio.");
        }
    }
}

function cleanupListeners() {
    ['click', 'touchstart', 'keydown', 'scroll'].forEach(ev => {
        window.removeEventListener(ev, playAudio);
    });
}

// Attach listeners
['click', 'touchstart', 'keydown', 'scroll'].forEach(ev => {
    window.addEventListener(ev, playAudio);
});

// Next song logic
bgm.onended = () => {
    currentIndex = (currentIndex + 1) % playlist.length;
    bgm.src = playlist[currentIndex];
    bgm.play();
};
