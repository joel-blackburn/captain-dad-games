/* Captain Dad Games: the live low-poly 3D game shelf on the home page.
   Needs Three.js r128 (global THREE). Falls back to the still picture if WebGL isn't available. */
(function () {
  'use strict';
  var hero = document.querySelector('.hero');
  var stage = document.querySelector('.hero-stage');
  if (!hero || !stage || !window.THREE) return;
  var test = document.createElement('canvas');
  if (!(test.getContext('webgl') || test.getContext('experimental-webgl'))) return;

  var T = THREE;
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var C = { gold: '#ffc90a', red: '#ff4d4d', sky: '#33c3ff', orange: '#ff8a3d', purple: '#8a5cf6' };
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function rr(a, b) { return a + rnd() * (b - a); }
  function M(c, o) { var p = { color: c, flatShading: true, roughness: .85, metalness: 0 }; for (var k in o) p[k] = o[k]; return new T.MeshStandardMaterial(p); }
  function mesh(g, m, sh) { var x = new T.Mesh(g, m); x.castShadow = sh !== false; x.receiveShadow = true; return x; }

  var renderer;
  try { renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  var canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  stage.appendChild(canvas);

  var scene = new T.Scene();
  var cam = new T.PerspectiveCamera(34, 1, .1, 800);

  /* sky */
  (function () {
    var c = document.createElement('canvas'); c.width = 4; c.height = 512; var x = c.getContext('2d');
    var g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#2fb4f5'); g.addColorStop(.75, '#c9f1ff'); g.addColorStop(1, '#c9f1ff');
    x.fillStyle = g; x.fillRect(0, 0, 4, 512); scene.background = new T.CanvasTexture(c);
  })();
  scene.fog = new T.Fog('#c9f1ff', 90, 300);

  /* lights */
  scene.add(new T.HemisphereLight('#e6f7ff', '#6c9a5a', .75));
  var sun = new T.DirectionalLight('#fff4dc', 1.05); sun.position.set(-30, 50, 35); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  var sc = sun.shadow.camera; sc.left = -30; sc.right = 30; sc.top = 30; sc.bottom = -30; sc.far = 200; sun.shadow.bias = -.0008;
  scene.add(sun);

  /* hills */
  function groundY(x, z) { return Math.sin(x * .045) * 3 + Math.cos(z * .06 + x * .02) * 3.5 + Math.sin(x * .11 + z * .09) * 1.2 + Math.max(0, -z - 60) * .09 - 17; }
  (function () {
    var g = new T.PlaneGeometry(420, 320, 60, 45); g.rotateX(-Math.PI / 2);
    var p = g.attributes.position;
    for (var i = 0; i < p.count; i++) p.setY(i, groundY(p.getX(i), p.getZ(i)) + rr(-.5, .5));
    var ng = g.toNonIndexed(), q = ng.attributes.position, col = [], greens = ['#86cc62', '#7cc45a', '#8ed368', '#78c057'];
    for (i = 0; i < q.count; i += 3) { var c = new T.Color(greens[Math.floor(rnd() * greens.length)]); for (var k = 0; k < 3; k++) col.push(c.r, c.g, c.b); }
    ng.setAttribute('color', new T.Float32BufferAttribute(col, 3)); ng.computeVertexNormals();
    var m = mesh(ng, M('#ffffff', { vertexColors: true }), false); scene.add(m);
  })();

  function tree(x, y, z, s) {
    var t = new T.Group(), tr = mesh(new T.CylinderGeometry(.18 * s, .25 * s, 1.4 * s, 6), M('#8a5a3c')); tr.position.y = .7 * s; t.add(tr);
    var top = mesh(new T.IcosahedronGeometry(1.1 * s, 0), M(rnd() < .5 ? '#4caf50' : '#66c25a')); top.position.y = 2 * s; top.rotation.set(rnd(), rnd(), rnd()); t.add(top);
    t.position.set(x, y, z); scene.add(t); return t;
  }
  function pine(x, y, z, s) {
    var t = new T.Group(), tr = mesh(new T.CylinderGeometry(.15 * s, .2 * s, .8 * s, 6), M('#7a4e33')); tr.position.y = .4 * s; t.add(tr);
    for (var k = 0; k < 2; k++) { var c = mesh(new T.ConeGeometry((1.1 - k * .3) * s, 1.5 * s, 7), M('#2f9e5b')); c.position.y = (1.3 + k * .8) * s; t.add(c); }
    t.position.set(x, y, z); scene.add(t); return t;
  }
  for (var i = 0; i < 70; i++) { var tx = rr(-150, 150), tz = rr(-190, -30); (rnd() < .5 ? tree : pine)(tx, groundY(tx, tz), tz, rr(1.4, 2.6)); }

  var clouds = [];
  function cloud(x, y, z, s) {
    var g = new T.Group(), m = M('#ffffff', { roughness: 1, emissive: '#dfefff', emissiveIntensity: .35 });
    for (var k = 0; k < 5; k++) { var b = mesh(new T.IcosahedronGeometry(rr(.9, 1.5) * s, 0), m, false); b.position.set((k - 2) * 1.1 * s, rr(-.2, .5) * s, rr(-.4, .4) * s); b.scale.y = .75; b.rotation.set(rnd(), rnd(), rnd()); g.add(b); }
    g.position.set(x, y, z); g.userData.speed = rr(.25, .6); scene.add(g); clouds.push(g);
  }
  cloud(-26, 17, -60, 1.6); cloud(30, 20, -100, 2.8); cloud(45, 12, -50, 1.8); cloud(-60, 10, -70, 2.4); cloud(8, 13, -40, 1.4); cloud(70, 16, -80, 2);

  var spinners = [];
  function sym(type, color, x, y, z, s, rot) {
    var g = new T.Group(), m = M(color, { roughness: .5 });
    function bar(w, h) { return mesh(new T.BoxGeometry(w * s, h * s, .55 * s), m); }
    if (type === '+') { g.add(bar(2, .6)); g.add(bar(.6, 2)); }
    if (type === 'x') { var a = bar(2.1, .6), b = bar(2.1, .6); a.rotation.z = Math.PI / 4; b.rotation.z = -Math.PI / 4; g.add(a, b); }
    if (type === '/') { g.add(bar(2, .5)); [-1, 1].forEach(function (d) { var o = mesh(new T.IcosahedronGeometry(.36 * s, 0), m); o.position.y = d * .75 * s; g.add(o); }); }
    if (type === '=') { var e1 = bar(2, .5), e2 = bar(2, .5); e1.position.y = .42 * s; e2.position.y = -.42 * s; g.add(e1, e2); }
    g.position.set(x, y, z); g.rotation.set(rot[0], rot[1], rot[2]); g.userData.base = y; g.userData.ph = rnd() * 6; scene.add(g); spinners.push(g); return g;
  }
  function gem(x, y, z, s, color) {
    var m = mesh(new T.OctahedronGeometry(s, 0), M(color, { roughness: .3, metalness: .1 })); m.scale.y = 1.35;
    m.position.set(x, y, z); m.userData.base = y; m.userData.ph = rnd() * 6; m.userData.star = true; scene.add(m); spinners.push(m); return m;
  }
  function star(x, y, z, s) {
    var sh = new T.Shape();
    for (var i = 0; i < 10; i++) { var r = i % 2 ? .45 : 1, a = i / 10 * Math.PI * 2 + Math.PI / 2, px = Math.cos(a) * r * s, py = Math.sin(a) * r * s; if (i) sh.lineTo(px, py); else sh.moveTo(px, py); }
    var g = new T.ExtrudeGeometry(sh, { depth: .35 * s, bevelEnabled: true, bevelThickness: .18 * s, bevelSize: .12 * s, bevelSegments: 1 }); g.center();
    var m = mesh(g, M(C.gold, { roughness: .35, metalness: .15 })); m.position.set(x, y, z); m.userData.base = y; m.userData.ph = rnd() * 6; m.userData.star = true;
    scene.add(m); spinners.push(m); return m;
  }

  /* floating island = the game shelf */
  var island = new T.Group(); island.position.set(7, 0, 0); scene.add(island);
  (function () {
    var len = 17;
    var top = mesh(new T.BoxGeometry(len, .8, 5, 10, 1, 3), M('#7cc45a')); top.position.y = -.4; island.add(top);
    var edge = mesh(new T.BoxGeometry(len + .3, .35, 5.3), M('#5fae46')); edge.position.y = -.65; island.add(edge);
    var dirtM = M('#b9875a'), rockM = M('#9c6f49');
    var slab = mesh(new T.BoxGeometry(len, 1.4, 4.6), dirtM); slab.position.y = -1.5; island.add(slab);
    for (var i = 0; i < Math.round(len / 1.3); i++) {
      var x = -len / 2 + .7 + i * 1.3, f = 1 - Math.abs(x) / (len / 2) * .55;
      var d = mesh(new T.DodecahedronGeometry(rr(1.1, 1.6), 0), i % 2 ? dirtM : rockM); d.scale.set(1, rr(1.1, 1.6) * f, 1); d.rotation.set(rnd(), rnd(), rnd()); d.position.set(x, -2.4 - f * rr(.3, 1), rr(-1.2, 1.2)); island.add(d);
    }
    for (i = 0; i < Math.round(len / 3); i++) {
      var x2 = -len / 2 + 2 + i * 3 + rr(-.5, .5), r = mesh(new T.DodecahedronGeometry(rr(.8, 1.2), 0), rockM); r.scale.y = 1.4; r.rotation.set(rnd(), rnd(), rnd()); r.position.set(x2 * .8, -4.3, rr(-.6, .6)); island.add(r);
    }
    var t1 = tree(0, 0, 0, .9); scene.remove(t1); t1.position.set(-8.2, 0, -1.4); island.add(t1);
    var p1 = pine(0, 0, 0, .9); scene.remove(p1); p1.position.set(8.6, 0, -1.3); island.add(p1);
  })();

  /* game boxes */
  function loadImg(src) { return new Promise(function (res) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { res(null); }; i.src = src; }); }
  function face(kind, img) {
    var c = document.createElement('canvas'); c.width = c.height = 1024; var x = c.getContext('2d');
    if (kind === 'ss') { if (img) x.drawImage(img, 0, 0, 1024, 1024); else { x.fillStyle = '#ff4f8b'; x.fillRect(0, 0, 1024, 1024); } }
    else if (kind === 'grim') {
      if (img) x.drawImage(img, 0, 0, 1024, 1024); else { x.fillStyle = '#5c43ac'; x.fillRect(0, 0, 1024, 1024); }
    } else {
      var pal = kind === 'm1' ? ['#8a5cf6', '#5b3fd1'] : ['#19c3b1', '#0f8f86'];
      var rg = x.createRadialGradient(512, 450, 100, 512, 512, 700); rg.addColorStop(0, pal[0]); rg.addColorStop(1, pal[1]); x.fillStyle = rg; x.fillRect(0, 0, 1024, 1024);
      x.strokeStyle = 'rgba(255,255,255,.14)'; x.lineWidth = 40; for (var i = -1024; i < 1024; i += 140) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 1024, 1024); x.stroke(); }
      x.fillStyle = '#fff3e0'; x.font = '800 620px "Baloo 2", Nunito, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 36; x.strokeStyle = '#0b2a5b'; x.lineJoin = 'round';
      x.strokeText('?', 512, 560); x.fillText('?', 512, 560);
      x.font = '800 64px Nunito, sans-serif'; x.textBaseline = 'alphabetic'; x.fillStyle = '#ffc90a'; x.fillText('SECRET GAME', 512, 960);
    }
    var t = new T.CanvasTexture(c); t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return t;
  }
  function gameBox(tex, side) {
    var w = 3, h = 3, r = .42, s = new T.Shape();
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    var g = new T.ExtrudeGeometry(s, { depth: .7, bevelEnabled: true, bevelThickness: .12, bevelSize: .1, bevelSegments: 2, curveSegments: 5 }); g.translate(0, 0, -.35);
    tex.repeat.set(1 / w, 1 / h); tex.offset.set(.5, .5);
    var m = new T.Mesh(g, [new T.MeshStandardMaterial({ map: tex, roughness: .55 }), M(side, { roughness: .5 })]); m.castShadow = true; m.receiveShadow = true;
    var grp = new T.Group(), inner = new T.Group(); inner.add(m);
    var foot = mesh(new T.BoxGeometry(2.2, .25, 1.2), M(side)); foot.position.y = -h / 2 - .1; inner.add(foot);
    grp.add(inner); grp.userData.inner = inner; return grp;
  }
  var boxes = [];
  var GAMES = [
    { kind: 'ss', side: '#ff4f8b', href: '/sum-shredders/', label: 'Sum Shredders' },
    { kind: 'grim', side: '#123d4a', soon: 'The Curse of Captain Grimtide is coming soon!' },
    { kind: 'm1', side: '#5b3fd1', soon: 'A secret game! Find all 5 hidden gold coins for a clue.', href: '/secrets/' },
    { kind: 'm2', side: '#0f8f86', soon: 'Another secret game is being built in Captain Dad’s workshop.' }
  ];

  /* layout: keep the boxes clear of the words */
  var LOOK = new T.Vector3(7.5, 1.2, 0);
  var DIR = new T.Vector3(-.03, .1, 1).normalize();
  var EXT = [new T.Vector3(-1.6, 3.2, 0), new T.Vector3(15.8, 3.2, 0), new T.Vector3(7.5, 4.6, 0), new T.Vector3(7.5, -5.2, 0), new T.Vector3(-1.4, -.6, 2.6), new T.Vector3(15.6, -.6, 2.6)];
  var EXT_N = [new T.Vector3(-.6, 3.4, 0), new T.Vector3(14.8, 3.4, 0), new T.Vector3(7.5, 4.4, 0), new T.Vector3(7.5, -3.2, 0)];
  var W = 1, H = 1, wide = true;
  function project(v) { var p = v.clone().project(cam); return { x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H }; }
  function layout() {
    var r = stage.getBoundingClientRect(); W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    renderer.setSize(W, H, false); cam.aspect = W / H;
    wide = window.innerWidth >= 880;
    var left = 16, right = W - 16;
    if (wide) { var cp = document.querySelector('.hero-copy').getBoundingClientRect(); left = Math.min(W * .62, cp.right - r.left + 36); right = W - 28; }
    var availW = Math.max(200, right - left), availH = H * (wide ? .78 : .9);
    cam.clearViewOffset(); cam.updateProjectionMatrix();
    function place(d) { cam.position.copy(LOOK).addScaledVector(DIR, d); cam.lookAt(LOOK); cam.updateMatrixWorld(); }
    var d = 30; place(d);
    var PTS = wide ? EXT : EXT_N;
    var xs = PTS.map(project), minX = Math.min.apply(0, xs.map(function (p) { return p.x; })), maxX = Math.max.apply(0, xs.map(function (p) { return p.x; }));
    var minY = Math.min.apply(0, xs.map(function (p) { return p.y; })), maxY = Math.max.apply(0, xs.map(function (p) { return p.y; }));
    d = d * Math.max((maxX - minX) / availW, (maxY - minY) / availH); d = Math.max(16, Math.min(d, 90)); place(d);
    xs = PTS.map(project);
    minX = Math.min.apply(0, xs.map(function (p) { return p.x; })); maxX = Math.max.apply(0, xs.map(function (p) { return p.x; }));
    minY = Math.min.apply(0, xs.map(function (p) { return p.y; })); maxY = Math.max.apply(0, xs.map(function (p) { return p.y; }));
    var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, tx = (left + right) / 2, ty = H * (wide ? .56 : .52);
    cam.setViewOffset(W, H, cx - tx, cy - ty, W, H); cam.updateProjectionMatrix();
    draw();
  }

  /* hover + click */
  var ray = new T.Raycaster(), mouse = new T.Vector2(), hovered = null;
  function pick(e) {
    var r = canvas.getBoundingClientRect(); mouse.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, cam); var hit = ray.intersectObjects(boxes, true)[0]; if (!hit) return null;
    var o = hit.object; while (o && boxes.indexOf(o) < 0) o = o.parent; return o;
  }
  canvas.addEventListener('pointermove', function (e) { var b = pick(e); if (b !== hovered) { hovered = b; canvas.style.cursor = b ? 'pointer' : 'default'; if (REDUCED) draw(); } });
  canvas.addEventListener('pointerleave', function () { hovered = null; canvas.style.cursor = 'default'; if (REDUCED) draw(); });
  canvas.addEventListener('click', function (e) {
    var b = pick(e); if (!b) return; var g = b.userData.game;
    if (g.href && !g.soon) { location.href = g.href; return; }
    if (window.cdgToast) window.cdgToast(g.soon);
    if (g.href) setTimeout(function () { location.href = g.href; }, 1400);
  });

  /* animate */
  var t0 = performance.now(), running = false, visible = true;
  function draw() {
    var t = (performance.now() - t0) / 1000;
    if (!REDUCED) {
      island.position.y = Math.sin(t * .7) * .18;
      boxes.forEach(function (b, i) {
        var inner = b.userData.inner, lift = b === hovered ? .55 : 0;
        inner.position.y += ((Math.sin(t * 1.6 + i * 1.3) * .08 + lift) - inner.position.y) * .15;
        var sc = b === hovered ? 1.07 : 1; inner.scale.x += (sc - inner.scale.x) * .15; inner.scale.y = inner.scale.z = inner.scale.x;
      });
      clouds.forEach(function (c) { c.position.x += c.userData.speed * .016; if (c.position.x > 110) c.position.x = -110; });
      spinners.forEach(function (s) { s.position.y = s.userData.base + Math.sin(t * 1.1 + s.userData.ph) * .35; s.rotation.y += s.userData.star ? .012 : .006; });
    } else {
      boxes.forEach(function (b) { var inner = b.userData.inner; inner.position.y = b === hovered ? .45 : 0; });
    }
    renderer.render(scene, cam);
  }
  function loop() { if (!running) return; draw(); requestAnimationFrame(loop); }
  function setRunning(on) { on = on && !REDUCED && visible && !document.hidden; if (on && !running) { running = true; requestAnimationFrame(loop); } else if (!on) running = false; }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; setRunning(true); }).observe(hero);
  document.addEventListener('visibilitychange', function () { setRunning(true); });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });

  Promise.all([
    document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 60px "Baloo 2"'), document.fonts.load('800 60px Nunito')]).catch(function () {}) : Promise.resolve(),
    loadImg('/assets/img/ss_icon.jpg?v=3'), loadImg('/assets/img/grim_box.jpg?v=3')
  ]).then(function (res) {
    var imgs = { ss: res[1], grim: res[2] };
    GAMES.forEach(function (g, i) {
      var b = gameBox(face(g.kind, imgs[g.kind]), g.side);
      b.position.set(-6 + i * 4.05, 1.72, 0); b.rotation.y = [.12, .02, -.02, .06][i];
      if (i === 0) { b.position.y += .2; b.position.z += .4; b.rotation.z = .04; b.scale.setScalar(1.12); }
      b.userData.game = g; island.add(b); boxes.push(b);
    });
    sym('+', C.gold, -4, 7.5, -6, 1, [.2, .4, .3]); sym('x', C.red, 20, 8.5, -8, 1, [.3, -.5, .2]); sym('=', C.purple, 12, 9.2, -6, .85, [.1, .2, -.2]); sym('/', C.orange, 1, 0, -2, .8, [.2, -.6, .1]);
    gem(-2.5, 4.5, -1, .9, C.sky); gem(17.5, 5.5, -2, .7, '#ff4f8b');
    layout();
    hero.classList.add('live');
    var still = stage.querySelector('picture'); if (still) still.style.display = 'none';
    setRunning(true);
  });
})();
