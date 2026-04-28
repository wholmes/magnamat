import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

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
const FEATURES_VIEW_PRESET_STORAGE_KEY = 'magnamat-view-preset-features';
/** Orbit radius only — applied after full view / code defaults so you can lock wheel zoom separately */
const ZOOM_PRESET_STORAGE_KEY = 'magnamat-default-zoom';

function loadZoomOnlyPreset() {
  try {
    const raw = localStorage.getItem(ZOOM_PRESET_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && p.v === 1 && typeof p.distance === 'number' && Number.isFinite(p.distance)) {
      return p.distance;
    }
  } catch (_) {}
  return null;
}

/** Re-place camera on same polar/azimuth, new orbit distance (clamped to OrbitControls limits). */
function applyOrbitDistance(camera, controls, distance) {
  const clamped = THREE.MathUtils.clamp(distance, controls.minDistance, controls.maxDistance);
  const off = camera.position.clone().sub(controls.target);
  const sph = new THREE.Spherical().setFromVector3(off);
  sph.radius = clamped;
  camera.position.setFromSpherical(sph).add(controls.target);
  camera.lookAt(controls.target);
  controls.update();
}

function orbitDistance(camera, controls) {
  return new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target)).radius;
}

/** Persist zoom; if a full view preset exists, keep its distance in sync. */
function persistZoomPreset(distance, controls, syncFullPresetStorageKey = VIEW_PRESET_STORAGE_KEY) {
  const clamped = THREE.MathUtils.clamp(distance, controls.minDistance, controls.maxDistance);
  localStorage.setItem(ZOOM_PRESET_STORAGE_KEY, JSON.stringify({ v: 1, distance: clamped }));
  try {
    const raw = localStorage.getItem(syncFullPresetStorageKey);
    if (!raw) return;
    const p = JSON.parse(raw);
    if (p && p.v === 1) {
      p.distance = clamped;
      localStorage.setItem(syncFullPresetStorageKey, JSON.stringify(p));
    }
  } catch (_) {}
}

function clearZoomPreset() {
  localStorage.removeItem(ZOOM_PRESET_STORAGE_KEY);
}

function formatZoomSnippet(camera, controls) {
  const d = THREE.MathUtils.clamp(orbitDistance(camera, controls), controls.minDistance, controls.maxDistance);
  return `// Default orbit zoom — replace CAM_DISTANCE in startScene() locked camera block\nconst CAM_DISTANCE = ${d.toFixed(5)};`;
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
    '// startScene() uses this locked view for all visitors; paste over the CAM_* + orbitTarget + matGroup.rotation block.',
  ].join('\n');
}

