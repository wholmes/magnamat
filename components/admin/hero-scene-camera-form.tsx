'use client';

import { useActionState } from 'react';

import type { SaveState } from '@/app/admin/actions';
import { saveHeroSceneCamera } from '@/app/admin/actions';
import { FALLBACK_HERO_SCENE_CAMERA } from '@/lib/cms/hero-scene-camera';

type Props = { initialJson: string };

export function HeroSceneCameraForm({ initialJson }: Props) {
  const [state, formAction, pending] = useActionState(saveHeroSceneCamera, undefined as SaveState | undefined);

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 13, color: '#52525b', margin: 0, lineHeight: 1.55 }}>
        Orbit distance, polar/azimuth (degrees), look-at target, and <code>matGroup</code> Euler rotation. Tune
        with <code>?adjust=1</code> on the homepage, then <strong>Save as locked default</strong> (local) and paste the
        same JSON shape here — or use <strong>Copy snippet</strong> and merge values manually.
      </p>
      <p style={{ fontSize: 12, color: '#71717a', margin: 0, lineHeight: 1.45 }}>
        Example defaults: <code style={{ fontSize: 11 }}>{JSON.stringify(FALLBACK_HERO_SCENE_CAMERA)}</code>
      </p>
      <textarea
        name="configJson"
        required
        rows={18}
        defaultValue={initialJson}
        spellCheck={false}
        data-lpignore="true"
        data-1p-ignore="true"
        data-bwignore="true"
        style={{
          width: '100%',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 12,
          lineHeight: 1.45,
          padding: 12,
          borderRadius: 8,
          border: '1px solid #d4d4d8',
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />
      {state?.error ? (
        <p role="alert" style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p style={{ color: '#15803d', fontSize: 13, margin: 0 }}>
          Saved. Reload the marketing site to pick up the new camera (or wait for the next navigation).
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        style={{
          alignSelf: 'flex-start',
          padding: '8px 16px',
          borderRadius: 8,
          border: 'none',
          background: '#18181b',
          color: '#fff',
          fontWeight: 600,
          fontSize: 13,
          cursor: pending ? 'wait' : 'pointer',
        }}
      >
        {pending ? 'Saving…' : 'Save hero 3D camera'}
      </button>
    </form>
  );
}
