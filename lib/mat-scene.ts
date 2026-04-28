// @ts-nocheck — procedural Three scene ported from legacy main.mjs; tighten types incrementally.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

import {
  FALLBACK_HERO_SCENE_CAMERA,
  heroSceneCameraFromUnknown,
  parseHeroSceneCameraFromJson,
} from './cms/hero-scene-camera';
import { DEFAULT_FEATURES_PRINT_PRESETS } from './cms/defaults';

const __g =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
      ? window
      : {};

/** Tear down WebGL + rAF from a prior `mat-scene` eval (Fast Refresh resets module lets but leaves GPU/loops running). */
export function teardownMarketingMatClient() {
  disposeMarketingMatScenes();
  __g.__MAGNAMAT_RUNTIME_ENTRY = false;
}

export function disposeMarketingMatScenes() {
  try {
    __g.__MAGNAMAT_DISPOSE_HERO?.();
  } catch (_) {}
  try {
    __g.__MAGNAMAT_DISPOSE_SCROLL?.();
  } catch (_) {}
  try {
    __g.__MAGNAMAT_DISPOSE_BRIDGE?.();
  } catch (_) {}
  __g.__MAGNAMAT_DISPOSE_HERO = null;
  __g.__MAGNAMAT_DISPOSE_SCROLL = null;
  __g.__MAGNAMAT_DISPOSE_BRIDGE = null;
  try {
    delete __g.__magnamatScene;
  } catch (_) {
    __g.__magnamatScene = undefined;
  }
  if (__g.__MAGNAMAT_FEATURES_VIEW_MODE_CLICK) {
    try {
      document.removeEventListener('click', __g.__MAGNAMAT_FEATURES_VIEW_MODE_CLICK, false);
    } catch (_) {}
    __g.__MAGNAMAT_FEATURES_VIEW_MODE_CLICK = null;
  }
  featuresViewModeDomDelegated = false;
}

function readFeaturesPrintPresetsFromDom() {
  if (typeof document === 'undefined') return DEFAULT_FEATURES_PRINT_PRESETS;
  const el = document.getElementById('magnamat-features-print-presets');
  if (!el || !el.textContent) return DEFAULT_FEATURES_PRINT_PRESETS;
  try {
    const v = JSON.parse(el.textContent) as unknown;
    if (!Array.isArray(v) || v.length === 0) return DEFAULT_FEATURES_PRINT_PRESETS;
    const out = [];
    for (const item of v) {
      if (!item || typeof item !== 'object') continue;
      const p = item;
      const id = typeof p.id === 'string' ? p.id.trim() : '';
      const label = typeof p.label === 'string' ? p.label.trim() : '';
      const topTextureUrl = typeof p.topTextureUrl === 'string' ? p.topTextureUrl.trim() : '';
      if (!id || !label || !topTextureUrl) continue;
      const caption = typeof p.caption === 'string' && p.caption.trim() ? p.caption.trim() : undefined;
      out.push({ id, label, caption, topTextureUrl });
    }
    return out.length > 0 ? out : DEFAULT_FEATURES_PRINT_PRESETS;
  } catch {
    return DEFAULT_FEATURES_PRINT_PRESETS;
  }
}

const FEATURES_VIEW_MODE_KEY = 'magnamat-features-view-mode';
const LEGACY_FEATURES_SUBSTRATE_KEY = 'magnamat-features-substrate';

let featuresViewModeDomDelegated = false;

function readFeaturesViewMode() {
  if (typeof window === 'undefined') return 'mug';
  try {
    const v = localStorage.getItem(FEATURES_VIEW_MODE_KEY);
    if (v === 'skyscraper' || v === 'coaster') return 'skyscraper';
    if (v === 'mug' || v === 'plain' || v === 'original') return 'mug';
    const leg = localStorage.getItem(LEGACY_FEATURES_SUBSTRATE_KEY);
    if (leg === 'coaster') return 'skyscraper';
    if (leg === 'mug') return 'mug';
  } catch (_) {}
  return 'mug';
}

function syncFeaturesViewModeToolbarActive(mode) {
  if (typeof document === 'undefined') return;
  const m = mode === 'skyscraper' ? 'skyscraper' : 'mug';
  document.querySelectorAll('#features [data-features-view-mode]').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    const v = node.getAttribute('data-features-view-mode');
    node.classList.toggle('features-print-presets__btn--active', v === m);
  });
}

function syncFeaturesViewModeCaption(mode) {
  const cap = document.getElementById('features-view-caption');
  if (!cap) return;
  const presets = readFeaturesPrintPresetsFromDom();
  const p0 = presets[0];
  if (mode === 'skyscraper') {
    cap.textContent =
      '3D-printed model — solid material, no image map (Site chrome art is only used for the mug preview).';
  } else {
    cap.textContent = p0?.caption ? `Mug · ${p0.caption}` : 'Mug wrap · demo art from first chrome preset.';
  }
}

function rebootFeaturesSecondaryWebgl() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    __g.__MAGNAMAT_DISPOSE_SCROLL?.();
  } catch (_) {}
  __g.__MAGNAMAT_DISPOSE_SCROLL = null;
  bootMatScroll();
}

function onFeaturesViewModeDocumentClick(e) {
  const el = clickTargetElement(e);
  if (!el) return;
  const btn = el.closest('[data-features-view-mode]');
  if (!btn || !document.getElementById('features')?.contains(btn)) return;
  const raw = btn.getAttribute('data-features-view-mode');
  const mode = raw === 'skyscraper' ? 'skyscraper' : 'mug';
  try {
    localStorage.setItem(FEATURES_VIEW_MODE_KEY, mode);
  } catch (_) {}
  syncFeaturesViewModeToolbarActive(mode);
  syncFeaturesViewModeCaption(mode);
  rebootFeaturesSecondaryWebgl();
}

