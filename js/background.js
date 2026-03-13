/* ============================================================
   3D BACKGROUNDS — js/background.js
   Five distinct Three.js scenes that auto-rotate every 2 mins.
   Exposed: window.switchBG(index)
   ============================================================ */

(function () {

  const canvas   = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const NAMES = [
    'Particle Galaxy',
    'Neural Web',
    'Geometry Storm',
    'Data Matrix',
    'Cosmic Nebula',
  ];

  let currentScene = 0;
  let transitioning = false;
  let t = 0;
  let mouseX = 0, mouseY = 0;
  const scenes = [];

  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function makeCamera(z) {
    const c = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    c.position.z = z || 30;
    return c;
  }

  /* ── SCENE 1 · PARTICLE GALAXY ─────────────────────────── */
  (function () {
    const scene = new THREE.Scene();
    const camera = makeCamera(30);

    const N = 3000;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const pal = [
      new THREE.Color('#00f5ff'),
      new THREE.Color('#9b5de5'),
      new THREE.Color('#f72585'),
      new THREE.Color('#ffffff'),
    ];
    for (let i = 0; i < N; i++) {
      const r  = 20 + Math.random() * 35;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.4;
      pos[i * 3 + 2] = r * Math.cos(ph);
      const c = pal[~~(Math.random() * 4)];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.7 }));
    scene.add(pts);

    /* Spiral arms */
    const ap = [];
    for (let i = 0; i < 1500; i++) {
      const a = i * 0.025, r = a * 0.9;
      ap.push(Math.cos(a) * r, (Math.random() - 0.5) * 1.5, Math.sin(a) * r);
      ap.push(Math.cos(a + Math.PI) * r, (Math.random() - 0.5) * 1.5, Math.sin(a + Math.PI) * r);
    }
    const ag = new THREE.BufferGeometry();
    ag.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ap), 3));
    scene.add(new THREE.Points(ag, new THREE.PointsMaterial({ size: 0.08, color: 0x00f5ff, transparent: true, opacity: 0.35 })));

    scenes.push({
      scene, camera,
      update(ti, mx, my) {
        pts.rotation.y = ti * 0.05;
        camera.position.x += (mx * 4 - camera.position.x) * 0.03;
        camera.position.y += (-my * 4 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);
      },
    });
  })();

  /* ── SCENE 2 · NEURAL WEB ──────────────────────────────── */
  (function () {
    const scene  = new THREE.Scene();
    const camera = makeCamera(30);
    const NC     = 80;
    const nodes  = [];
    const meshes = [];

    for (let i = 0; i < NC; i++) {
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 20 - 10;
      nodes.push({ x, y, z, vx: (Math.random() - 0.5) * 0.04, vy: (Math.random() - 0.5) * 0.04 });
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.6 })
      );
      m.position.set(x, y, z);
      scene.add(m);
      meshes.push(m);
    }

    const lineGroup = new THREE.Group();
    scene.add(lineGroup);
    let frame = 0;

    scenes.push({
      scene, camera,
      update(ti, mx, my) {
        frame++;
        for (let i = 0; i < NC; i++) {
          nodes[i].x += nodes[i].vx;
          nodes[i].y += nodes[i].vy;
          if (Math.abs(nodes[i].x) > 30) nodes[i].vx *= -1;
          if (Math.abs(nodes[i].y) > 20) nodes[i].vy *= -1;
          meshes[i].position.set(nodes[i].x, nodes[i].y, nodes[i].z);
        }
        if (frame % 4 === 0) {
          while (lineGroup.children.length) lineGroup.remove(lineGroup.children[0]);
          for (let i = 0; i < NC; i++) {
            for (let j = i + 1; j < NC; j++) {
              const dx = nodes[i].x - nodes[j].x;
              const dy = nodes[i].y - nodes[j].y;
              const d  = Math.sqrt(dx * dx + dy * dy);
              if (d < 12) {
                const g = new THREE.BufferGeometry().setFromPoints([
                  new THREE.Vector3(nodes[i].x, nodes[i].y, nodes[i].z),
                  new THREE.Vector3(nodes[j].x, nodes[j].y, nodes[j].z),
                ]);
                lineGroup.add(new THREE.Line(g, new THREE.LineBasicMaterial({
                  color: Math.random() > 0.5 ? 0x9b5de5 : 0x00f5ff,
                  transparent: true,
                  opacity: (1 - d / 12) * 0.3,
                })));
              }
            }
          }
        }
        camera.position.x += (mx * 3 - camera.position.x) * 0.03;
        camera.position.y += (-my * 3 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);
      },
    });
  })();

  /* ── SCENE 3 · GEOMETRY STORM ──────────────────────────── */
  (function () {
    const scene  = new THREE.Scene();
    const camera = makeCamera(40);
    const objs   = [];

    [
      [new THREE.TorusKnotGeometry(7, 1.4, 120, 16),      0x00f5ff, [15, 0, -5]],
      [new THREE.TorusKnotGeometry(5, 1, 80, 12, 3, 5),   0x9b5de5, [-18, 4, -12]],
      [new THREE.IcosahedronGeometry(5, 1),                0xf72585, [-4, -14, -4]],
      [new THREE.OctahedronGeometry(4, 0),                 0xffd60a, [10, -10, -8]],
      [new THREE.TorusGeometry(6, 1, 16, 60),              0x00c8ff, [-14, 10, -6]],
    ].forEach(([g, c, p]) => {
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: 0.07 }));
      m.position.set(...p);
      scene.add(m);
      objs.push(m);
    });

    const N = 1500, pArr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pArr[i * 3]     = (Math.random() - 0.5) * 100;
      pArr[i * 3 + 1] = (Math.random() - 0.5) * 80;
      pArr[i * 3 + 2] = (Math.random() - 0.5) * 40 - 20;
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
    scene.add(new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.1, color: 0x9b5de5, transparent: true, opacity: 0.4 })));

    scenes.push({
      scene, camera,
      update(ti, mx, my) {
        objs[0].rotation.x = ti * 0.3;  objs[0].rotation.y = ti * 0.2;
        objs[1].rotation.x = -ti * 0.2; objs[1].rotation.z = ti * 0.15;
        objs[2].rotation.x = ti * 0.4;  objs[2].rotation.y = ti * 0.3;
        objs[3].rotation.y = ti * 0.5;  objs[3].rotation.z = ti * 0.2;
        objs[4].rotation.x = ti * 0.1;  objs[4].rotation.y = ti * 0.25;
        camera.position.x += (mx * 4 - camera.position.x) * 0.03;
        camera.position.y += (-my * 4 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);
      },
    });
  })();

  /* ── SCENE 4 · DATA MATRIX ─────────────────────────────── */
  (function () {
    const scene  = new THREE.Scene();
    const camera = makeCamera(35);
    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    const cubes = [];
    const G = 8;

    for (let x = -G; x <= G; x += 2) {
      for (let y = -G; y <= G; y += 2) {
        const col = Math.random() > 0.7 ? 0x00f5ff : Math.random() > 0.5 ? 0x9b5de5 : 0x050508;
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshBasicMaterial({ color: col, wireframe: col === 0x050508, transparent: true, opacity: col === 0x050508 ? 0.02 : 0.15 })
        );
        m.position.set(x, y, (Math.random() - 0.5) * 10);
        cubeGroup.add(m);
        cubes.push({ m, ph: Math.random() * Math.PI * 2, sp: 0.5 + Math.random() });
      }
    }

    for (let x = -G; x <= G; x += 4) {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, -30, 0), new THREE.Vector3(x, 30, 0)]);
      scene.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.04 })));
    }
    for (let y = -G; y <= G; y += 4) {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-40, y, 0), new THREE.Vector3(40, y, 0)]);
      scene.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x9b5de5, transparent: true, opacity: 0.04 })));
    }

    scenes.push({
      scene, camera,
      update(ti, mx, my) {
        cubes.forEach(c => {
          c.m.position.z = Math.sin(ti * c.sp + c.ph) * 5;
          c.m.rotation.x = ti * 0.3;
          c.m.rotation.y = ti * 0.2;
        });
        cubeGroup.rotation.z = ti * 0.02;
        camera.position.x += (mx * 3 - camera.position.x) * 0.03;
        camera.position.y += (-my * 3 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);
      },
    });
  })();

  /* ── SCENE 5 · COSMIC NEBULA ───────────────────────────── */
  (function () {
    const scene  = new THREE.Scene();
    const camera = makeCamera(35);

    [25, 18, 12].forEach((r, i) => {
      const colors = [0x00f5ff, 0x9b5de5, 0xf72585];
      scene.add(new THREE.Mesh(
        new THREE.SphereGeometry(r, 32, 32),
        new THREE.MeshBasicMaterial({ color: colors[i], wireframe: true, transparent: true, opacity: 0.02 + i * 0.01 })
      ));
    });

    const clouds = [];

    [[0x00f5ff, 1], [0x9b5de5, -1], [0xf72585, 0.5]].forEach(([col, dir]) => {
      const N2 = 800, pos = new Float32Array(N2 * 3);
      for (let i = 0; i < N2; i++) {
        const r  = 8 + Math.random() * 15;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        pos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
        pos[i * 3 + 2] = r * Math.cos(ph);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.18, color: col, transparent: true, opacity: 0.5 }));
      scene.add(pts);
      clouds.push({ obj: pts, dir, ring: false });
    });

    [5, 8, 11, 14].forEach((r, i) => {
      const colors = [0x00f5ff, 0x9b5de5, 0xf72585, 0xffd60a];
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.06, 4, 80),
        new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.15 })
      );
      m.rotation.x = Math.PI / 2 + i * 0.3;
      m.rotation.z = i * 0.5;
      scene.add(m);
      clouds.push({ obj: m, dir: i % 2 === 0 ? 1 : -1, ring: true, sp: 0.2 + i * 0.1 });
    });

    scenes.push({
      scene, camera,
      update(ti, mx, my) {
        clouds.forEach(c => {
          if (c.ring) { c.obj.rotation.y = ti * c.sp * c.dir; }
          else { c.obj.rotation.y = ti * 0.06 * c.dir; c.obj.rotation.x = ti * 0.03; }
        });
        camera.position.x += (mx * 3 - camera.position.x) * 0.02;
        camera.position.y += (-my * 3 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);
      },
    });
  })();

  /* ── RENDER LOOP ───────────────────────────────────────── */
  (function loop() {
    requestAnimationFrame(loop);
    t += 0.005;
    const s = scenes[currentScene];
    s.update(t, mouseX, mouseY);
    renderer.render(s.scene, s.camera);
  })();

  /* ── PUBLIC: SWITCH SCENE ──────────────────────────────── */
  window.switchBG = function (idx) {
    if (transitioning || idx === currentScene) return;
    transitioning = true;

    const ov = document.getElementById('bg-transition');
    ov.classList.add('fading');

    setTimeout(() => {
      currentScene = idx;
      document.querySelectorAll('.bg-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
      document.getElementById('bg-label').textContent = `Scene ${idx + 1} / 5 — ${NAMES[idx]}`;
      scenes[idx].camera.aspect = window.innerWidth / window.innerHeight;
      scenes[idx].camera.updateProjectionMatrix();
      ov.classList.remove('fading');
      setTimeout(() => { transitioning = false; }, 400);
    }, 800);
  };

  /* ── AUTO-ROTATE every 2 minutes ──────────────────────── */
  setInterval(() => { window.switchBG((currentScene + 1) % 5); }, 120000);

  /* Set initial label */
  document.getElementById('bg-label').textContent = `Scene 1 / 5 — ${NAMES[0]}`;

  /* ── RESIZE ────────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    scenes.forEach(s => {
      s.camera.aspect = window.innerWidth / window.innerHeight;
      s.camera.updateProjectionMatrix();
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

})();
