const SECTION_IDS = ['features', 'specs', 'compat'];

/* Nav links: path-based (/features) or legacy hash (#features) */
const LINK_SELECTOR = 'nav a.nav-link[href^="/"], nav a.nav-link[href^="#"]';

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/** @returns {string|undefined} section id, '' for home, undefined if not a routed path */
function pathnameToSectionId(pathname) {
  const p = (pathname || '').replace(/\/+$/, '') || '/';
  if (p === '/') return '';
  const m = p.match(/^\/(features|specs|compat)$/);
  if (m) return m[1];
  return undefined;
}

/** Map anchor href to section id for nav spy (active state). */
function linkHrefToSectionId(href) {
  if (!href) return '';
  if (href.startsWith('#')) return href.slice(1);
  const id = pathnameToSectionId(href);
  return id === undefined ? '' : id;
}

function scrollToSectionId(id, { instant = false } = {}) {
  const reduce = instant || prefersReducedMotion();
  if (!id) {
    window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
}

/** Old bookmarks #features → /features */
function migrateHashToPath() {
  const m = window.location.hash.match(/^#(features|specs|compat)$/);
  if (!m) return;
  const id = m[1];
  window.history.replaceState(null, '', `/${id}`);
}

function bootInitialRoute() {
  migrateHashToPath();
  const id = pathnameToSectionId(window.location.pathname);
  if (id === undefined) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollToSectionId(id, { instant: true });
      updateNavScrolled();
      updateNavSpy();
    });
  });
}

function activationY() {
  const nav = document.querySelector('nav');
  const navH = nav?.getBoundingClientRect().height ?? 66;
  return Math.min(navH + 40, window.innerHeight * 0.2);
}

function updateNavScrolled() {
  const nav = document.querySelector('nav.site-nav');
  if (!nav) return;
  nav.classList.toggle('site-nav--scrolled', window.scrollY > 20);
}

function updateNavSpy() {
  const y = activationY();
  const sections = SECTION_IDS.map((sid) => document.getElementById(sid)).filter(Boolean);
  let activeId = '';
  for (const sec of sections) {
    if (sec.getBoundingClientRect().top <= y) activeId = sec.id;
  }

  document.querySelectorAll(LINK_SELECTOR).forEach((a) => {
    const href = a.getAttribute('href') || '';
    const id = linkHrefToSectionId(href);
    const on = id === activeId;
    a.classList.toggle('nav-link--active', on);
    if (on) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
}

function isRoutedInPageClick(a) {
  if (a.target && a.target !== '' && a.target !== '_self') return false;
  let url;
  try {
    url = new URL(a.getAttribute('href') || '', window.location.href);
  } catch {
    return false;
  }
  if (url.origin !== window.location.origin) return false;
  return pathnameToSectionId(url.pathname) !== undefined;
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || !isRoutedInPageClick(a)) return;
  if (e.defaultPrevented) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

  let url;
  try {
    url = new URL(a.getAttribute('href') || '', window.location.href);
  } catch {
    return;
  }

  const id = pathnameToSectionId(url.pathname);
  if (id === undefined) return;

  e.preventDefault();
  const path = url.pathname === '/' ? '/' : url.pathname;
  window.history.pushState({ magnamatRoute: true }, '', path);
  scrollToSectionId(id, { instant: false });
  requestAnimationFrame(() => {
    updateNavScrolled();
    updateNavSpy();
  });
});

window.addEventListener('popstate', () => {
  const id = pathnameToSectionId(window.location.pathname);
  if (id === undefined) return;
  scrollToSectionId(id, { instant: true });
  requestAnimationFrame(() => {
    updateNavScrolled();
    updateNavSpy();
  });
});

let ticking = false;
function schedule() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    updateNavScrolled();
    updateNavSpy();
  });
}

window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', schedule, { passive: true });
window.addEventListener('hashchange', () => {
  migrateHashToPath();
  const id = pathnameToSectionId(window.location.pathname);
  if (id !== undefined) scrollToSectionId(id, { instant: true });
  updateNavSpy();
});
window.addEventListener('load', () => {
  updateNavScrolled();
  updateNavSpy();
});

bootInitialRoute();
updateNavScrolled();
updateNavSpy();
