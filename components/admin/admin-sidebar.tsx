'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { adminLogout } from '@/app/admin/actions';

const nav = [
  { href: '/admin', label: 'Site & metadata', desc: 'Chrome, settings, SEO, hero 3D' },
  { href: '/admin/content', label: 'Home page', desc: 'Hero, sections, footer' },
] as const;

function navActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 268,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#0c0c0e',
        color: '#fafafa',
        borderRight: '1px solid #27272a',
      }}
    >
      <div style={{ padding: '22px 20px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: '#71717a', textTransform: 'uppercase' }}>
          mag·na·mat
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, marginTop: 4, letterSpacing: '-0.02em' }}>CMS</div>
      </div>

      <nav style={{ flex: 1, padding: '0 12px' }} aria-label="CMS sections">
        {nav.map((item) => {
          const active = navActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '12px 14px',
                marginBottom: 6,
                borderRadius: 10,
                textDecoration: 'none',
                color: active ? '#fff' : '#a1a1aa',
                background: active ? 'rgba(229, 52, 42, 0.18)' : 'transparent',
                border: active ? '1px solid rgba(229, 52, 42, 0.35)' : '1px solid transparent',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: '#71717a', marginTop: 3, fontWeight: 400 }}>{item.desc}</div>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '16px 14px 20px', borderTop: '1px solid #27272a' }}>
        <Link
          href="/"
          style={{
            display: 'block',
            padding: '10px 12px',
            marginBottom: 10,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: '#a1a1aa',
            textDecoration: 'none',
            border: '1px solid #3f3f46',
            textAlign: 'center',
          }}
        >
          View live site
        </Link>
        <form action={adminLogout}>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #3f3f46',
              background: 'transparent',
              color: '#e4e4e7',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
