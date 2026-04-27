import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ── Scroll reveal: IO + sync pass so above-the-fold blocks are not stuck at opacity 0 ── */
function setupReveal() {
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('revealed');
      });
    },
    { threshold: 0, rootMargin: '0px 0px 8% 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));

  function revealInView() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll('.reveal').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) el.classList.add('revealed');
    });
  }
  requestAnimationFrame(revealInView);
  window.addEventListener('load', revealInView, { once: true });
}

setupReveal();

/* ── Mat WebGL ── */
function readCanvasSize(container) {
  const r = container.getBoundingClientRect();
  const w = Math.floor(r.width);
  const h = Math.floor(r.height);
  return { w: Math.max(2, w), h: Math.max(2, h) };
}

function showCanvasError(container, message) {
  if (container.querySelector('.webgl-fallback')) return;
  const el = document.createElement('p');
  el.className = 'webgl-fallback';
  el.textContent = message;
  container.appendChild(el);
}

const VIEW_PRESET_STORAGE_KEY = 'magnamat-view-preset';

function loadViewPreset() {
  try {
    const raw = localStorage.getItem(VIEW_PRESET_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (
      p &&
      p.v === 1 &&
      typeof p.distance === 'number' &&
      typeof p.polarDeg === 'number' &&
      typeof p.azimuthDeg === 'number' &&
      Array.isArray(p.target) &&
      p.target.length === 3 &&
      p.mat &&
      typeof p.mat.x === 'number' &&
      typeof p.mat.y === 'number' &&
      typeof p.mat.z === 'number'
    ) {
      return p;
    }
  } catch (_) {}
  return null;
}

function captureViewPreset(camera, controls, matGroup) {
  const t = controls.target;
  const off = camera.position.clone().sub(t);
  const s = new THREE.Spherical().setFromVector3(off);
  return {
    v: 1,
    distance: s.radius,
    polarDeg: THREE.MathUtils.radToDeg(s.phi),
    azimuthDeg: THREE.MathUtils.radToDeg(s.theta),
    target: [t.x, t.y, t.z],
    mat: {
      order: matGroup.rotation.order || 'YXZ',
      x: matGroup.rotation.x,
      y: matGroup.rotation.y,
      z: matGroup.rotation.z,
    },
  };
}

function formatPresetAsMainSnippet(p) {
  const f = (n) => Number(n).toFixed(6);
  return [
    '// Locked 3D view — replace the camera + matGroup.rotation block in startScene()',
    `const CAM_DISTANCE = ${f(p.distance)};`,
    `const CAM_POLAR_DEG = ${f(p.polarDeg)};`,
    `const CAM_AZIMUTH_DEG = ${f(p.azimuthDeg)};`,
    `const orbitTarget = new THREE.Vector3(${f(p.target[0])}, ${f(p.target[1])}, ${f(p.target[2])});`,
    'controls.target.copy(orbitTarget);',
    'const camSph = new THREE.Spherical(',
    '  CAM_DISTANCE,',
    '  THREE.MathUtils.degToRad(CAM_POLAR_DEG),',
    '  THREE.MathUtils.degToRad(CAM_AZIMUTH_DEG)',
    ');',
    'camera.position.setFromSpherical(camSph).add(orbitTarget);',
    'camera.lookAt(orbitTarget);',
    'controls.update();',
    '',
    `matGroup.rotation.order = '${p.mat.order}';`,
    `matGroup.rotation.x = ${f(p.mat.x)};`,
    `matGroup.rotation.y = ${f(p.mat.y)};`,
    `matGroup.rotation.z = ${f(p.mat.z)};`,
    '',
    '// Then remove loadViewPreset() branch if you no longer want localStorage to override.',
  ].join('\n');
}

function installViewTuner(container, ctx) {
  if (new URLSearchParams(window.location.search).get('adjust') !== '1') return;

  const { camera, controls, matGroup } = ctx;
  const wrap = document.createElement('div');
  wrap.className = 'view-tuner-panel';
  wrap.style.cssText =
    'position:absolute;left:8px;right:8px;bottom:8px;z-index:6;max-height:46%;overflow:auto;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,0.96);border:1px solid rgba(0,0,0,0.1);font:12px/1.45 system-ui,-apple-system,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,0.12);color:#141414;';

  const title = document.createElement('div');
  title.textContent = '3D view lock-in (?adjust=1)';
  title.style.cssText = 'font-weight:600;margin-bottom:8px;font-size:13px;';

  const hint = document.createElement('p');
  hint.style.cssText = 'margin:0 0 10px;color:#555;font-size:11px;line-height:1.45;';
  hint.textContent =
    'Orbit the mat with the mouse. Save stores this browser’s default until cleared. Copy gives code to paste into main.mjs for the repo. Remove ?adjust=1 from the URL to hide this panel.';

  const readout = document.createElement('pre');
  readout.style.cssText =
    'margin:0 0 10px;padding:8px 10px;background:#f4f4f2;border-radius:8px;font-size:10px;overflow-x:auto;white-space:pre-wrap;word-break:break-all;';

  function refreshReadout() {
    const p = captureViewPreset(camera, controls, matGroup);
    readout.textContent = `distance ${p.distance.toFixed(3)} · polar° ${p.polarDeg.toFixed(2)} · azimuth° ${p.azimuthDeg.toFixed(2)}\ntarget [${p.target.map((n) => n.toFixed(4)).join(', ')}]\nmat rad x ${p.mat.x.toFixed(4)} y ${p.mat.y.toFixed(4)} z ${p.mat.z.toFixed(4)}`;
  }

  function btn(label, primary) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.style.cssText = primary
      ? 'margin:0 8px 8px 0;padding:8px 14px;border-radius:8px;border:none;background:#E5342A;color:#fff;font-weight:600;cursor:pointer;font-size:12px;'
      : 'margin:0 8px 8px 0;padding:8px 14px;border-radius:8px;border:1px solid #ccc;background:#fff;cursor:pointer;font-size:12px;';
    return b;
  }

  const bSave = btn('Save as locked default', true);
  bSave.addEventListener('click', () => {
    const p = captureViewPreset(camera, controls, matGroup);
    localStorage.setItem(VIEW_PRESET_STORAGE_KEY, JSON.stringify(p));
    bSave.textContent = 'Saved ✓';
    setTimeout(() => {
      bSave.textContent = 'Save as locked default';
    }, 1600);
    console.info('[magnamat] View saved to localStorage. Reload the page (you can drop ?adjust=1) to confirm.');
  });

  const bCopy = btn('Copy main.mjs snippet', false);
  bCopy.addEventListener('click', async () => {
    const text = formatPresetAsMainSnippet(captureViewPreset(camera, controls, matGroup));
    try {
      await navigator.clipboard.writeText(text);
      bCopy.textContent = 'Copied ✓';
      setTimeout(() => {
        bCopy.textContent = 'Copy main.mjs snippet';
      }, 1400);
    } catch {
      console.log(text);
      alert('Copy failed — snippet printed to console.');
    }
  });

  const bClear = btn('Clear saved lock', false);
  bClear.addEventListener('click', () => {
    localStorage.removeItem(VIEW_PRESET_STORAGE_KEY);
    window.location.reload();
  });

  wrap.append(title, hint, readout, bSave, bCopy, bClear);
  container.appendChild(wrap);

  controls.addEventListener('change', refreshReadout);
  refreshReadout();
}

