/** Outer wrapper for all `/admin` routes (login + authenticated shell). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '100vh' }}>{children}</div>;
}
