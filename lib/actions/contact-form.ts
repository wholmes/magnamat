'use server';

import { contactReasonLabel, isContactReasonValue } from '@/lib/contact-reasons';

export type ContactFormState = {
  error?: string;
  success?: boolean;
};

const MAX = { name: 120, email: 254, message: 8000 } as const;

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/**
 * Optional: set `CONTACT_WEBHOOK_URL` to POST JSON payloads (e.g. Slack, Zapier, Make).
 * Without it, submissions are logged server-side only — fine for staging; add a webhook for production.
 */
export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const honeypot = String(formData.get('website') ?? '').trim();
  if (honeypot) {
    return { success: true };
  }

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const reasonRaw = String(formData.get('reason') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  if (!name || !email || !message) {
    return { error: 'Name, email, and message are required.' };
  }
  if (!reasonRaw || !isContactReasonValue(reasonRaw)) {
    return { error: 'Please choose a topic so we can route your message.' };
  }
  if (name.length > MAX.name || email.length > MAX.email || message.length > MAX.message) {
    return { error: 'One or more fields are too long.' };
  }
  if (!isValidEmail(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  const reasonLabel = contactReasonLabel(reasonRaw) ?? reasonRaw;

  const payload = {
    name,
    email,
    reason: reasonRaw,
    reasonLabel,
    message,
    source: 'magnamat-contact',
    at: new Date().toISOString(),
  };

  const url = process.env.CONTACT_WEBHOOK_URL?.trim();
  if (url) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.warn('[contact] webhook failed', res.status, await res.text().catch(() => ''));
        return { error: 'Could not send right now. Please try again in a moment.' };
      }
    } catch (e) {
      console.warn('[contact] webhook error', e);
      return { error: 'Could not send right now. Please try again in a moment.' };
    }
  } else {
    console.info('[contact] submission (no CONTACT_WEBHOOK_URL)', payload);
  }

  return { success: true };
}
