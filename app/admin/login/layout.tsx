import Link from 'next/link';

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(165deg, #0c0c0e 0%, #18181b 45%, #27272a 100%)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span style={{ fontWeight: 700, color: '#fafafa', letterSpacing: '-0.02em' }}>mag·na·mat CMS</span>
        <Link href="/" style={{ fontSize: 13, color: '#a1a1aa', textDecoration: 'none' }}>
          ← Back to site
        </Link>
      </header>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>{children}</div>
    </div>
  );
}
