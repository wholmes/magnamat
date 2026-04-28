'use client';

import { useActionState } from 'react';

import type { SaveState } from '@/app/admin/actions';
import { saveSeoSettings, saveSiteChrome, saveSiteSettings } from '@/app/admin/actions';
import { HeroSceneCameraForm } from '@/components/admin/hero-scene-camera-form';
import { PromoModalRulesDialog } from '@/components/admin/promo-modal-rules-dialog';
import { DEFAULT_CHROME, DEFAULT_SEO, DEFAULT_SITE_SETTINGS } from '@/lib/cms/defaults';
import type { PromoModalConfig } from '@/lib/cms/types';

type Props = {
  chromeJson: string;
  promoModal: PromoModalConfig;
  availabilityStatus: string;
  navHideOnScroll: boolean;
  seoTitle: string;
  seoDescription: string;
  seoNoIndex: boolean;
  heroSceneJson: string;
  /** True when at least one Prisma read failed (e.g. column/table missing vs schema). */
  dbReadHadError?: boolean;
};

export function CmsDashboard({
  chromeJson,
  promoModal,
  availabilityStatus,
  navHideOnScroll,
  seoTitle,
  seoDescription,
  seoNoIndex,
  heroSceneJson,
  dbReadHadError,
}: Props) {
  const [chromeState, chromeAction, chromePending] = useActionState(saveSiteChrome, undefined as SaveState | undefined);
  const [settingsState, settingsAction, settingsPending] = useActionState(
    saveSiteSettings,
    undefined as SaveState | undefined
  );
  const [seoState, seoAction, seoPending] = useActionState(saveSeoSettings, undefined as SaveState | undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {dbReadHadError ? (
        <div
          role="status"
          style={{
            padding: '14px 16px',
            borderRadius: 10,
            border: '1px solid #fcd34d',
            background: '#fffbeb',
            color: '#78350f',
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          <strong>Database is behind this app&apos;s schema.</strong> Some rows could not be loaded (defaults are
          shown).           Run <code style={{ fontSize: 12 }}>npm run db:bootstrap-db</code> (creates missing tables + SEO column fix +
          seed), or <code style={{ fontSize: 12 }}>npm run db:ensure-core-tables</code> then{' '}
          <code style={{ fontSize: 12 }}>npm run db:seed</code>. For only the legacy <code>noIndex</code> column:{' '}
          <code style={{ fontSize: 12 }}>npm run db:fix-seo-noindex</code>. Prefer{' '}
          <code style={{ fontSize: 12 }}>npm run db:migrate:deploy</code> when migration history exists.
          Until then, <strong>saves may still error</strong> until the DB matches{' '}
          <code style={{ fontSize: 12 }}>prisma/schema.prisma</code>.
        </div>
      ) : null}
      <section
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e4e4e7',
          padding: 24,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>Site chrome (JSON)</h2>
        <p style={{ fontSize: 13, color: '#52525b', marginBottom: 12, lineHeight: 1.5 }}>
          Nav links, YouTube id, <strong>commerce</strong>, and <strong>promoModal</strong> (optional marketing dialog +
          rules — editable below without hand-editing JSON). Example defaults:{' '}
          <code style={{ fontSize: 11 }}>{JSON.stringify(DEFAULT_CHROME)}</code>
        </p>
        <div style={{ marginBottom: 14 }}>
          <PromoModalRulesDialog initial={promoModal} />
        </div>
        <form action={chromeAction} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <textarea
            name="configJson"
            required
            rows={14}
            defaultValue={chromeJson}
            spellCheck={false}
            style={{
              width: '100%',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: 12,
              padding: 12,
              borderRadius: 8,
              border: '1px solid #d4d4d8',
              resize: 'vertical',
            }}
          />
          {chromeState?.error ? (
            <p role="alert" style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>
              {chromeState.error}
            </p>
          ) : null}
          {chromeState?.ok ? (
            <p style={{ color: '#15803d', fontSize: 13, margin: 0 }}>Saved.</p>
          ) : null}
          <button
            type="submit"
            disabled={chromePending}
            style={{
              alignSelf: 'flex-start',
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#18181b',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              cursor: chromePending ? 'wait' : 'pointer',
            }}
          >
            {chromePending ? 'Saving…' : 'Save chrome'}
          </button>
        </form>
      </section>

      <section
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e4e4e7',
          padding: 24,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>Site settings</h2>
        <form action={settingsAction} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
            Availability status
            <input
              name="availabilityStatus"
              type="text"
              defaultValue={availabilityStatus}
              placeholder={DEFAULT_SITE_SETTINGS.availabilityStatus || 'e.g. Pre-order open'}
              style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d4d4d8', fontSize: 14 }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <input name="navHideOnScroll" type="checkbox" defaultChecked={navHideOnScroll} />
            Hide nav on scroll
          </label>
          {settingsState?.error ? (
            <p role="alert" style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>
              {settingsState.error}
            </p>
          ) : null}
          {settingsState?.ok ? (
            <p style={{ color: '#15803d', fontSize: 13, margin: 0 }}>Saved.</p>
          ) : null}
          <button
            type="submit"
            disabled={settingsPending}
            style={{
              alignSelf: 'flex-start',
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#18181b',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              cursor: settingsPending ? 'wait' : 'pointer',
            }}
          >
            {settingsPending ? 'Saving…' : 'Save settings'}
          </button>
        </form>
      </section>

      <section
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e4e4e7',
          padding: 24,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>SEO</h2>
        <p style={{ fontSize: 13, color: '#52525b', marginBottom: 12, lineHeight: 1.5 }}>
          Turn on <strong>Discourage search indexing</strong> for preview or staging so pages and{' '}
          <code style={{ fontSize: 11 }}>/robots.txt</code> tell crawlers not to index the marketing site.
        </p>
        <form action={seoAction} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
            Title
            <input
              name="title"
              type="text"
              required
              defaultValue={seoTitle}
              placeholder={DEFAULT_SEO.title}
              style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d4d4d8', fontSize: 14 }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
            Description
            <textarea
              name="description"
              required
              rows={4}
              defaultValue={seoDescription}
              placeholder={DEFAULT_SEO.description}
              style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #d4d4d8', fontSize: 14 }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, lineHeight: 1.45 }}>
            <input name="noIndex" type="checkbox" defaultChecked={seoNoIndex} style={{ marginTop: 3 }} />
            <span>
              Discourage search indexing (<code>noindex</code> + block all in <code>robots.txt</code>)
            </span>
          </label>
          {seoState?.error ? (
            <p role="alert" style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>
              {seoState.error}
            </p>
          ) : null}
          {seoState?.ok ? (
            <p style={{ color: '#15803d', fontSize: 13, margin: 0 }}>Saved.</p>
          ) : null}
          <button
            type="submit"
            disabled={seoPending}
            style={{
              alignSelf: 'flex-start',
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#18181b',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              cursor: seoPending ? 'wait' : 'pointer',
            }}
          >
            {seoPending ? 'Saving…' : 'Save SEO'}
          </button>
        </form>
      </section>

      <section
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e4e4e7',
          padding: 24,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 12 }}>Hero 3D camera (JSON)</h2>
        <HeroSceneCameraForm initialJson={heroSceneJson} />
      </section>
    </div>
  );
}