function installViewTuner(container, ctx) {
  if (!ctx.isAdjustMode) return;

  const {
    camera,
    controls,
    matGroup,
    tunerKind = 'hero',
    presetStorageKey = VIEW_PRESET_STORAGE_KEY,
  } = ctx;
  const isFeatures = tunerKind === 'features';
  const fixedSheet =
    typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)')?.matches;
  const mountParent = fixedSheet && !isFeatures ? document.body : container;
  const wrap = document.createElement('div');
  wrap.className = 'view-tuner-panel';
  wrap.style.cssText = fixedSheet
    ? 'position:fixed;left:0;right:0;bottom:0;z-index:220;max-height:min(48vh,380px);overflow:auto;padding:14px 16px calc(14px + env(safe-area-inset-bottom,0px));border-radius:16px 16px 0 0;background:rgba(255,255,255,0.98);border:1px solid rgba(0,0,0,0.1);border-bottom:none;font:12px/1.45 system-ui,-apple-system,sans-serif;box-shadow:0 -8px 32px rgba(22,22,22,0.12);color:#141414;'
    : 'position:absolute;left:8px;right:8px;bottom:8px;z-index:6;max-height:46%;overflow:auto;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,0.96);border:1px solid rgba(0,0,0,0.1);font:12px/1.45 system-ui,-apple-system,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,0.12);color:#141414;';

  const title = document.createElement('div');
  title.textContent = isFeatures
    ? 'Features 3D (?adjustFeatures=1)'
    : '3D view lock-in (?adjust=1 or ?adjustHero=1)';
  title.style.cssText = 'font-weight:600;margin-bottom:8px;font-size:13px;';

  const hint = document.createElement('p');
  hint.style.cssText = 'margin:0 0 10px;color:#555;font-size:11px;line-height:1.45;';
  hint.textContent = isFeatures
    ? fixedSheet
      ? 'Pinch to zoom; drag to orbit. Saves use magnamat-view-preset-features only. Remove ?adjustFeatures=1 to hide.'
      : 'Scroll zoom on this canvas. Saves go to magnamat-view-preset-features. Remove ?adjustFeatures=1 or ?adjustScroll=1 to hide.'
    : fixedSheet
      ? 'Drag on the canvas to orbit; pinch with two fingers to zoom. “Save” keeps a backup on this device only — startScene() always uses the locked numbers in main.mjs. Ship a new default: Copy main.mjs snippet → paste over the CAM_* + orbitTarget + matGroup.rotation block → deploy. Remove ?adjust=1 to hide.'
      : 'Orbit with drag; scroll zoom on the canvas. Save / Save default zoom write to localStorage (zoom-only still applies on load). Full view defaults live in main.mjs only: Copy main.mjs snippet → paste over the locked camera + matGroup.rotation block in startScene(), commit, deploy. Clear removes local overrides. Remove ?adjust=1 to hide this panel.';

  const readout = document.createElement('pre');
  readout.style.cssText =
    'margin:0 0 10px;padding:8px 10px;background:#f4f4f2;border-radius:8px;font-size:10px;overflow-x:auto;white-space:pre-wrap;word-break:break-all;';

  function refreshReadout() {
    const p = captureViewPreset(camera, controls, matGroup);
    readout.textContent = `zoom (orbit distance) ${p.distance.toFixed(3)}  ·  polar° ${p.polarDeg.toFixed(2)}  ·  azimuth° ${p.azimuthDeg.toFixed(2)}\ntarget [${p.target.map((n) => n.toFixed(4)).join(', ')}]\nmat rad x ${p.mat.x.toFixed(4)} y ${p.mat.y.toFixed(4)} z ${p.mat.z.toFixed(4)}`;
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
    localStorage.setItem(presetStorageKey, JSON.stringify(p));
    persistZoomPreset(p.distance, controls, presetStorageKey);
    bSave.textContent = 'Saved ✓';
    setTimeout(() => {
      bSave.textContent = 'Save as locked default';
    }, 1600);
    console.info(
      '[magnamat] View saved to localStorage (backup). To ship this angle, use Copy main.mjs snippet and paste into startScene(); reload alone does not change file defaults.'
    );
  });

  const bSaveZoom = btn('Save default zoom', false);
  bSaveZoom.addEventListener('click', () => {
    persistZoomPreset(orbitDistance(camera, controls), controls, presetStorageKey);
    bSaveZoom.textContent = 'Zoom saved ✓';
    setTimeout(() => {
      bSaveZoom.textContent = 'Save default zoom';
    }, 1600);
    console.info('[magnamat] Default orbit zoom saved (localStorage). Reload to confirm from cold load.');
  });

  const bCopyZoom = btn('Copy zoom line', false);
  bCopyZoom.addEventListener('click', async () => {
    const text = formatZoomSnippet(camera, controls);
    try {
      await navigator.clipboard.writeText(text);
      bCopyZoom.textContent = 'Copied ✓';
      setTimeout(() => {
        bCopyZoom.textContent = 'Copy zoom line';
      }, 1400);
    } catch {
      console.log(text);
      alert('Copy failed — printed to console.');
    }
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
    localStorage.removeItem(presetStorageKey);
    if (!isFeatures) {
      clearZoomPreset();
    }
    window.location.reload();
  });

  wrap.append(title, hint, readout, bSave, bSaveZoom, bCopyZoom, bCopy, bClear);
  mountParent.appendChild(wrap);

  controls.addEventListener('change', refreshReadout);
  refreshReadout();
}

