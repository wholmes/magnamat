'use client';

import { useActionState, useEffect, useState } from 'react';

import type { LoginState } from '@/app/admin/actions';
import { adminLogin } from '@/app/admin/actions';

/**
 * Password managers (e.g. LastPass) inject nodes into password fields before hydration,
 * which causes a server/client mismatch. We render the real form only after mount so
 * the first paint matches SSR; extensions then attach without breaking hydration.
 */
export function LoginForm() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [state, formAction, pending] = useActionState(adminLogin, undefined as LoginState | undefined);

  if (!mounted) {
    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 132 }}
        aria-busy="true"
        aria-label="Loading sign-in form"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>Password</span>
          <div style={{ height: 42, borderRadius: 8, border: '1px solid #3f3f46', background: 'rgba(0,0,0,0.25)' }} />
        </div>
        <div
          style={{
            height: 40,
            maxWidth: 120,
            borderRadius: 8,
            background: '#3f3f46',
          }}
        />
      </div>
    );
  }

  return (
    <form
      action={formAction}
      data-lpignore="true"
      data-1p-ignore="true"
      data-bwignore="true"
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>
        Password
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          data-lpignore="true"
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #3f3f46',
            fontSize: 15,
            background: 'rgba(0,0,0,0.35)',
            color: '#fafafa',
          }}
        />
      </label>
      {state?.error ? (
        <p role="alert" style={{ fontSize: 13, color: '#fca5a5', margin: 0 }}>
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        style={{
          padding: '10px 16px',
          borderRadius: 8,
          border: 'none',
          background: '#18181b',
          color: '#fff',
          fontWeight: 600,
          fontSize: 14,
          cursor: pending ? 'wait' : 'pointer',
        }}
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