function ensureFeaturesViewModeClickDelegated() {
  if (featuresViewModeDomDelegated) return;
  if (typeof document === 'undefined') return;
  featuresViewModeDomDelegated = true;
  __g.__MAGNAMAT_FEATURES_VIEW_MODE_CLICK = onFeaturesViewModeDocumentClick;
  document.addEventListener('click', __g.__MAGNAMAT_FEATURES_VIEW_MODE_CLICK, false);
}

function clickTargetElement(ev) {
  const t = ev.target;
  if (t instanceof Element) return t;
  if (t && typeof Node !== 'undefined' && t.nodeType === 3 && t.parentElement) return t.parentElement;
  return null;
}

/* ── Scroll reveal: IO + sync pass so above-the-fold blocks are not stuck at opacity 0 ── */
function setupReveal() {
  if (__g.__MAGNAMAT_SETUP_REVEAL) return;
  __g.__MAGNAMAT_SETUP_REVEAL = true;
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
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

/* ── Mat WebGL ── */
/**
 * After `WebGLRenderer.dispose()` + `forceContextLoss()`, the same `<canvas>` often cannot
 * acquire a new WebGL context; `new WebGLRenderer({ canvas })` then throws (e.g. null `precision`).
 */
function refreshMatCanvasHeroElement() {
  const existing = document.getElementById('mat-canvas');
  if (!existing?.parentNode) return null;
  const next = document.createElement('canvas');
  next.id = 'mat-canvas';
  next.setAttribute('role', 'img');
  next.tabIndex = 0;
  const label = existing.getAttribute('aria-label');
  if (label) next.setAttribute('aria-label', label);
  existing.classList.forEach((c) => next.classList.add(c));
  existing.replaceWith(next);
  return next;
}

function refreshMatCanvasScrollElement() {
  const existing = document.getElementById('mat-canvas-scroll');
  if (!existing?.parentNode) return null;
  const next = document.createElement('canvas');
  next.id = 'mat-canvas-scroll';
  next.setAttribute('aria-hidden', 'true');
  next.tabIndex = -1;
  existing.classList.forEach((c) => next.classList.add(c));
  existing.replaceWith(next);
  return next;
}

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
function persistZoomPreset(distance, controls) {
  const clamped = THREE.MathUtils.clamp(distance, controls.minDistance, controls.maxDistance);
  localStorage.setItem(ZOOM_PRESET_STORAGE_KEY, JSON.stringify({ v: 1, distance: clamped }));
  try {
    const raw = localStorage.getItem(VIEW_PRESET_STORAGE_KEY);
    if (!raw) return;
    const p = JSON.parse(raw);
    if (p && p.v === 1) {
      p.distance = clamped;
      localStorage.setItem(VIEW_PRESET_STORAGE_KEY, JSON.stringify(p));
    }
  } catch (_) {}
}

function clearZoomPreset() {
  localStorage.removeItem(ZOOM_PRESET_STORAGE_KEY);
}

function loadFullViewPresetFromLocalStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(VIEW_PRESET_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return heroSceneCameraFromUnknown(parsed);
  } catch (_) {
    return null;
  }
}

/** Server-injected JSON from `app/(marketing)/layout.tsx` (see `#magnamat-hero-scene-config`). */
function loadHeroSceneFromDom() {
  if (typeof document === 'undefined') return null;
  const el = document.getElementById('magnamat-hero-scene-config');
  const raw = el?.textContent?.trim();
  if (!raw) return null;
  return parseHeroSceneCameraFromJson(raw);
}

function resolveHeroScenePreset(isAdjustMode) {
  if (isAdjustMode) {
    const ls = loadFullViewPresetFromLocalStorage();
    if (ls) return ls;
  }
  const fromDom = loadHeroSceneFromDom();
  if (fromDom) return fromDom;
  return FALLBACK_HERO_SCENE_CAMERA;
}