/** Leader lines + CSS2D labels on mat meshes — secondary canvas only; follows orbit + stack spread */
function installSecondaryMatCallouts({ container, W, H, coreGroup, topAffix, bottomAffix, AFFIX_THICK }) {
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(W, H);
  labelRenderer.domElement.style.cssText =
    'position:absolute;inset:0;pointer-events:none;z-index:3;';

  const canvasEl = container.querySelector('canvas');
  if (canvasEl?.nextSibling) container.insertBefore(labelRenderer.domElement, canvasEl.nextSibling);
  else container.appendChild(labelRenderer.domElement);

  function addLeader(parent, ax, ay, az, bx, by, bz) {
    const geom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(ax, ay, az),
      new THREE.Vector3(bx, by, bz),
    ]);
    const mat = new THREE.LineBasicMaterial({
      color: 0x2a2a2a,
      transparent: true,
      opacity: 0.48,
      depthTest: true,
      depthWrite: false,
    });
    const line = new THREE.Line(geom, mat);
    parent.add(line);
  }

  function addDot(parent, x, y, z, color) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 10, 10),
      new THREE.MeshBasicMaterial({
        color,
        depthTest: true,
        depthWrite: false,
        transparent: true,
        opacity: 0.92,
      })
    );
    mesh.position.set(x, y, z);
    parent.add(mesh);
  }

  function makeLabel(text, accentClass) {
    const div = document.createElement('div');
    div.className = `mat-callout-2d${accentClass ? ` ${accentClass}` : ''}`;
    div.textContent = text;
    return new CSS2DObject(div);
  }

  /* Anchors sit on each sandwich layer’s visible top surface (local to parent). */
  const affixTopFace = AFFIX_THICK / 2 + 0.016;
  const pinLayerY = 0.242 + 0.17 / 2 - 0.02;
  const flexSteelDotY = -0.034;

  const tsA = { x: -1.25, y: affixTopFace, z: 1.05 };
  const tsB = { x: 0.1, y: 4.12, z: 0.4 };
  addLeader(topAffix, tsA.x, tsA.y, tsA.z, tsB.x, tsB.y, tsB.z);
  addDot(topAffix, tsA.x, tsA.y, tsA.z, 0x3b9be5);
  const tsL = makeLabel('Top sheet', 'mat-callout-2d--sheet');
  tsL.position.set(tsB.x, tsB.y, tsB.z);
  tsL.center.set(0.5, 1);
  topAffix.add(tsL);

  const pA = { x: 0.55, y: pinLayerY, z: 0.65 };
  const pB = { x: -8.35, y: 0.4, z: 2.05 };
  addLeader(coreGroup, pA.x, pA.y, pA.z, pB.x, pB.y, pB.z);
  addDot(coreGroup, pA.x, pA.y, pA.z, 0xe5342a);
  const pL = makeLabel('Pin matrix', 'mat-callout-2d--pins');
  pL.position.set(pB.x, pB.y, pB.z);
  pL.center.set(0, 0.5);
  coreGroup.add(pL);

  const narrow =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(max-width: 639px)').matches;
  if (!narrow) {
    const fA = { x: -0.35, y: flexSteelDotY, z: -0.55 };
    const fB = { x: -8.35, y: -0.02, z: 0.65 };
    addLeader(bottomAffix, fA.x, fA.y, fA.z, fB.x, fB.y, fB.z);
    addDot(bottomAffix, fA.x, fA.y, fA.z, 0xc5d0da);
    const fL = makeLabel('Flex steel', 'mat-callout-2d--steel');
    fL.position.set(fB.x, fB.y, fB.z);
    fL.center.set(0, 0.5);
    bottomAffix.add(fL);
  }

  return labelRenderer;
}