function startScene(container, canvas) {
  let { w: W, h: H } = readCanvasSize(container);
  if (W < 32 || H < 32) {
    W = Math.max(W, 640);
    H = Math.max(H, 400);
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true,
      powerPreference: 'high-performance',
    });
  } catch (e) {
    console.error(e);
    showCanvasError(container, 'WebGL is not available in this browser or device.');
    return;
  }

  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(W, H, true);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();

  /*
   * Soft WebGL wash behind the mat — large sphere + vertical-only mix so it reads as ambient
   * light, not a visible “disc” behind the product (small spheres + angular shaders read as a circle).
   */
  const skyUniforms = { uTime: { value: 0 } };
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: true,
    uniforms: skyUniforms,
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vPos;
      uniform float uTime;
      void main() {
        vec3 d = normalize(vPos);
        float h = d.y * 0.5 + 0.5;
        float drift = sin(uTime * 0.085 + h * 3.8) * 0.028;
        vec3 cream = vec3(0.94, 0.92, 0.89);
        vec3 blue = vec3(0.32, 0.54, 0.86);
        vec3 deep = vec3(0.14, 0.18, 0.26);
        vec3 col = mix(cream, blue, h * 0.5 + drift);
        col = mix(col, deep, (1.0 - h) * 0.1);
        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
      }
    `,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(220, 32, 24), skyMat));

  const camera = new THREE.PerspectiveCamera(45, W / H, 0.35, 80);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.09;
  controls.autoRotate = false;
  controls.enablePan = false;
  controls.minDistance = 5.5;
  controls.maxDistance = 28;
  /* Let you orbit more overhead without hitting the clamp */
  controls.minPolarAngle = 0.06;
  controls.maxPolarAngle = Math.PI / 2 - 0.04;

  const viewPreset = loadViewPreset();

  let orbitTarget;
  let camSph;
  if (viewPreset) {
    orbitTarget = new THREE.Vector3(
      viewPreset.target[0],
      viewPreset.target[1],
      viewPreset.target[2]
    );
    controls.target.copy(orbitTarget);
    camSph = new THREE.Spherical(
      viewPreset.distance,
      THREE.MathUtils.degToRad(viewPreset.polarDeg),
      THREE.MathUtils.degToRad(viewPreset.azimuthDeg)
    );
  } else {
    orbitTarget = new THREE.Vector3(0, 0.1, 0);
    controls.target.copy(orbitTarget);
    /*
     * DEFAULT CAMERA — only touch these three numbers (then refresh).
     * Uses THREE.Spherical: phi = angle down from +Y (smaller ° = more bird’s-eye / “overhead”).
     * azimuth = spin around Y (try ~115–140° for front-right vs front-left on the mat).
     */
    const CAM_DISTANCE = 18.5;
    const CAM_POLAR_DEG = 38;
    const CAM_AZIMUTH_DEG = 128;
    camSph = new THREE.Spherical(
      CAM_DISTANCE,
      THREE.MathUtils.degToRad(CAM_POLAR_DEG),
      THREE.MathUtils.degToRad(CAM_AZIMUTH_DEG)
    );
  }
  camera.position.setFromSpherical(camSph).add(orbitTarget);
  camera.lookAt(orbitTarget);
  controls.update();

  scene.add(new THREE.AmbientLight(0xffffff, 0.48));
  scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x3a4f5c, 0.26));

  const keyLight = new THREE.DirectionalLight(0xfff4ea, 1.35);
  keyLight.position.set(6.5, 11, 7);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.bias = -0.00008;
  keyLight.shadow.normalBias = 0.045;
  const shCam = keyLight.shadow.camera;
  shCam.near = 2;
  shCam.far = 32;
  shCam.left = -9;
  shCam.right = 9;
  shCam.top = 9;
  shCam.bottom = -9;
  shCam.updateProjectionMatrix();
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xa8d4ff, 0.52);
  fillLight.position.set(-8, 5.5, -2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xc8e0f0, 0.35);
  rimLight.position.set(-2.5, 6.5, -8.5);
  scene.add(rimLight);

  const topLight = new THREE.DirectionalLight(0xffffff, 0.16);
  topLight.position.set(0, 14, 2);
  scene.add(topLight);

  /* Mat + field lines live here — scroll “travel” tilts / lifts the stack without fighting OrbitControls */
  const hero3dRoot = new THREE.Group();
  scene.add(hero3dRoot);

  const matGroup = new THREE.Group();

  /* Magnetic sandwich: black base + mat + blue top sheet, with visible gaps */
  const AFFIX_W = 8.95;
  const AFFIX_D = 6.65;
  const AFFIX_THICK = 0.11;
  const GAP_BELOW = 1.08;
  const GAP_ABOVE = 1.12;
  const frameBottomY = -0.15;
  const pinTopY = 0.242 + 0.17 / 2;

  const bottomAffixGeo = new THREE.BoxGeometry(AFFIX_W, AFFIX_THICK, AFFIX_D);
  const bottomAffixMat = new THREE.MeshStandardMaterial({
    color: 0x0c0c10,
    roughness: 0.88,
    metalness: 0.06,
  });
  const bottomAffix = new THREE.Mesh(bottomAffixGeo, bottomAffixMat);
  bottomAffix.position.y = frameBottomY - GAP_BELOW - AFFIX_THICK / 2;
  bottomAffix.castShadow = true;
  bottomAffix.receiveShadow = true;
  matGroup.add(bottomAffix);

  const coreGroup = new THREE.Group();

  const frameGeo = new THREE.BoxGeometry(8.7, 0.3, 6.5);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x6f8494, roughness: 0.48, metalness: 0.72 });
  const chromeFrame = new THREE.Mesh(frameGeo, frameMat);
  chromeFrame.castShadow = true;
  chromeFrame.receiveShadow = true;
  coreGroup.add(chromeFrame);

  const plateGeo = new THREE.BoxGeometry(8.15, 0.22, 5.95);
  const plateMat = new THREE.MeshStandardMaterial({ color: 0x355060, roughness: 0.92, metalness: 0.08 });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.y = 0.04;
  plate.receiveShadow = true;
  coreGroup.add(plate);

  const edgeGeo = new THREE.BoxGeometry(8.7, 0.008, 0.008);
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0xc5d8e8, transparent: true, opacity: 0.65 });
  [-3.25, 3.25].forEach((z) => {
    const e = new THREE.Mesh(edgeGeo, edgeMat);
    e.position.set(0, 0.15, z);
    coreGroup.add(e);
  });

  const COLS = 58;
  const ROWS = 44;
  const TOTAL = COLS * ROWS;
  const pinGeo = new THREE.CylinderGeometry(0.037, 0.044, 0.17, 12);
  /* Lambert = diffuse only — no moving specular “hot spot” as the camera orbits */
  const pinMat = new THREE.MeshLambertMaterial({
    color: 0x5f7d92,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const pins = new THREE.InstancedMesh(pinGeo, pinMat, TOTAL);
  pins.castShadow = false;

  const dummy = new THREE.Object3D();
  let idx = 0;
  const xMin = -3.85;
  const xMax = 3.85;
  const zMin = -2.78;
  const zMax = 2.78;

  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      dummy.position.set(
        xMin + (c / (COLS - 1)) * (xMax - xMin),
        0.242,
        zMin + (r / (ROWS - 1)) * (zMax - zMin)
      );
      dummy.updateMatrix();
      pins.setMatrixAt(idx++, dummy.matrix);
    }
  }
  pins.instanceMatrix.needsUpdate = true;
  coreGroup.add(pins);
  matGroup.add(coreGroup);

  const topAffixGeo = new THREE.BoxGeometry(AFFIX_W, AFFIX_THICK, AFFIX_D);
  const topAffixMat = new THREE.MeshStandardMaterial({
    color: 0x4a6f88,
    roughness: 0.55,
    metalness: 0.12,
  });
  const topAffix = new THREE.Mesh(topAffixGeo, topAffixMat);
  topAffix.position.y = pinTopY + GAP_ABOVE + AFFIX_THICK / 2;
  topAffix.castShadow = true;
  topAffix.receiveShadow = true;
  matGroup.add(topAffix);

  const baseBottomY = bottomAffix.position.y;
  const baseTopY = topAffix.position.y;
  /* Scroll-driven spread */
  const SEP_BOTTOM = 0.68;
  const SEP_TOP = 0.68;
  const SEP_CORE = 0.2;
  /* Extra motion on hover only (adds on top of scroll spread) */
  const HOVER_EXTRA_BOTTOM = 0.92;
  const HOVER_EXTRA_TOP = 0.92;
  const HOVER_EXTRA_CORE = 0.32;
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  let hoverStack = 0;
  let openAmount = 0;
  /** Slightly lags openAmount so stack and “camera travel” feel decoupled */
  let travelAmount = 0;
  let hoverExtra = 0;
  let pointerOverCanvas = false;
  let lastClientX = 0;
  let lastClientY = 0;

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * 0 = hero rest, 1 = fully “arrived” after a long scroll (smoothstep).
   * Range scales with viewport so the effect stays readable on tall pages.
   */
  function scrollStoryProgress() {
    const vh = window.innerHeight || 1;
    const doc = document.documentElement;
    const scrollY = window.scrollY || doc.scrollTop || 0;
    const maxScroll = Math.max(1, doc.scrollHeight - vh);
    const range = THREE.MathUtils.clamp(Math.max(vh * 2.75, 1480), vh * 1.2, maxScroll * 0.92);
    const u = THREE.MathUtils.clamp(scrollY / range, 0, 1);
    return u * u * (3 - 2 * u);
  }

  function updatePointerRay(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    const hits = raycaster.intersectObject(matGroup, true);
    hoverStack = hits.length > 0 ? 1 : 0;
  }

  canvas.addEventListener('pointermove', (e) => {
    pointerOverCanvas = true;
    lastClientX = e.clientX;
    lastClientY = e.clientY;
    updatePointerRay(lastClientX, lastClientY);
    canvas.style.cursor = hoverStack ? 'pointer' : '';
  });
  canvas.addEventListener('pointerleave', () => {
    pointerOverCanvas = false;
    hoverStack = 0;
    canvas.style.cursor = '';
  });
  canvas.addEventListener(
    'pointerdown',
    (e) => {
      pointerOverCanvas = true;
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      updatePointerRay(lastClientX, lastClientY);
    },
    { passive: true }
  );

  /* Hero stack: bottom-left corner leads; opposite sign set from prior attempt (order YXZ) */
  if (viewPreset) {
    matGroup.rotation.order = viewPreset.mat.order || 'YXZ';
    matGroup.rotation.x = viewPreset.mat.x;
    matGroup.rotation.y = viewPreset.mat.y;
    matGroup.rotation.z = viewPreset.mat.z;
  } else {
    matGroup.rotation.order = 'YXZ';
    matGroup.rotation.y = THREE.MathUtils.degToRad(-47.5);
    matGroup.rotation.x = THREE.MathUtils.degToRad(27);
    matGroup.rotation.z = THREE.MathUtils.degToRad(12.5);
  }
  hero3dRoot.add(matGroup);

  /* Dev: orbit to the angle you want, then run __magnamatScene.logDefaultAngle() in the console → paste into main.mjs */
  if (typeof window !== 'undefined') {
    window.__magnamatScene = {
      camera,
      controls,
      matGroup,
      saveLockedView() {
        const p = captureViewPreset(camera, controls, matGroup);
        localStorage.setItem(VIEW_PRESET_STORAGE_KEY, JSON.stringify(p));
        console.info('[magnamat] View saved to localStorage (same as panel “Save”). Reload to apply if you changed code paths.');
        return p;
      },
      clearLockedView() {
        localStorage.removeItem(VIEW_PRESET_STORAGE_KEY);
        console.info('[magnamat] Cleared saved view. Reload to use file defaults.');
      },
      async copyLockedViewSnippet() {
        const text = formatPresetAsMainSnippet(captureViewPreset(camera, controls, matGroup));
        try {
          await navigator.clipboard.writeText(text);
          console.info('[magnamat] Spherical + mat snippet copied to clipboard.');
        } catch {
          console.log(text);
        }
        return text;
      },
      logDefaultAngle() {
        const t = controls.target;
        const p = camera.position;
        const e = matGroup.rotation;
        const f = (n) => Number(n).toFixed(5);
        const cameraBlock = [
          'const orbitTarget = new THREE.Vector3(' + `${f(t.x)}, ${f(t.y)}, ${f(t.z)}` + ');',
          'controls.target.copy(orbitTarget);',
          'camera.position.set(' + `${f(p.x)}, ${f(p.y)}, ${f(p.z)}` + ');',
          'camera.lookAt(orbitTarget);',
          'controls.update();',
        ].join('\n');
        const rotBlock = [
          "matGroup.rotation.order = 'YXZ';",
          'matGroup.rotation.y = ' + f(e.y) + ';',
          'matGroup.rotation.x = ' + f(e.x) + ';',
          'matGroup.rotation.z = ' + f(e.z) + ';',
        ].join('\n');
        const full = `// —— Camera: paste below OR set CAM_DISTANCE / CAM_POLAR_DEG / CAM_AZIMUTH_DEG\n${cameraBlock}\n\n// —— Mat rotation:\n${rotBlock}`;
        console.log('%c[magnamat] Paste into js/main.mjs:\n', 'font-weight:bold;color:#0a7;', full);
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(full).then(
            () => console.log('%cCopied to clipboard.', 'color:#0a7;'),
            () => console.warn('Clipboard copy failed; select the log above.')
          );
        }
        return full;
      },
    };
    console.info(
      '[magnamat] Quick tune: add ?adjust=1 for a save/copy panel — or edit CAM_* in main.mjs — or __magnamatScene.logDefaultAngle() / saveLockedView() / copyLockedViewSnippet()'
    );
    installViewTuner(container, { camera, controls, matGroup });
  }

  const fieldGroup = new THREE.Group();

  function makeTube(pts, color, opacity) {
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 28, 0.013, 5, false);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    });
    return new THREE.Mesh(geo, mat);
  }

  [
    [-3.2, 1.8],
    [-1.4, -2.0],
    [0.3, 2.3],
    [2.1, -1.5],
    [3.5, 0.8],
  ].forEach(([x, z]) => {
    const h = 1.4 + Math.random() * 0.8;
    const dx = 0.6 + Math.random() * 0.5;
    fieldGroup.add(
      makeTube(
        [
          new THREE.Vector3(x, 0.32, z),
          new THREE.Vector3(x + dx * 0.4, h * 0.45, z + 0.12),
          new THREE.Vector3(x + dx * 0.8, h * 0.82, z),
          new THREE.Vector3(x + dx, h, z - 0.1),
          new THREE.Vector3(x + dx * 1.1, h * 1.05, z),
        ],
        0xe5342a,
        0.28
      )
    );
  });

  [
    [-2.5, 2.1],
    [-0.7, -2.3],
    [1.2, 1.7],
    [2.9, -0.9],
  ].forEach(([x, z]) => {
    const h = 1.5 + Math.random() * 0.6;
    const dx = 0.6 + Math.random() * 0.4;
    fieldGroup.add(
      makeTube(
        [
          new THREE.Vector3(x, h, z),
          new THREE.Vector3(x - dx * 0.35, h * 0.65, z + 0.15),
          new THREE.Vector3(x - dx * 0.7, h * 0.38, z),
          new THREE.Vector3(x - dx, 0.32, z - 0.1),
        ],
        0x3b9be5,
        0.22
      )
    );
  });

  hero3dRoot.add(fieldGroup);

  let tick = 0;
  function animate() {
    requestAnimationFrame(animate);
    tick++;

    if (pointerOverCanvas) {
      updatePointerRay(lastClientX, lastClientY);
    }

    const sepEase = 0.1;
    const travelEase = 0.062;
    const scrollTarget = scrollStoryProgress();
    openAmount += (scrollTarget - openAmount) * sepEase;
    travelAmount += (scrollTarget - travelAmount) * travelEase;
    hoverExtra += (hoverStack - hoverExtra) * 0.15;

    /* Stronger spread at end of scroll arc so pins read clearly */
    const sepBoost = 1 + openAmount * 0.28;
    bottomAffix.position.y =
      baseBottomY - openAmount * SEP_BOTTOM * sepBoost - hoverExtra * HOVER_EXTRA_BOTTOM;
    coreGroup.position.y = openAmount * SEP_CORE * sepBoost + hoverExtra * HOVER_EXTRA_CORE;
    topAffix.position.y = baseTopY + openAmount * SEP_TOP * sepBoost + hoverExtra * HOVER_EXTRA_TOP;

    /* Scroll “travel”: gentle orbit + lift + forward drift of the whole hero stack */
    const t = reduceMotion ? 0 : travelAmount;
    const t2 = t * t;
    hero3dRoot.rotation.order = 'YXZ';
    hero3dRoot.rotation.x = THREE.MathUtils.degToRad(2.5) * t + THREE.MathUtils.degToRad(9) * t2;
    hero3dRoot.rotation.y = THREE.MathUtils.degToRad(12) * t + THREE.MathUtils.degToRad(4) * t2;
    hero3dRoot.rotation.z = THREE.MathUtils.degToRad(-6.5) * t2;
    hero3dRoot.position.y = 0.52 * t + 0.18 * t2;
    hero3dRoot.position.z = -0.42 * t;

    /* Subtle opacity drift — large swings read as “dancing” over the mat */
    fieldGroup.children.forEach((tube, i) => {
      tube.material.opacity = 0.13 + Math.abs(Math.sin(tick * 0.006 + i * 0.55)) * 0.05;
    });

    skyUniforms.uTime.value = performance.now() * 0.001;

    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  let lastW = W;
  let lastH = H;
  let resizeRaf = 0;
  function applyResize() {
    const { w, h } = readCanvasSize(container);
    if (w < 2 || h < 2) return;
    if (w === lastW && h === lastH) return;
    lastW = w;
    lastH = h;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, true);
  }
  function scheduleResize() {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      applyResize();
    });
  }
  window.addEventListener('resize', scheduleResize, { passive: true });
}

function bootMat() {
  const container = document.getElementById('canvas-container');
  const canvas = document.getElementById('mat-canvas');
  if (!container || !canvas) return;

  let frames = 0;
  function waitLayout() {
    frames++;
    const { w, h } = readCanvasSize(container);
    if (w >= 32 && h >= 32) {
      try {
        startScene(container, canvas);
      } catch (err) {
        console.error(err);
        showCanvasError(container, '3D preview hit an error. Open the browser console for details.');
      }
      return;
    }
    if (frames < 120) {
      requestAnimationFrame(waitLayout);
      return;
    }
    try {
      startScene(container, canvas);
    } catch (err) {
      console.error(err);
      showCanvasError(container, '3D preview hit an error. Open the browser console for details.');
    }
  }

  requestAnimationFrame(waitLayout);
}

if (document.readyState === 'complete') {
  requestAnimationFrame(bootMat);
} else {
  window.addEventListener('load', bootMat);
}