function applyHeroSceneCameraState(camera, controls, matGroup, isAdjustMode) {
  const preset = resolveHeroScenePreset(isAdjustMode);
  const orbitTarget = new THREE.Vector3(preset.target[0], preset.target[1], preset.target[2]);
  controls.target.copy(orbitTarget);
  const camSph = new THREE.Spherical(
    preset.distance,
    THREE.MathUtils.degToRad(preset.polarDeg),
    THREE.MathUtils.degToRad(preset.azimuthDeg)
  );
  camera.position.setFromSpherical(camSph).add(orbitTarget);
  camera.lookAt(orbitTarget);
  controls.update();

  matGroup.rotation.order = preset.mat.order;
  matGroup.rotation.x = preset.mat.x;
  matGroup.rotation.y = preset.mat.y;
  matGroup.rotation.z = preset.mat.z;

  const zoomOnly = loadZoomOnlyPreset();
  if (zoomOnly !== null) {
    applyOrbitDistance(camera, controls, zoomOnly);
  }
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

function installViewTuner(container, ctx) {
  if (!ctx.isAdjustMode) return;

  const { camera, controls, matGroup } = ctx;
  const fixedSheet =
    typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)')?.matches;
  const wrap = document.createElement('div');
  wrap.className = 'view-tuner-panel';
  wrap.style.cssText = fixedSheet
    ? 'position:fixed;left:0;right:0;bottom:0;z-index:220;max-height:min(48vh,380px);overflow:auto;padding:14px 16px calc(14px + env(safe-area-inset-bottom,0px));border-radius:16px 16px 0 0;background:rgba(255,255,255,0.98);border:1px solid rgba(0,0,0,0.1);border-bottom:none;font:12px/1.45 system-ui,-apple-system,sans-serif;box-shadow:0 -8px 32px rgba(22,22,22,0.12);color:#141414;'
    : 'position:absolute;left:8px;right:8px;bottom:8px;z-index:6;max-height:46%;overflow:auto;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,0.96);border:1px solid rgba(0,0,0,0.1);font:12px/1.45 system-ui,-apple-system,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,0.12);color:#141414;';

  const title = document.createElement('div');
  title.textContent = '3D view lock-in (?adjust=1)';
  title.style.cssText = 'font-weight:600;margin-bottom:8px;font-size:13px;';

  const hint = document.createElement('p');
  hint.style.cssText = 'margin:0 0 10px;color:#555;font-size:11px;line-height:1.45;';
  hint.textContent = fixedSheet
    ? 'Drag to orbit; pinch to zoom. Save view = this device only. Copy JSON → Admin → Site & metadata → Hero 3D camera → paste & save. Open CMS opens /admin. Clear removes local saves and reloads. Remove ?adjust=1 to hide.'
    : 'Drag to orbit; scroll to zoom on the canvas. Save view stores this browser only (while ?adjust=1). Copy JSON, then in CMS → Site & metadata → Hero 3D camera, paste and save for everyone. Open CMS opens /admin in a new tab. Save zoom only keeps wheel distance in localStorage without ?adjust=1. Clear removes local saves and reloads.';

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

  const bSave = btn('Save view (this device)', true);
  bSave.addEventListener('click', () => {
    const p = captureViewPreset(camera, controls, matGroup);
    localStorage.setItem(VIEW_PRESET_STORAGE_KEY, JSON.stringify(p));
    persistZoomPreset(p.distance, controls);
    bSave.textContent = 'Saved ✓';
    setTimeout(() => {
      bSave.textContent = 'Save view (this device)';
    }, 1600);
    console.info('[magnamat] View saved to localStorage. Paste JSON into CMS → Hero 3D camera to publish for all visitors.');
  });

  const bSaveZoom = btn('Save zoom only (local)', false);
  bSaveZoom.addEventListener('click', () => {
    persistZoomPreset(orbitDistance(camera, controls), controls);
    bSaveZoom.textContent = 'Zoom saved ✓';
    setTimeout(() => {
      bSaveZoom.textContent = 'Save zoom only (local)';
    }, 1600);
    console.info('[magnamat] Orbit distance saved to localStorage (applies without ?adjust=1).');
  });

  const bCopyJson = btn('Copy JSON', false);
  bCopyJson.addEventListener('click', async () => {
    const p = captureViewPreset(camera, controls, matGroup);
    const text = JSON.stringify(p, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      bCopyJson.textContent = 'Copied ✓';
      setTimeout(() => {
        bCopyJson.textContent = 'Copy JSON';
      }, 1400);
    } catch {
      console.log(text);
      alert('Copy failed — printed to console.');
    }
  });

  const bCms = btn('Open CMS', false);
  bCms.addEventListener('click', () => {
    window.open('/admin', '_blank', 'noopener,noreferrer');
  });

  const bClear = btn('Clear local & reload', false);
  bClear.addEventListener('click', () => {
    localStorage.removeItem(VIEW_PRESET_STORAGE_KEY);
    clearZoomPreset();
    window.location.reload();
  });

  wrap.append(title, hint, readout, bSave, bSaveZoom, bCopyJson, bCms, bClear);
  (fixedSheet ? document.body : container).appendChild(wrap);

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
      depthTest: false,
      depthWrite: false,
    });
    const line = new THREE.Line(geom, mat);
    line.renderOrder = 10000;
    parent.add(line);
  }

  function addDot(parent, x, y, z, color) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 10, 10),
      new THREE.MeshBasicMaterial({
        color,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        opacity: 0.92,
      })
    );
    mesh.position.set(x, y, z);
    mesh.renderOrder = 10001;
    parent.add(mesh);
  }

  function makeLabel(text, accentClass) {
    const div = document.createElement('div');
    div.className = `mat-callout-2d${accentClass ? ` ${accentClass}` : ''}`;
    div.textContent = text;
    return new CSS2DObject(div);
  }

  const yTop = AFFIX_THICK / 2 + 0.02;
  const yBase = AFFIX_THICK / 2 + 0.02;

  const tsA = { x: -2.45, y: yTop, z: 2.05 };
  const tsB = { x: -5.15, y: 0.88, z: 4.05 };
  addLeader(topAffix, tsA.x, tsA.y, tsA.z, tsB.x, tsB.y, tsB.z);
  addDot(topAffix, tsA.x, tsA.y, tsA.z, 0x3b9be5);
  const tsL = makeLabel('Top sheet', 'mat-callout-2d--sheet');
  tsL.position.set(tsB.x, tsB.y, tsB.z);
  topAffix.add(tsL);

  const pA = { x: 2.05, y: 0.3, z: 1.28 };
  const pB = { x: 5.75, y: 0.72, z: 2.75 };
  addLeader(coreGroup, pA.x, pA.y, pA.z, pB.x, pB.y, pB.z);
  addDot(coreGroup, pA.x, pA.y, pA.z, 0xe5342a);
  const pL = makeLabel('Pin matrix', 'mat-callout-2d--pins');
  pL.position.set(pB.x, pB.y, pB.z);
  coreGroup.add(pL);

  const narrow =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(max-width: 639px)').matches;
  if (!narrow) {
    const fA = { x: 1.25, y: yBase, z: 2.28 };
    const fB = { x: 4.65, y: 0.2, z: 4.85 };
    addLeader(bottomAffix, fA.x, fA.y, fA.z, fB.x, fB.y, fB.z);
    addDot(bottomAffix, fA.x, fA.y, fA.z, 0xc5d0da);
    const fL = makeLabel('Flex steel', 'mat-callout-2d--steel');
    fL.position.set(fB.x, fB.y, fB.z);
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

/** Linear scale for features-section mug (must match `getMugBarbPositionsXZ`). */
const SIDE_MUG_SCALE = 2.9;
/**
 * Linear scale for features-section skyscraper (`getSkyscraperBarbPositionsXZ` uses the same footprint).
 * Width / depth / height factors are multiplied by this in `createSkyscraperInJig`.
 */
const SIDE_SKYSCRAPER_SCALE = 4.2;
const SKY_TOWER_W = 0.2;
const SKY_TOWER_D = 0.09;
const SKY_TOWER_H = 0.56;
const SKY_CROWN_H = 0.07;

/**
 * Eight barb (registration peg) positions in jigRoot XZ — **tight** to the scaled mug.
 * Hero uses fixed hw/hd + barbInset; those +0.055 / +0.085 edge offsets are for ~2×1.5 m blanks
 * and were leaving the mug visually “unheld” if reused here.
 */
function getMugBarbPositionsXZ(scale) {
  const s = scale;
  const cupHalfX = (0.52 * s) / 2;
  const radiusTop = 0.158 * s;
  const radiusBot = 0.142 * s;
  const rFoot = Math.max(radiusTop, radiusBot);
  const handleRmaj = 0.092 * s;
  const handleRmin = 0.023 * s;
  const handleZ = radiusTop * 0.9;
  const mugHalfZ = Math.max(rFoot, handleZ + handleRmaj + handleRmin);
  const clearance = 0.026;
  const bx = cupHalfX + clearance;
  const bz = mugHalfZ + clearance;
  const n = 0.014;
  return [
    [bx, bz],
    [bx, -bz],
    [-bx, bz],
    [-bx, -bz],
    [0, bz + n],
    [0, -(bz + n)],
    [-(bx + n), 0],
    [bx + n, 0],
  ];
}

/**
 * Eight barb positions around the skyscraper footprint (XZ bounds of tower + crown).
 */
function getSkyscraperBarbPositionsXZ(scale) {
  const s = scale;
  const hx = (SKY_TOWER_W * s) / 2 + 0.02;
  const hz = (SKY_TOWER_D * s) / 2 + 0.02;
  const clearance = 0.028;
  const bx = hx + clearance;
  const bz = hz + clearance;
  const n = 0.014;
  return [
    [bx, bz],
    [bx, -bz],
    [-bx, bz],
    [-bx, -bz],
    [0, bz + n],
    [0, -(bz + n)],
    [-(bx + n), 0],
    [bx + n, 0],
  ];
}

/**
 * Features jig: simple skyscraper as a **3D-printed part** — uniform FDM-style plastic, no image map
 * (contrast with mug / flat blank, which show wrap preview art).
 */
function createSkyscraperInJig() {
  const group = new THREE.Group();
  const s = SIDE_SKYSCRAPER_SCALE;
  const w = SKY_TOWER_W * s;
  const h = SKY_TOWER_H * s;
  const d = SKY_TOWER_D * s;

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0xd2d6dc,
    roughness: 0.68,
    metalness: 0.03,
  });
  const crownMat = new THREE.MeshStandardMaterial({
    color: 0xa8b0bc,
    roughness: 0.64,
    metalness: 0.05,
  });

  const towerGeo = new THREE.BoxGeometry(w, h, d);
  const tower = new THREE.Mesh(towerGeo, shellMat);
  tower.castShadow = true;
  tower.receiveShadow = true;
  tower.position.y = h / 2 + 0.0005;
  group.add(tower);

  const crownH = SKY_CROWN_H * s;
  const crownW = w * 0.68;
  const crownD = d * 0.92;
  const crownGeo = new THREE.BoxGeometry(crownW, crownH, crownD);
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.position.y = h + crownH / 2 + 0.0002;
  crown.castShadow = true;
  crown.receiveShadow = true;
  group.add(crown);

  group.updateMatrixWorld(true);
  const bbox = new THREE.Box3().setFromObject(group);
  const lift = -bbox.min.y + 0.0005;
  group.position.set(0, lift, 0);

  return { group, shellMat };
}

