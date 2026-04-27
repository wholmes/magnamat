'use client';

import { useActionState } from 'react';

import type { SaveState } from '@/app/admin/actions';
import { saveMarketingPage } from '@/app/admin/actions';

type Props = { initialJson: string };

export function MarketingPageForm({ initialJson }: Props) {
  const [state, formAction, pending] = useActionState(saveMarketingPage, undefined as SaveState | undefined);

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <textarea
        name="contentJson"
        required
        rows={36}
        defaultValue={initialJson}
        spellCheck={false}
        data-lpignore="true"
        data-1p-ignore="true"
        data-bwignore="true"
        style={{
          width: '100%',
          maxWidth: '100%',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 12,
          lineHeight: 1.45,
          padding: 14,
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
          Saved. Public routes were revalidated; reload the site if you still see old copy.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        style={{
          alignSelf: 'flex-start',
          padding: '10px 20px',
          borderRadius: 8,
          border: 'none',
          background: '#18181b',
          color: '#fff',
          fontWeight: 600,
          fontSize: 14,
          cursor: pending ? 'wait' : 'pointer',
        }}
      >
        {pending ? 'Saving…' : 'Save home page'}
      </button>
    </form>
  );
}
