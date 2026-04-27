/**
 * Hero WebGL orbit + mat rotation — same shape as `captureViewPreset()` in `lib/mat-scene.ts`.
 * Stored as JSON on `HeroSceneCamera` and injected into the marketing layout for the client scene.
 */

export type HeroSceneCameraConfig = {
  v: 1;
  distance: number;
  polarDeg: number;
  azimuthDeg: number;
  target: [number, number, number];
  mat: { order: string; x: number; y: number; z: number };
};

/** Matches current shipped defaults in `lib/mat-scene.ts` (orbit + mat pose). */
export const FALLBACK_HERO_SCENE_CAMERA: HeroSceneCameraConfig = {
  v: 1,
  distance: 17.961961,
  polarDeg: 77.844331,
  azimuthDeg: -94.868025,
  target: [0, 0.1, 0],
  mat: { order: 'YXZ', x: 0.471239, y: -0.829031, z: 0.218166 },
};

const EULER_ORDERS = new Set(['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX']);

function isFiniteNum(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

export function heroSceneCameraFromUnknown(raw: unknown): HeroSceneCameraConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (o.v !== 1) return null;
  if (!isFiniteNum(o.distance) || o.distance < 2 || o.distance > 80) return null;
  if (!isFiniteNum(o.polarDeg) || o.polarDeg < 0.5 || o.polarDeg > 89.5) return null;
  if (!isFiniteNum(o.azimuthDeg) || o.azimuthDeg < -720 || o.azimuthDeg > 720) return null;
  if (!Array.isArray(o.target) || o.target.length !== 3) return null;
  const [tx, ty, tz] = o.target;
  if (!isFiniteNum(tx) || !isFiniteNum(ty) || !isFiniteNum(tz)) return null;
  if (Math.abs(tx) > 200 || Math.abs(ty) > 200 || Math.abs(tz) > 200) return null;
  const mat = o.mat;
  if (!mat || typeof mat !== 'object') return null;
  const m = mat as Record<string, unknown>;
  const order = typeof m.order === 'string' && EULER_ORDERS.has(m.order) ? m.order : null;
  if (!order) return null;
  if (!isFiniteNum(m.x) || !isFiniteNum(m.y) || !isFiniteNum(m.z)) return null;
  if (Math.abs(m.x) > 10 || Math.abs(m.y) > 10 || Math.abs(m.z) > 10) return null;

  return {
    v: 1,
    distance: o.distance,
    polarDeg: o.polarDeg,
    azimuthDeg: o.azimuthDeg,
    target: [tx, ty, tz],
    mat: { order, x: m.x, y: m.y, z: m.z },
  };
}

export function parseHeroSceneCameraFromJson(raw: string): HeroSceneCameraConfig | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return heroSceneCameraFromUnknown(parsed);
  } catch {
    return null;
  }
}

export function tryParseHeroSceneCameraFromEditor(
  raw: string
): { ok: true; config: HeroSceneCameraConfig } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: 'JSON is empty.' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid JSON';
    return { ok: false, error: `JSON parse error: ${msg}` };
  }
  const config = heroSceneCameraFromUnknown(parsed);
  if (!config) {
    return {
      ok: false,
      error:
        'Invalid hero camera object. Expected v:1, distance, polarDeg, azimuthDeg, target[3], mat{order,x,y,z} with sane ranges.',
    };
  }
  return { ok: true, config };
}

export function heroSceneCameraToJson(config: HeroSceneCameraConfig): string {
  return JSON.stringify(config);
}
