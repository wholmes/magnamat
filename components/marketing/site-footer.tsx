import Image from 'next/image';

import type { FooterContent } from '@/lib/cms/marketing-content';

type Props = { footer: FooterContent };

export function SiteFooter({ footer: f }: Props) {
  return (
    <footer className="bg-grid" style={{ borderTop: '1px solid var(--border)', padding: '36px 24px', backgroundColor: 'var(--page-2)' }}>
      <div
        style={{
          maxWidth: 1300,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div className="logo logo-mark logo-mark--footer">
          <Image
            src="/images/logo-transparent.svg"
            alt="mag·na·mat"
            width={1024}
            height={350}
            sizes="(max-width: 768px) 76vw, 340px"
          />
        </div>
        <p
          style={{
            fontFamily: 'var(--font-space-mono), monospace',
            fontSize: 9,
            color: 'var(--ink-faint)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          {f.copyright}
        </p>
        <div style={{ display: 'flex', gap: 24 }}>
          {f.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ink-soft)',
                textDecoration: 'none',
                fontFamily: 'var(--font-space-mono), monospace',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
