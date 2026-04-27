// @ts-nocheck
/**
 * Client-side cart (localStorage). Checkout URL + catalog come from `#magnamat-commerce-config`
 * (Site chrome in Admin). Fallback matches historical defaults.
 */

const STORAGE_KEY = 'magnamat-cart-v1';

/** @typedef {{ id: string, name: string, subtitle?: string, priceCents: number | null, maxPerOrder: number }} CatalogEntry */

/** @type {Record<string, CatalogEntry>} */
const DEFAULT_CATALOG = {
  'magnamat-v1': {
    id: 'magnamat-v1',
    name: 'mag·na·mat v1.0',
    subtitle: 'Magnetic build surface · Eufy Maker · 235×235 mm',
    priceCents: null,
    maxPerOrder: 99,
  },
};

/** @type {Record<string, CatalogEntry>} */
let CATALOG = { ...DEFAULT_CATALOG };

/** Stripe Payment Link, Gumroad permalink, etc. Empty until set in Site chrome. */
let CHECKOUT_URL = '';

function cloneCatalog(src) {
  const out = {};
  for (const k of Object.keys(src)) out[k] = { ...src[k] };
  return out;
}

function loadCommerceFromDom() {
  const el = document.getElementById('magnamat-commerce-config');
  if (!el?.textContent?.trim()) {
    CATALOG = cloneCatalog(DEFAULT_CATALOG);
    CHECKOUT_URL = '';
    return;
  }
  try {
    const raw = JSON.parse(el.textContent);
    const checkoutUrl = typeof raw.checkoutUrl === 'string' ? raw.checkoutUrl : '';
    const products = Array.isArray(raw.products) ? raw.products : [];
    const next = {};
    for (const p of products) {
      if (!p || typeof p !== 'object') continue;
      const id = typeof p.id === 'string' ? p.id.trim() : '';
      const name = typeof p.name === 'string' ? p.name.trim() : '';
      if (!id || !name) continue;
      const maxPerOrder =
        typeof p.maxPerOrder === 'number' && Number.isFinite(p.maxPerOrder) && p.maxPerOrder >= 1
          ? Math.min(9999, Math.floor(p.maxPerOrder))
          : 99;
      let priceCents = null;
      if (p.priceCents === null) priceCents = null;
      else if (typeof p.priceCents === 'number' && Number.isFinite(p.priceCents) && p.priceCents >= 0) {
        priceCents = Math.floor(p.priceCents);
      }
      const subtitle =
        typeof p.subtitle === 'string' && p.subtitle.trim() ? p.subtitle.trim() : undefined;
      next[id] = { id, name, subtitle, priceCents, maxPerOrder };
    }
    if (Object.keys(next).length) {
      CATALOG = next;
      CHECKOUT_URL = checkoutUrl;
    } else {
      CATALOG = cloneCatalog(DEFAULT_CATALOG);
      CHECKOUT_URL = checkoutUrl;
    }
  } catch {
    CATALOG = cloneCatalog(DEFAULT_CATALOG);
    CHECKOUT_URL = '';
  }
}

/** @typedef {{ productId: string, qty: number }} CartLine */

/** @type {HTMLDialogElement | null} */
let drawer = null;
/** @type {HTMLElement | null} */
let listEl = null;
/** @type {HTMLElement | null} */
let emptyEl = null;
/** @type {HTMLElement | null} */
let footerEl = null;
/** @type {HTMLButtonElement | null} */
let checkoutBtn = null;
/** @type {HTMLElement | null} */
let subtotalEl = null;
/** @type {NodeListOf<HTMLElement> | null} */
let badges = null;

let lastOpener = null;

function $(sel, root = document) {
  return root.querySelector(sel);
}

function $$(sel, root = document) {
  return root.querySelectorAll(sel);
}

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { v: 1, lines: /** @type {CartLine[]} */ ([]) };
    const data = JSON.parse(raw);
    if (data && data.v === 1 && Array.isArray(data.lines)) {
      return {
        v: 1,
        lines: data.lines
          .filter((l) => l && typeof l.productId === 'string' && typeof l.qty === 'number' && CATALOG[l.productId])
          .map((l) => ({
            productId: l.productId,
            qty: Math.min(CATALOG[l.productId].maxPerOrder, Math.max(1, Math.floor(l.qty))),
          })),
      };
    }
  } catch (_) {}
  return { v: 1, lines: [] };
}

