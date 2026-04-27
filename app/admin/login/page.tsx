import { redirect } from 'next/navigation';

import { adminPasswordConfigured, getAdminSession } from '@/lib/cms/session';

import { LoginForm } from './login-form';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect('/admin');

  const cmsPassword = process.env.CMS_ADMIN_PASSWORD ?? '';
  const weakCmsPassword = cmsPassword.length > 0 && cmsPassword.length < 16;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 420,
        padding: 32,
        borderRadius: 16,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <h1 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: 8, color: '#fafafa' }}>Sign in</h1>
      <p style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 24, lineHeight: 1.55 }}>
        Use the password from <code style={{ fontSize: 12, color: '#e4e4e7' }}>CMS_ADMIN_PASSWORD</code> in your{' '}
        <code style={{ fontSize: 12, color: '#e4e4e7' }}>.env</code>.
      </p>
      {!adminPasswordConfigured() ? (
        <p style={{ fontSize: 13, color: '#fbbf24', marginBottom: 16, lineHeight: 1.5 }}>
          <strong>Not configured:</strong> set <code>CMS_ADMIN_PASSWORD</code> and <code>CMS_SESSION_SECRET</code> in{' '}
          <code>.env</code>, then restart the dev server.
        </p>
      ) : null}
      {adminPasswordConfigured() && weakCmsPassword ? (
        <p style={{ fontSize: 12, color: '#fbbf24', marginBottom: 16, lineHeight: 1.5 }}>
          <strong>Security:</strong> use a long random <code>CMS_ADMIN_PASSWORD</code> in production (16+ characters).
        </p>
      ) : null}
      <LoginForm />
    </div>
  );
}
