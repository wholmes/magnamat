const SECTION_IDS = ['features', 'specs', 'compat'];
/* Only <a href="#…"> — exclude e.g. YouTube lightbox <button class="nav-link"> */
const LINK_SELECTOR = 'nav a.nav-link[href^="#"]';

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
  const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
  let activeId = '';
  for (const sec of sections) {
    if (sec.getBoundingClientRect().top <= y) activeId = sec.id;
  }

  document.querySelectorAll(LINK_SELECTOR).forEach((a) => {
    const href = a.getAttribute('href') || '';
    const id = href.startsWith('#') ? href.slice(1) : '';
    const on = id === activeId;
    a.classList.toggle('nav-link--active', on);
    if (on) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
}

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
window.addEventListener('hashchange', updateNavSpy);
window.addEventListener('load', () => {
  updateNavScrolled();
  updateNavSpy();
});
updateNavScrolled();
updateNavSpy();
