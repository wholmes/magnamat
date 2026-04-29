'use client';

import { useActionState } from 'react';

import { submitContactForm, type ContactFormState } from '@/lib/actions/contact-form';
import { CONTACT_REASON_OPTIONS } from '@/lib/contact-reasons';

const initial: ContactFormState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initial);

  if (state.success) {
    return (
      <div className="contact-form contact-form--success" role="status">
        <p className="contact-form__success-title font-display">Thanks — we got your message.</p>
        <p className="contact-form__success-body">
          We&apos;ll get back to you at the email you provided. If it&apos;s urgent, reply from that thread once we
          write you.
        </p>
      </div>
    );
  }

  return (
    <form className="contact-form" action={formAction} noValidate>
      {state.error ? (
        <p className="contact-form__error" role="alert">
          {state.error}
        </p>
      ) : null}

      <p className="contact-field contact-field--honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Company website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </p>

      <p className="contact-field">
        <label className="contact-label" htmlFor="contact-name">
          Name <span className="contact-req">*</span>
        </label>
        <input className="contact-input" id="contact-name" name="name" type="text" required autoComplete="name" />
      </p>

      <p className="contact-field">
        <label className="contact-label" htmlFor="contact-email">
          Email <span className="contact-req">*</span>
        </label>
        <input
          className="contact-input"
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </p>

      <p className="contact-field">
        <label className="contact-label" htmlFor="contact-reason">
          What can we help with? <span className="contact-req">*</span>
        </label>
        <select className="contact-select" id="contact-reason" name="reason" required defaultValue="">
          <option value="" disabled>
            Choose a topic…
          </option>
          {CONTACT_REASON_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </p>

      <p className="contact-field">
        <label className="contact-label" htmlFor="contact-message">
          Message <span className="contact-req">*</span>
        </label>
        <textarea className="contact-textarea" id="contact-message" name="message" required rows={7} />
      </p>

      <div className="contact-form__actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  );
}
