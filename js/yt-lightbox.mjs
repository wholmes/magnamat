const EMBED = 'https://www.youtube-nocookie.com/embed/';

let lastOpener = null;

function $(sel, root = document) {
  return root.querySelector(sel);
}

function openLightbox(videoId) {
  const root = $('#yt-lightbox');
  const iframe = $('#yt-lightbox-iframe');
  if (!root || !iframe) return;
  const id = (videoId || 'M7lc1UVf-VE').replace(/[^a-zA-Z0-9_-]/g, '');
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  iframe.src = reduce ? `${EMBED}${id}` : `${EMBED}${id}?autoplay=1`;
  root.hidden = false;
  document.body.style.overflow = 'hidden';
  $('.yt-lightbox__close', root)?.focus();
}

function closeLightbox() {
  const root = $('#yt-lightbox');
  const iframe = $('#yt-lightbox-iframe');
  if (!root) return;
  root.hidden = true;
  if (iframe) iframe.src = '';
  const cart = document.getElementById('cart-drawer');
  const cartOpen = cart instanceof HTMLDialogElement && cart.open;
  document.body.style.overflow = cartOpen ? 'hidden' : '';
  lastOpener?.focus({ preventScroll: true });
  lastOpener = null;
}

document.addEventListener('click', (e) => {
  const opener = e.target.closest('.js-yt-lightbox-open');
  if (opener) {
    e.preventDefault();
    lastOpener = opener;
    const id = opener.getAttribute('data-youtube-id');
    openLightbox(id);
    return;
  }
  if (e.target.closest('.js-yt-lightbox-close')) {
    closeLightbox();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('#yt-lightbox')?.hidden) closeLightbox();
});
