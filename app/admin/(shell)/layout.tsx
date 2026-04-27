import { redirect } from 'next/navigation';

import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { getAdminSession } from '@/lib/cms/session';

export const dynamic = 'force-dynamic';

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  if (!(await getAdminSession())) redirect('/admin/login');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f4f5' }}>
      <AdminSidebar />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <main
          style={{
            flex: 1,
            padding: '32px 40px 48px',
            maxWidth: 1120,
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