/** Phones / touch-primary tablets: one-finger orbit steals vertical scroll — lock unless ?adjust=1 */
function touchPrimaryOrNarrowForOrbit() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  if (window.matchMedia('(max-width: 767px)').matches) return true;
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return true;
  return false;
}

function getHashQueryString() {
  if (typeof window === 'undefined' || !window.location.hash) return null;
  let h = window.location.hash.replace(/^#/, '');
  if (h.startsWith('?')) h = h.slice(1);
  if (!h.includes('=')) return null;
  return h;
}

function urlHasQueryKey(key) {
  if (typeof window === 'undefined') return false;
  const q = new URLSearchParams(window.location.search);
  if (q.has(key)) return true;
  const hs = getHashQueryString();
  if (!hs) return false;
  return new URLSearchParams(hs).has(key);
}

function urlParamFromSearchAndHash(key) {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  let v = q.get(key);
  if (v != null && v !== '') return v;
  const hs = getHashQueryString();
  if (!hs) return null;
  v = new URLSearchParams(hs).get(key);
  if (v != null && v !== '') return v;
  return null;
}

function parseAdjustTruthy(raw) {
  if (raw == null) return false;
  const v = String(raw).trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

/** Hero: `?adjust=1` or `?adjustHero=1`. Features: `?adjustFeatures=1` or `?adjustScroll=1` (no legacy `adjust` alone). */
function isAdjustModeForScene(isSecondary) {
  if (typeof window === 'undefined') return false;
  if (isSecondary) {
    if (urlHasQueryKey('adjustFeatures')) return parseAdjustTruthy(urlParamFromSearchAndHash('adjustFeatures'));
    if (urlHasQueryKey('adjustScroll')) return parseAdjustTruthy(urlParamFromSearchAndHash('adjustScroll'));
    return false;
  }
  if (urlHasQueryKey('adjustHero')) return parseAdjustTruthy(urlParamFromSearchAndHash('adjustHero'));
  return parseAdjustTruthy(urlParamFromSearchAndHash('adjust'));
}

function startScene(container, canvas, options = {}) {
  const isSecondary = options.secondary === true;
  const isAdjustMode = isAdjustModeForScene(isSecondary);

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
      /* Better composite over the hero photo (CSS) under the canvas */
      premultipliedAlpha: false,
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
  let labelRenderer = null;

  /*
   * Soft WebGL wash behind the mat only (grayscale). Mat / lights / materials unchanged.
   * Large sphere + vertical mix — reads as ambient, not a visible “disc”.
   */
  const skyUniforms = { uTime: { value: 0 } };
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: true,
    transparent: true,
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
        float drift = sin(uTime * 0.085 + h * 3.8) * 0.035;
        /*
         * Neutral wash with real tonal range (not “white at 50% alpha”, which lets the
         * page’s blue hero CSS dominate). Still background-only; mat materials unchanged.
         */
        vec3 hi = vec3(0.82);
        vec3 mid = vec3(0.38);
        vec3 lo = vec3(0.05);
        vec3 col = mix(hi, mid, h * 0.55 + drift);
        col = mix(col, lo, (1.0 - h) * 0.22);
        col = clamp(col, 0.0, 1.0);
        /* Higher alpha so this layer reads as B&W, not a tint of the HTML behind */
        float washAlpha = 0.62 + h * 0.2;
        gl_FragColor = vec4(col, washAlpha);
      }
    `,
  });
  const skyMesh = new THREE.Mesh(new THREE.SphereGeometry(220, 32, 24), skyMat);
  skyMesh.renderOrder = -1000;
  scene.add(skyMesh);

  const camera = new THREE.PerspectiveCamera(45, W / H, 0.35, 80);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.09;
  controls.autoRotate = false;
  controls.enablePan = false;
  function applyTouchOrbitPolicy() {
    if (isAdjustMode) {
      controls.enableRotate = true;
      controls.enableZoom = true;
      return;
    }
    /* Normal page: no wheel zoom on canvas; phones lock one-finger orbit so vertical scroll wins */
    controls.enableZoom = false;
    controls.enableRotate = !touchPrimaryOrNarrowForOrbit();
  }
  applyTouchOrbitPolicy();
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mqNarrow = window.matchMedia('(max-width: 767px)');
    const mqTouch = window.matchMedia('(hover: none) and (pointer: coarse)');
    const onOrbitMediaChange = () => applyTouchOrbitPolicy();
    if (mqNarrow.addEventListener) {
      mqNarrow.addEventListener('change', onOrbitMediaChange);
      mqTouch.addEventListener('change', onOrbitMediaChange);
    } else {
      mqNarrow.addListener(onOrbitMediaChange);
      mqTouch.addListener(onOrbitMediaChange);
    }
  }

  /* iOS: tabindex=0 canvas often eats the first tap for focus; tuning needs immediate orbit */
  if (isAdjustMode) {
    canvas.tabIndex = -1;
  }
  controls.minDistance = 5.5;
  controls.maxDistance = 28;
  /* Let you orbit more overhead without hitting the clamp */
  controls.minPolarAngle = 0.06;
  controls.maxPolarAngle = Math.PI / 2 - 0.04;

  /* Locked default orbit + target (same for every visitor; ?adjust=1 + Copy snippet to revise). */
  const CAM_DISTANCE = 17.961961;
  const CAM_POLAR_DEG = 77.844331;
  const CAM_AZIMUTH_DEG = -94.868025;
  const orbitTarget = new THREE.Vector3(0.000000, 0.100000, 0.000000);
  controls.target.copy(orbitTarget);
  const camSph = new THREE.Spherical(
    CAM_DISTANCE,
    THREE.MathUtils.degToRad(CAM_POLAR_DEG),
    THREE.MathUtils.degToRad(CAM_AZIMUTH_DEG)
  );
  camera.position.setFromSpherical(camSph).add(orbitTarget);
  camera.lookAt(orbitTarget);
  controls.update();

  const zoomOnly = loadZoomOnlyPreset();
  if (zoomOnly !== null) {
    applyOrbitDistance(camera, controls, zoomOnly);
  }

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

  /*
   * Jig tooling on the top sheet (additive only): registration barbs + one held blank.
   * Parent is topAffix so it travels with the blue layer; core mat / pins untouched.
   */
  const jigRoot = new THREE.Group();
  jigRoot.position.set(0, AFFIX_THICK / 2 + 0.0015, 0);
  topAffix.add(jigRoot);

  const BARB_H = 0.115;
  const barbGeo = new THREE.CylinderGeometry(0.036, 0.024, BARB_H, 12);
  const barbMat = new THREE.MeshStandardMaterial({
    color: 0x3a434c,
    roughness: 0.4,
    metalness: 0.48,
  });
  const hw = 1.02;
  const hd = 0.76;
  const barbInset = 0.072;
  const bx = hw + barbInset;
  const bz = hd + barbInset;
  [
    [bx, bz],
    [bx, -bz],
    [-bx, bz],
    [-bx, -bz],
    [0, bz + 0.055],
    [0, -(bz + 0.055)],
    [-(bx + 0.085), 0],
    [bx + 0.085, 0],
  ].forEach(([x, z]) => {
    const peg = new THREE.Mesh(barbGeo, barbMat);
    peg.position.set(x, BARB_H / 2, z);
    peg.castShadow = true;
    peg.receiveShadow = true;
    jigRoot.add(peg);
  });

  const itemW = hw * 2;
  const itemD = hd * 2;
  const itemH = 0.09;
  const itemGeo = new THREE.BoxGeometry(itemW, itemH, itemD);
  const itemBodyMat = new THREE.MeshStandardMaterial({
    color: 0xb4bcc4,
    roughness: 0.68,
    metalness: 0.07,
  });
  const itemTopMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.62,
    metalness: 0.04,
  });
  /* Box materials: +x,-x,+y(top),-y,+z,-z */
  const heldBlankMesh = new THREE.Mesh(itemGeo, [
    itemBodyMat,
    itemBodyMat,
    itemTopMat,
    itemBodyMat,
    itemBodyMat,
    itemBodyMat,
  ]);
  heldBlankMesh.position.set(0, 0.007 + itemH / 2, 0);
  heldBlankMesh.castShadow = true;
  heldBlankMesh.receiveShadow = true;
  jigRoot.add(heldBlankMesh);

  const PRINT_DEMO_URL = new URL('../images/print-demo-chicago-bean.png', import.meta.url).href;
  new THREE.TextureLoader().load(
    PRINT_DEMO_URL,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      itemTopMat.map = tex;
      itemTopMat.needsUpdate = true;
    },
    undefined,
    () => console.warn('[magnamat] Print demo texture failed to load:', PRINT_DEMO_URL)
  );

  const baseBottomY = bottomAffix.position.y;
  const baseTopY = topAffix.position.y;
  /* Scroll-driven spread */
  const SEP_BOTTOM = 0.86;
  const SEP_TOP = 0.86;
  const SEP_CORE = 0.28;
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
   * Pin stack separation: reaches ~1 quickly so the hero still shows the
   * full “exploded” read (smoothstep). Independent of the slower page “travel”.
   */
  function stackSeparationProgress() {
    const vh = window.innerHeight || 1;
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    /* ~½ viewport scroll to full spread — visible in hero without going extreme */
    const range = Math.max(vh * 0.52, 280);
    const u = THREE.MathUtils.clamp(scrollY / range, 0, 1);
    return u * u * (3 - 2 * u);
  }

  /**
   * 0 = rest, 1 = fully “arrived” after a longer scroll (smoothstep) — used for hero3dRoot travel only.
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

  /* Locked default mat pose (order YXZ) */
  matGroup.rotation.order = 'YXZ';
  matGroup.rotation.x = 0.471239;
  matGroup.rotation.y = -0.829031;
  matGroup.rotation.z = 0.218166;

  if (isSecondary && isAdjustMode) {
    try {
      const raw = localStorage.getItem(FEATURES_VIEW_PRESET_STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p && p.v === 1 && Array.isArray(p.target) && p.target.length === 3) {
          matGroup.rotation.order = p.mat?.order || 'YXZ';
          matGroup.rotation.x = p.mat.x;
          matGroup.rotation.y = p.mat.y;
          matGroup.rotation.z = p.mat.z;
          controls.target.set(p.target[0], p.target[1], p.target[2]);
          const camSphFeat = new THREE.Spherical(
            p.distance,
            THREE.MathUtils.degToRad(p.polarDeg),
            THREE.MathUtils.degToRad(p.azimuthDeg)
          );
          camera.position.setFromSpherical(camSphFeat).add(controls.target);
          camera.lookAt(controls.target);
          controls.update();
          const zo = loadZoomOnlyPreset();
          if (zo !== null) applyOrbitDistance(camera, controls, zo);
        }
      }
    } catch (_) {}
  }

  hero3dRoot.add(matGroup);

  /* Dev: orbit to the angle you want, then run __magnamatScene.logDefaultAngle() in the console → paste into main.mjs */
  if (typeof window !== 'undefined' && !isSecondary) {
    window.__magnamatScene = {
      camera,
      controls,
      matGroup,
      saveLockedView() {
        const p = captureViewPreset(camera, controls, matGroup);
        localStorage.setItem(VIEW_PRESET_STORAGE_KEY, JSON.stringify(p));
        persistZoomPreset(p.distance, controls, VIEW_PRESET_STORAGE_KEY);
        console.info(
          '[magnamat] View saved to localStorage (backup / dev). startScene() uses locked file defaults — use Copy main.mjs snippet and paste into main.mjs to ship this angle.'
        );
        return p;
      },
      saveDefaultZoom() {
        persistZoomPreset(orbitDistance(camera, controls), controls, VIEW_PRESET_STORAGE_KEY);
        console.info('[magnamat] Default zoom saved to localStorage key magnamat-default-zoom.');
        return orbitDistance(camera, controls);
      },
      clearLockedView() {
        localStorage.removeItem(VIEW_PRESET_STORAGE_KEY);
        clearZoomPreset();
        console.info('[magnamat] Cleared saved view and default zoom. Reload to use file defaults.');
      },
      clearDefaultZoom() {
        clearZoomPreset();
        console.info('[magnamat] Cleared magnamat-default-zoom only. Reload to drop zoom override.');
      },
      copyZoomLineSnippet() {
        const text = formatZoomSnippet(camera, controls);
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(text).then(
            () => console.info('[magnamat] Zoom line copied.'),
            () => console.log(text)
          );
        } else console.log(text);
        return text;
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
      '[magnamat] Quick tune: ?adjust=1 or ?adjustHero=1 — or CAM_* in main.mjs — or __magnamatScene.saveLockedView() / saveDefaultZoom() / copyLockedViewSnippet() / copyZoomLineSnippet()'
    );
    installViewTuner(container, { camera, controls, matGroup, isAdjustMode, tunerKind: 'hero' });
  }

  if (typeof window !== 'undefined' && isSecondary && isAdjustMode) {
    window.__magnamatSceneFeatures = {
      camera,
      controls,
      matGroup,
      saveLockedView() {
        const p = captureViewPreset(camera, controls, matGroup);
        localStorage.setItem(FEATURES_VIEW_PRESET_STORAGE_KEY, JSON.stringify(p));
        persistZoomPreset(p.distance, controls, FEATURES_VIEW_PRESET_STORAGE_KEY);
        console.info('[magnamat] Features 3D view saved to magnamat-view-preset-features.');
        return p;
      },
      saveDefaultZoom() {
        persistZoomPreset(orbitDistance(camera, controls), controls, FEATURES_VIEW_PRESET_STORAGE_KEY);
        return orbitDistance(camera, controls);
      },
      clearLockedView() {
        localStorage.removeItem(FEATURES_VIEW_PRESET_STORAGE_KEY);
        console.info('[magnamat] Cleared features saved view.');
      },
      clearDefaultZoom() {
        clearZoomPreset();
      },
      copyZoomLineSnippet() {
        const text = formatZoomSnippet(camera, controls);
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(text).then(
            () => console.info('[magnamat] Zoom line copied.'),
            () => console.log(text)
          );
        } else console.log(text);
        return text;
      },
      async copyLockedViewSnippet() {
        const text = formatPresetAsMainSnippet(captureViewPreset(camera, controls, matGroup));
        try {
          await navigator.clipboard.writeText(text);
          console.info('[magnamat] Features 3D snippet copied.');
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
        const full = `// —— Features 3D (localStorage magnamat-view-preset-features)\n${cameraBlock}\n\n// —— Mat rotation:\n${rotBlock}`;
        console.log('%c[magnamat] Features 3D — paste or save via panel:\n', 'font-weight:bold;color:#0a7;', full);
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
      '[magnamat] Features 3D: ?adjustFeatures=1 — __magnamatSceneFeatures.saveLockedView() / copyLockedViewSnippet()'
    );
    installViewTuner(container, {
      camera,
      controls,
      matGroup,
      isAdjustMode,
      tunerKind: 'features',
      presetStorageKey: FEATURES_VIEW_PRESET_STORAGE_KEY,
    });
  }

  if (isSecondary) {
    labelRenderer = installSecondaryMatCallouts({
      container,
      W,
      H,
      coreGroup,
      topAffix,
      bottomAffix,
      AFFIX_THICK,
    });
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

  let tabSuspended = false;
  document.addEventListener('visibilitychange', () => {
    tabSuspended = document.visibilityState === 'hidden';
  });

  let lastW = W;
  let lastH = H;
  let tick = 0;
  function animate() {
    requestAnimationFrame(animate);
    if (tabSuspended) return;
    tick++;

    if (pointerOverCanvas) {
      updatePointerRay(lastClientX, lastClientY);
    }

    const sepEase = 0.12;
    const travelEase = 0.062;
    const stackTarget = stackSeparationProgress();
    const storyTarget = scrollStoryProgress();
    openAmount += (stackTarget - openAmount) * sepEase;
    travelAmount += (storyTarget - travelAmount) * travelEase;
    hoverExtra += (hoverStack - hoverExtra) * 0.15;

    /* Stronger spread at end of scroll arc so pins read clearly */
    const sepBoost = 1 + openAmount * 0.26;
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
    /*
     * Lower the WebGL stack vs. the plate photo (hero3dRoot Y only — CSS photo unchanged).
     * Desktop overlap: also see .hero-product-stage > canvas translateY in styles.css (px nudge).
     * Detect “narrow hero” by layout width / innerWidth — not only matchMedia, so Chrome device
     * mode and odd viewports still pick this up.
     */
    const cw = container.clientWidth || lastW;
    const iw = typeof window !== 'undefined' ? window.innerWidth : 9999;
    /* Single-column hero only (< lg); avoids treating each ~472px column as “mobile” at 1024px+ */
    const stackedHero =
      typeof window !== 'undefined' && window.innerWidth < 1024;
    const narrowHero =
      stackedHero &&
      (cw <= 560 ||
        iw <= 640 ||
        (typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(max-width: 639px)').matches));
    const desktopHero = !isSecondary && iw >= 1024;
    /* Mobile: mat over lower bed (with cover + bg %). Desktop: extra shift in CSS (translateY) */
    const heroMatWorldYOffset = narrowHero ? -0.48 : desktopHero ? -0.82 : 0;
    hero3dRoot.position.y = 0.52 * t + 0.18 * t2 + heroMatWorldYOffset;
    hero3dRoot.position.z = -0.42 * t;

    /* Subtle opacity drift — large swings read as “dancing” over the mat */
    fieldGroup.children.forEach((tube, i) => {
      tube.material.opacity = 0.13 + Math.abs(Math.sin(tick * 0.006 + i * 0.55)) * 0.05;
    });

    skyUniforms.uTime.value = performance.now() * 0.001;

    controls.update();
    renderer.render(scene, camera);
    if (labelRenderer) labelRenderer.render(scene, camera);
  }
  animate();

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
    if (labelRenderer) labelRenderer.setSize(w, h);
  }
  function scheduleResize() {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      applyResize();
    });
  }
  window.addEventListener('resize', scheduleResize, { passive: true });

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => scheduleResize());
    ro.observe(container);
  }
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
        startScene(container, canvas, {});
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
      startScene(container, canvas, {});
    } catch (err) {
      console.error(err);
      showCanvasError(container, '3D preview hit an error. Open the browser console for details.');
    }
  }

  requestAnimationFrame(waitLayout);
}

function bootMatScroll() {
  const container = document.getElementById('canvas-container-scroll');
  const canvas = document.getElementById('mat-canvas-scroll');
  if (!container || !canvas) return;

  let frames = 0;
  function waitLayout() {
    frames++;
    const { w, h } = readCanvasSize(container);
    if (w >= 32 && h >= 32) {
      try {
        startScene(container, canvas, { secondary: true });
      } catch (err) {
        console.error(err);
        showCanvasError(container, 'Secondary 3D preview failed. See console.');
      }
      return;
    }
    if (frames < 120) {
      requestAnimationFrame(waitLayout);
      return;
    }
    try {
      startScene(container, canvas, { secondary: true });
    } catch (err) {
      console.error(err);
      showCanvasError(container, 'Secondary 3D preview failed. See console.');
    }
  }

  requestAnimationFrame(waitLayout);
}

function bootAllMat() {
  bootMat();
  if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bootMatScroll();
  }
}

if (document.readyState === 'complete') {
  requestAnimationFrame(bootAllMat);
} else {
  window.addEventListener('load', bootAllMat);
}