function writeCart(lines) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, lines }));
  document.dispatchEvent(new CustomEvent('magnamat:cartchange', { detail: { lines } }));
}

function totalQty(lines) {
  return lines.reduce((n, l) => n + l.qty, 0);
}

function addLine(productId, addQty = 1) {
  const entry = CATALOG[productId];
  if (!entry) return readCart().lines;
  const cart = readCart();
  const max = entry.maxPerOrder;
  const idx = cart.lines.findIndex((l) => l.productId === productId);
  if (idx >= 0) {
    cart.lines[idx].qty = Math.min(max, cart.lines[idx].qty + addQty);
  } else {
    cart.lines.push({ productId, qty: Math.min(max, Math.max(1, addQty)) });
  }
  writeCart(cart.lines);
  return cart.lines;
}

function setQty(productId, qty) {
  const entry = CATALOG[productId];
  if (!entry) return readCart().lines;
  const cart = readCart();
  const idx = cart.lines.findIndex((l) => l.productId === productId);
  if (idx < 0) return cart.lines;
  const q = Math.min(entry.maxPerOrder, Math.max(1, Math.floor(qty)));
  cart.lines[idx].qty = q;
  writeCart(cart.lines);
  return cart.lines;
}

function removeLine(productId) {
  const cart = readCart();
  cart.lines = cart.lines.filter((l) => l.productId !== productId);
  writeCart(cart.lines);
  return cart.lines;
}

function formatMoney(cents) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function subtotalParts(lines) {
  if (!lines.length) return { primary: '—', secondary: '' };
  let sum = 0;
  for (const ln of lines) {
    const p = CATALOG[ln.productId];
    if (!p || p.priceCents == null) {
      return {
        primary: 'At checkout',
        secondary: 'Add priceCents per product in Site chrome → commerce to show a subtotal, or rely on Stripe / Gumroad.',
      };
    }
    sum += p.priceCents * ln.qty;
  }
  return { primary: formatMoney(sum), secondary: '' };
}

function buildCheckoutUrl(lines) {
  if (!CHECKOUT_URL || !lines.length) return '';
  try {
    const u = new URL(CHECKOUT_URL, window.location.href);
    if (lines.length === 1) u.searchParams.set('quantity', String(lines[0].qty));
    return u.href;
  } catch {
    return CHECKOUT_URL;
  }
}

function syncBodyOverflow() {
  const lb = document.getElementById('yt-lightbox');
  const lbOpen = lb && !lb.hidden;
  const cartOpen = drawer && drawer.open;
  document.body.style.overflow = cartOpen || lbOpen ? 'hidden' : '';
}

function openCart(fromEl) {
  if (!drawer) return;
  lastOpener = fromEl && fromEl instanceof HTMLElement ? fromEl : null;
  drawer.showModal();
  syncBodyOverflow();
  $('.js-cart-close', drawer)?.focus();
  render();
}

function closeCart() {
  if (!drawer) return;
  drawer.close();
}

function updateBadges(lines) {
  const n = totalQty(lines);
  badges?.forEach((el) => {
    el.textContent = String(n);
    el.hidden = n === 0;
    el.setAttribute('data-count', String(n));
  });
  const expanded = drawer?.open ? 'true' : 'false';
  $$('.js-cart-toggle').forEach((btn) => btn.setAttribute('aria-expanded', expanded));
}

