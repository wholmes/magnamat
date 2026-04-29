import type { Metadata } from 'next';

import { ContactForm } from '@/components/marketing/contact-form';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Reach the mag·na·mat team — questions, partnerships, or support.',
};

export default function ContactPage() {
  return (
    <main id="main" tabIndex={-1} className="contact-page bg-grid">
      <div className="contact-page__inner">
        <p className="sec-label" style={{ marginBottom: 14 }}>
          Get in touch
        </p>
        <h1 className="contact-page__title font-display font-extrabold leading-tight">Contact</h1>
        <p className="contact-page__lede">
          Pre-order questions, press, retail, or anything about the mat — send a note and we&apos;ll reply from the
          team inbox.
        </p>
        <ContactForm />
      </div>
    </main>
  );
}