/**
 * Features jig: ceramic mug lying on its side (axis along X, opening toward +X).
 * Print texture maps to the **outer** wall only (`printMat`); interior uses dark
 * ceramic (open-ended outer + inner BackSide shell + inner caps — no wrap on the inside).
 */
function createMugOnSideInJig() {
  const group = new THREE.Group();
  const s = SIDE_MUG_SCALE;
  const cupLen = 0.52 * s;
  const radiusTop = 0.158 * s;
  const radiusBot = 0.142 * s;
  const wall = 0.016 * s;
  const innerRadiusTop = Math.max(radiusTop - wall, 0.022 * s);
  const innerRadiusBot = Math.max(radiusBot - wall, 0.02 * s);

  const printMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.FrontSide,
  });
  const ceramicMat = new THREE.MeshStandardMaterial({
    color: 0xeaedf2,
    roughness: 0.5,
    metalness: 0.08,
  });
  const innerDarkMat = new THREE.MeshStandardMaterial({
    color: 0x1a1512,
    roughness: 0.92,
    metalness: 0,
  });
  const innerWallMat = innerDarkMat.clone();
  innerWallMat.side = THREE.BackSide;

  /* Outer shell only — no end caps on this mesh so the wrap never appears on interior disks. */
  const bodyGeom = new THREE.CylinderGeometry(radiusTop, radiusBot, cupLen, 48, 1, true);
  bodyGeom.rotateZ(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeom, printMat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  /* Inner wall: BackSide so it is visible from inside the cavity, culled from outside. */
  const innerWallGeom = new THREE.CylinderGeometry(
    innerRadiusTop,
    innerRadiusBot,
    cupLen * 0.998,
    48,
    1,
    true
  );
  innerWallGeom.rotateZ(Math.PI / 2);
  const innerWall = new THREE.Mesh(innerWallGeom, innerWallMat);
  innerWall.castShadow = false;
  innerWall.receiveShadow = true;
  group.add(innerWall);

  /* Closed bottom — ceramic outside, dark inside (same opening rim/inner as before). */
  const bottomOuterGeom = new THREE.CircleGeometry(radiusTop, 48);
  bottomOuterGeom.rotateY(-Math.PI / 2);
  const bottomOuter = new THREE.Mesh(bottomOuterGeom, ceramicMat);
  bottomOuter.position.set(-cupLen / 2 - 0.0005, 0, 0);
  bottomOuter.castShadow = true;
  group.add(bottomOuter);

  const bottomInnerGeom = new THREE.CircleGeometry(innerRadiusTop * 0.98, 32);
  bottomInnerGeom.rotateY(Math.PI / 2);
  const bottomInner = new THREE.Mesh(bottomInnerGeom, innerDarkMat);
  bottomInner.position.set(-cupLen / 2 + 0.0022, 0, 0);
  bottomInner.receiveShadow = true;
  group.add(bottomInner);

  const rimGeom = new THREE.RingGeometry(radiusBot * 0.45, radiusTop * 0.998, 40);
  rimGeom.rotateY(-Math.PI / 2);
  const rim = new THREE.Mesh(rimGeom, ceramicMat);
  rim.position.set(cupLen / 2 + 0.0008, 0, 0);
  rim.castShadow = true;
  group.add(rim);

  const innerGeom = new THREE.CircleGeometry(radiusBot * 0.86, 32);
  innerGeom.rotateY(-Math.PI / 2);
  const inner = new THREE.Mesh(innerGeom, innerDarkMat);
  inner.position.set(cupLen / 2 + 0.0024, 0, 0);
  group.add(inner);

  const handleGeom = new THREE.TorusGeometry(0.092 * s, 0.023 * s, 8, 26, Math.PI * 1.28);
  const handle = new THREE.Mesh(handleGeom, ceramicMat);
  handle.rotation.order = 'XYZ';
  handle.rotation.x = Math.PI / 2;
  handle.rotation.z = Math.PI * 0.2;
  handle.position.set(-0.015 * s, -radiusBot * 0.32, radiusTop * 0.9);
  handle.castShadow = true;
  group.add(handle);

  /* Seat on jig / insert pad: torus/handle can extend below cylinder — don’t guess from radius alone. */
  group.updateMatrixWorld(true);
  const mugBox = new THREE.Box3().setFromObject(group);
  const lift = -mugBox.min.y + 0.0006;
  group.position.set(0, lift, 0);

  return { group, printMat };
}