function renderLine(line) {
  const p = CATALOG[line.productId];
  const li = document.createElement('li');
  li.className = 'cart-drawer__line';
  li.dataset.productId = line.productId;

  const priceLabel =
    p.priceCents != null ? formatMoney(p.priceCents * line.qty) : '—';

  li.innerHTML = `
    <div class="cart-drawer__line-main">
      <div>
        <div class="cart-drawer__line-name">${escapeHtml(p.name)}</div>
        ${p.subtitle ? `<div class="cart-drawer__line-sub">${escapeHtml(p.subtitle)}</div>` : ''}
      </div>
      <div class="cart-drawer__line-meta">
        <span class="cart-drawer__line-price">${priceLabel}</span>
        <div class="cart-drawer__qty" role="group" aria-label="Quantity for ${escapeHtml(p.name)}">
          <button type="button" class="cart-drawer__qty-btn js-cart-dec" aria-label="Decrease quantity">−</button>
          <span class="cart-drawer__qty-val">${line.qty}</span>
          <button type="button" class="cart-drawer__qty-btn js-cart-inc" aria-label="Increase quantity">+</button>
        </div>
      </div>
    </div>
    <button type="button" class="cart-drawer__remove js-cart-remove" aria-label="Remove ${escapeHtml(p.name)} from cart">Remove</button>
  `;

  li.querySelector('.js-cart-dec')?.addEventListener('click', () => {
    const next = line.qty - 1;
    if (next < 1) removeLine(line.productId);
    else setQty(line.productId, next);
    render();
  });
  li.querySelector('.js-cart-inc')?.addEventListener('click', () => {
    setQty(line.productId, line.qty + 1);
    render();
  });
  li.querySelector('.js-cart-remove')?.addEventListener('click', () => {
    removeLine(line.productId);
    render();
  });

  return li;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function render() {
  const lines = readCart().lines;
  if (!listEl || !emptyEl || !footerEl || !checkoutBtn || !subtotalEl) return;

  listEl.innerHTML = '';
  if (!lines.length) {
    emptyEl.hidden = false;
    footerEl.hidden = true;
    checkoutBtn.disabled = true;
  } else {
    emptyEl.hidden = true;
    footerEl.hidden = false;
    lines.forEach((ln) => listEl.appendChild(renderLine(ln)));

    const url = buildCheckoutUrl(lines);
    const hasCheckout = Boolean(url);
    checkoutBtn.disabled = !hasCheckout;
    checkoutBtn.textContent = hasCheckout ? 'Continue to checkout' : 'Checkout link not set';
    checkoutBtn.onclick = hasCheckout
      ? () => {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      : null;

    const sub = subtotalParts(lines);
    subtotalEl.textContent = sub.primary;
    const hint = $('.js-cart-subtotal-hint', footerEl);
    if (hint) {
      hint.textContent =
        sub.secondary ||
        (hasCheckout
          ? 'You will complete payment on Stripe or Gumroad.'
          : 'Set commerce.checkoutUrl in Admin → Site chrome when your product is live.');
    }
  }

  updateBadges(lines);
}

function init() {
  loadCommerceFromDom();
  drawer = /** @type {HTMLDialogElement | null} */ (document.getElementById('cart-drawer'));
  if (!drawer) return;

  listEl = $('.js-cart-lines', drawer);
  emptyEl = $('.js-cart-empty', drawer);
  footerEl = $('.js-cart-footer', drawer);
  checkoutBtn = /** @type {HTMLButtonElement | null} */ ($('.js-cart-checkout', drawer));
  subtotalEl = $('.js-cart-subtotal', drawer);
  badges = $$('.js-cart-badge');

  drawer.addEventListener('close', () => {
    syncBodyOverflow();
    lastOpener?.focus({ preventScroll: true });
    lastOpener = null;
    $$('.js-cart-toggle').forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
  });

  document.addEventListener('click', (e) => {
    const t = /** @type {HTMLElement} */ (e.target);
    if (t.closest('.js-cart-toggle')) {
      e.preventDefault();
      if (drawer?.open) closeCart();
      else openCart(t.closest('.js-cart-toggle'));
      return;
    }
    if (t.closest('.js-cart-close')) {
      closeCart();
      return;
    }
    const addBtn = t.closest('.js-add-to-cart');
    if (addBtn) {
      e.preventDefault();
      const id = addBtn.getAttribute('data-product-id');
      if (id && CATALOG[id]) {
        addLine(id, 1);
        openCart(addBtn);
      }
    }
  });

  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();

export {};