/** Tuning mode: accept adjust=1 / true / yes (case-insensitive); optional hash e.g. #adjust=1 */
function isAdjustModeFromUrl(isSecondary) {
  if (isSecondary || typeof window === 'undefined') return false;
  const q = new URLSearchParams(window.location.search);
  let raw = q.get('adjust');
  if (raw == null && window.location.hash) {
    let h = window.location.hash.replace(/^#/, '');
    if (h.startsWith('?')) h = h.slice(1);
    if (/^adjust=|[&?]adjust=/i.test(h)) {
      raw = new URLSearchParams(h).get('adjust');
    }
  }
  if (raw == null) return false;
  const v = String(raw).trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function startScene(container, canvas, options = {}) {
  const isSecondary = options.secondary === true;
  const featuresViewMode = isSecondary ? readFeaturesViewMode() : 'mug';
  const isAdjustMode = isAdjustModeFromUrl(isSecondary);

  let { w: W, h: H } = readCanvasSize(container);
  if (W < 32 || H < 32) {
    W = Math.max(W, 640);
    H = Math.max(H, 400);
  }

  if (!(canvas instanceof HTMLCanvasElement) || !canvas.isConnected) {
    showCanvasError(container, '3D canvas is not available. Try refreshing the page.');
    return;
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
        /*
         * Moderate alpha so the HTML hero photo (Eufy plate) stays visible through the canvas.
         * Higher values read as an opaque gray plane over the reference image behind WebGL.
         */
        float washAlpha = 0.2 + h * 0.12;
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
  let mqNarrowForDispose = null;
  let mqTouchForDispose = null;
  let onOrbitMediaChangeForDispose = null;
  if (typeof window !== 'undefined' && window.matchMedia) {
    mqNarrowForDispose = window.matchMedia('(max-width: 767px)');
    mqTouchForDispose = window.matchMedia('(hover: none) and (pointer: coarse)');
    onOrbitMediaChangeForDispose = () => applyTouchOrbitPolicy();
    if (mqNarrowForDispose.addEventListener) {
      mqNarrowForDispose.addEventListener('change', onOrbitMediaChangeForDispose);
      mqTouchForDispose.addEventListener('change', onOrbitMediaChangeForDispose);
    } else {
      mqNarrowForDispose.addListener(onOrbitMediaChangeForDispose);
      mqTouchForDispose.addListener(onOrbitMediaChangeForDispose);
    }
  }

  /* iOS: tabindex=0 canvas often eats the first tap for focus; tuning needs immediate orbit */
  if (isAdjustMode && !isSecondary) {
    canvas.tabIndex = -1;
  }
  controls.minDistance = 5.5;
  controls.maxDistance = 28;
  /* Let you orbit more overhead without hitting the clamp */
  controls.minPolarAngle = 0.06;
  controls.maxPolarAngle = Math.PI / 2 - 0.04;

  /* Camera + mat pose applied after `matGroup` is built — DB script tag, or ?adjust=1 localStorage, or fallback. */

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
  /*
   * Group + plate mesh (not Mesh-as-parent for jig): children of Mesh can depth-sort oddly vs
   * the parent’s own geometry, so the mug read “floating” above the blue sheet.
   */
  const topAffix = new THREE.Group();
  topAffix.position.y = pinTopY + GAP_ABOVE + AFFIX_THICK / 2;
  const topAffixPlate = new THREE.Mesh(topAffixGeo, topAffixMat);
  topAffixPlate.castShadow = true;
  topAffixPlate.receiveShadow = true;
  topAffix.add(topAffixPlate);
  matGroup.add(topAffix);

  /*
   * Jig tooling on the top sheet (additive only): registration barbs + one held blank.
   * Origin on the plate’s **top face** (group Y = +AFFIX_THICK/2); y=0 is the contact plane.
   */
  const jigRoot = new THREE.Group();
  jigRoot.position.set(0, AFFIX_THICK / 2 + 0.0004, 0);
  topAffix.add(jigRoot);

  const hw = 1.02;
  const hd = 0.76;
  const barbInset = 0.072;
  const BARB_H = 0.115;
  const barbGeo = new THREE.CylinderGeometry(0.036, 0.024, BARB_H, 12);
  const barbMat = new THREE.MeshStandardMaterial({
    color: 0x3a434c,
    roughness: 0.4,
    metalness: 0.48,
  });
  const bx = hw + barbInset;
  const bz = hd + barbInset;
  const barbPositions = isSecondary
    ? featuresViewMode === 'skyscraper'
      ? getSkyscraperBarbPositionsXZ(SIDE_SKYSCRAPER_SCALE)
      : getMugBarbPositionsXZ(SIDE_MUG_SCALE)
    : [
        [bx, bz],
        [bx, -bz],
        [-bx, bz],
        [-bx, -bz],
        [0, bz + 0.055],
        [0, -(bz + 0.055)],
        [-(bx + 0.085), 0],
        [bx + 0.085, 0],
      ];
  barbPositions.forEach(([x, z]) => {
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
  /* Hero: flat printable blank. Features (secondary): view mode picks geometry + art. */
  let heldPrintMat = itemTopMat;
  if (isSecondary) {
    if (featuresViewMode === 'skyscraper') {
      const tower = createSkyscraperInJig();
      heldPrintMat = tower.shellMat;
      jigRoot.add(tower.group);
    } else {
      const mug = createMugOnSideInJig();
      heldPrintMat = mug.printMat;
      jigRoot.add(mug.group);
    }
  } else {
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
  }

  const printPresets = readFeaturesPrintPresetsFromDom();
  const initialPrintUrl = printPresets[0]?.topTextureUrl || '/images/print-demo-chicago-bean.png';

  let activePrintMap = null;
  function disposeActivePrintMap() {
    if (activePrintMap) {
      activePrintMap.dispose();
      activePrintMap = null;
    }
  }

  function applyPrintTextureUrl(url, onFail) {
    new THREE.TextureLoader().load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        disposeActivePrintMap();
        activePrintMap = tex;
        heldPrintMat.map = tex;
        heldPrintMat.needsUpdate = true;
      },
      undefined,
      () => {
        console.warn('[magnamat] Print texture failed to load:', url);
        if (typeof onFail === 'function') onFail();
      }
    );
  }

  if (!isSecondary) {
    applyPrintTextureUrl(initialPrintUrl);
  } else if (featuresViewMode === 'skyscraper') {
    disposeActivePrintMap();
    heldPrintMat.map = null;
    heldPrintMat.needsUpdate = true;
  } else {
    applyPrintTextureUrl(initialPrintUrl);
  }

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
    /* Features canvas: keep stack closed so the jig + mug read as one held assembly (not “exploded”). */
    if (isSecondary) return 0;
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
    if (isSecondary) return 0;
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

  function onCanvasPointerMove(e) {
    pointerOverCanvas = true;
    lastClientX = e.clientX;
    lastClientY = e.clientY;
    updatePointerRay(lastClientX, lastClientY);
    canvas.style.cursor = hoverStack ? 'pointer' : '';
  }
  function onCanvasPointerLeave() {
    pointerOverCanvas = false;
    hoverStack = 0;
    canvas.style.cursor = '';
  }
  function onCanvasPointerDown(e) {
    pointerOverCanvas = true;
    lastClientX = e.clientX;
    lastClientY = e.clientY;
    updatePointerRay(lastClientX, lastClientY);
  }
  canvas.addEventListener('pointermove', onCanvasPointerMove);
  canvas.addEventListener('pointerleave', onCanvasPointerLeave);
  canvas.addEventListener('pointerdown', onCanvasPointerDown, { passive: true });

  applyHeroSceneCameraState(camera, controls, matGroup, isAdjustMode);
  if (isSecondary) {
    /*
     * Hero camera aims at a tall hero composition; the features jig reads low with extra “sky”
     * above it. Nudge orbit slightly more equatorial + closer, and lift the stack vs hero offsets.
     */
    const off = camera.position.clone().sub(controls.target);
    const sph = new THREE.Spherical().setFromVector3(off);
    sph.phi = THREE.MathUtils.clamp(
      sph.phi + THREE.MathUtils.degToRad(7),
      controls.minPolarAngle + 0.02,
      controls.maxPolarAngle - 0.02
    );
    sph.radius = THREE.MathUtils.clamp(sph.radius * 0.93, controls.minDistance + 0.02, controls.maxDistance - 0.02);
    camera.position.setFromSpherical(sph).add(controls.target);
    camera.lookAt(controls.target);
    controls.update();
  }
  hero3dRoot.add(matGroup);

  /* Dev: orbit to the angle you want, then run __magnamatScene.logDefaultAngle() in the console → paste into CMS Hero 3D camera JSON */
  if (typeof window !== 'undefined' && !isSecondary) {
    window.__magnamatScene = {
      camera,
      controls,
      matGroup,
      saveLockedView() {
        const p = captureViewPreset(camera, controls, matGroup);
        localStorage.setItem(VIEW_PRESET_STORAGE_KEY, JSON.stringify(p));
        persistZoomPreset(p.distance, controls);
        console.info('[magnamat] View saved to localStorage. Publish with CMS → Site & metadata → Hero 3D camera (paste JSON from __magnamatScene.copyJsonForCms()).');
        return p;
      },
      saveDefaultZoom() {
        persistZoomPreset(orbitDistance(camera, controls), controls);
        console.info('[magnamat] Default zoom saved to localStorage key magnamat-default-zoom.');
        return orbitDistance(camera, controls);
      },
      clearLockedView() {
        localStorage.removeItem(VIEW_PRESET_STORAGE_KEY);
        clearZoomPreset();
        console.info('[magnamat] Cleared saved view and default zoom. Reload to use CMS / bundled hero camera.');
      },
      clearDefaultZoom() {
        clearZoomPreset();
        console.info('[magnamat] Cleared magnamat-default-zoom only. Reload to drop zoom override.');
      },
      async copyJsonForCms() {
        const text = JSON.stringify(captureViewPreset(camera, controls, matGroup), null, 2);
        try {
          await navigator.clipboard.writeText(text);
          console.info('[magnamat] Hero camera JSON copied — paste into Admin → Site & metadata → Hero 3D camera.');
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
        console.log('%c[magnamat] Paste into CMS Hero 3D camera (or lib/mat-scene constants):\n', 'font-weight:bold;color:#0a7;', full);
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
      '[magnamat] Quick tune: ?adjust=1 panel — or __magnamatScene.saveLockedView() / saveDefaultZoom() / copyJsonForCms() / logDefaultAngle()'
    );
    installViewTuner(container, { camera, controls, matGroup, isAdjustMode });
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
  if (isSecondary) {
    fieldGroup.visible = false;
  }

  let tabSuspended = false;
  function onVisibilityChangeForMat() {
    tabSuspended = document.visibilityState === 'hidden';
  }
  document.addEventListener('visibilitychange', onVisibilityChangeForMat);

  let lastW = W;
  let lastH = H;
  let tick = 0;
  let sceneAlive = true;
  let animRaf = 0;
  function animate() {
    if (!sceneAlive) return;
    animRaf = requestAnimationFrame(animate);
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
    /* Features canvas: do not reuse hero’s negative Y drops — they leave empty sky above the jig. */
    const yBase = isSecondary ? 0.38 : 0.52 * t + 0.18 * t2 + heroMatWorldYOffset;
    hero3dRoot.position.y = yBase;
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

  let resizeObserver = null;
  const disposeScene = () => {
    sceneAlive = false;
    if (animRaf) cancelAnimationFrame(animRaf);
    animRaf = 0;
    document.removeEventListener('visibilitychange', onVisibilityChangeForMat);
    canvas.removeEventListener('pointermove', onCanvasPointerMove);
    canvas.removeEventListener('pointerleave', onCanvasPointerLeave);
    canvas.removeEventListener('pointerdown', onCanvasPointerDown);
    window.removeEventListener('resize', scheduleResize, { passive: true });
    try {
      resizeObserver?.disconnect();
    } catch (_) {}
    resizeObserver = null;
    if (mqNarrowForDispose && onOrbitMediaChangeForDispose) {
      try {
        if (mqNarrowForDispose.removeEventListener) {
          mqNarrowForDispose.removeEventListener('change', onOrbitMediaChangeForDispose);
          mqTouchForDispose.removeEventListener('change', onOrbitMediaChangeForDispose);
        } else {
          mqNarrowForDispose.removeListener(onOrbitMediaChangeForDispose);
          mqTouchForDispose.removeListener(onOrbitMediaChangeForDispose);
        }
      } catch (_) {}
    }
    try {
      controls.dispose();
    } catch (_) {}
    try {
      renderer.dispose();
      if (renderer.forceContextLoss) renderer.forceContextLoss();
    } catch (_) {}
    if (labelRenderer && container) {
      try {
        const el = labelRenderer.domElement;
        if (el && el.parentNode) el.parentNode.removeChild(el);
      } catch (_) {}
    }
  };
  if (isSecondary) {
    __g.__MAGNAMAT_DISPOSE_SCROLL = disposeScene;
  } else {
    __g.__MAGNAMAT_DISPOSE_HERO = disposeScene;
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
    resizeObserver = new ResizeObserver(() => scheduleResize());
    resizeObserver.observe(container);
  }
}

function bootMat() {
  __g.__MAGNAMAT_DISPOSE_HERO?.();
  __g.__MAGNAMAT_DISPOSE_HERO = null;
  const container = document.getElementById('canvas-container');
  if (!container) return;
  /* Fresh node whenever we boot — avoids “dead” canvas after dispose + forceContextLoss (Strict Mode / HMR). */
  refreshMatCanvasHeroElement();
  const canvas = document.getElementById('mat-canvas');
  if (!(canvas instanceof HTMLCanvasElement)) return;

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
  __g.__MAGNAMAT_DISPOSE_SCROLL?.();
  __g.__MAGNAMAT_DISPOSE_SCROLL = null;
  const container = document.getElementById('canvas-container-scroll');
  if (!container) return;
  refreshMatCanvasScrollElement();
  const canvas = document.getElementById('mat-canvas-scroll');
  if (!(canvas instanceof HTMLCanvasElement)) return;

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

function smoothstep01(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/** Scroll through features headline slot → grow clip, fade second mat, ease three cards downward */
function setupFeatures3dReveal() {
  const bridge = document.getElementById('features-3d-reveal');
  const inner = bridge?.querySelector('.features-3d-reveal__host');
  const cards = document.querySelector('.js-features-cards-shift');
  if (!bridge || !inner) return;

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let shown = 0;

  /** Match bridge open distance to the fixed canvas box (hero-canvas-h clamp), not an arbitrary cap */
  function bridgeRevealHeightPx() {
    const box = document.getElementById('canvas-container-scroll');
    if (!box) return 320;
    const h = box.offsetHeight;
    if (h >= 80) return Math.round(h);
    const vh = window.innerHeight || 700;
    return Math.round(Math.min(560, Math.max(220, vh * 0.38)));
  }

  function scrollTarget01() {
    if (reduceMotion) return 0;
    const vh = window.innerHeight || 1;
    const top = bridge.getBoundingClientRect().top;
    const navEl = document.querySelector('.site-nav');
    const navH = navEl ? Math.ceil(navEl.getBoundingClientRect().height) : 66;
    /* Fully open (1) when the slot reaches the top under the nav — not after it scrolls past */
    const openTop = navH + 2;
    const denom = Math.max(80, vh - openTop);
    const u = (vh - top) / denom;
    return smoothstep01(Math.max(0, Math.min(1, u)));
  }

  let bridgeRaf = 0;
  let bridgeAlive = true;
  function tickBridge() {
    if (!bridgeAlive) return;
    bridgeRaf = requestAnimationFrame(tickBridge);
    const target = scrollTarget01();
    /* Slightly snappier so height/opacity track “fully open at top” without visible lag */
    const ease = reduceMotion ? 1 : 0.14;
    shown += (target - shown) * ease;
    if (Math.abs(target - shown) < 0.00015) shown = target;

    const hReveal = bridgeRevealHeightPx();
    const h = shown * hReveal;
    bridge.style.height = `${h}px`;

    /* Fade in once the clip is tall enough to read the mat (not while squashed in first few px) */
    const fadeStart = 0.18;
    const opFade = smoothstep01(Math.max(0, (shown - fadeStart) / (1 - fadeStart)));

    if (inner) {
      inner.style.opacity = String(opFade);
      inner.style.pointerEvents = opFade < 0.04 ? 'none' : 'auto';
      inner.style.transform = `translate3d(0, ${(1 - opFade) * 12}px, 0)`;
    }

    const slidePx = 44;
    if (cards) cards.style.transform = `translate3d(0, ${shown * slidePx}px, 0)`;
  }

  __g.__MAGNAMAT_DISPOSE_BRIDGE?.();
  __g.__MAGNAMAT_DISPOSE_BRIDGE = () => {
    bridgeAlive = false;
    if (bridgeRaf) cancelAnimationFrame(bridgeRaf);
    bridgeRaf = 0;
  };
  bridgeRaf = requestAnimationFrame(tickBridge);
}

function bootAllMat() {
  disposeMarketingMatScenes();
  /* View-mode strip: works even when secondary WebGL is skipped (e.g. reduced motion). */
  ensureFeaturesViewModeClickDelegated();
  const vm = readFeaturesViewMode();
  syncFeaturesViewModeToolbarActive(vm);
  syncFeaturesViewModeCaption(vm);
  bootMat();
  /* Boot with hero-sized box even while clip height is 0 — reveal is overflow clip */
  if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bootMatScroll();
  }
  setupFeatures3dReveal();
}

/** Call once from a client component after the marketing DOM is mounted (Next.js). */
export function bootMarketingMatRuntime() {
  if (__g.__MAGNAMAT_RUNTIME_ENTRY) return;
  __g.__MAGNAMAT_RUNTIME_ENTRY = true;
  setupReveal();
  if (document.readyState === 'complete') {
    requestAnimationFrame(bootAllMat);
  } else {
    window.addEventListener('load', bootAllMat, { once: true });
  }
}

/* Fast Refresh can replace this module without re-running `ClientRuntime`’s effect — dispose stale WebGL. */
if (typeof import.meta !== 'undefined' && import.meta.hot) {
  import.meta.hot.dispose(() => {
    teardownMarketingMatClient();
  });
}
