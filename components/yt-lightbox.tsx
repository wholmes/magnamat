export function YtLightbox() {
  return (
    <div id="yt-lightbox" className="yt-lightbox" role="dialog" aria-modal="true" aria-label="YouTube video" hidden>
      <div className="yt-lightbox__backdrop js-yt-lightbox-close" tabIndex={-1} />
      <div className="yt-lightbox__dialog">
        <button type="button" className="yt-lightbox__close js-yt-lightbox-close" aria-label="Close video">
          ×
        </button>
        <div className="yt-embed yt-embed--lightbox">
          <iframe
            id="yt-lightbox-iframe"
            title="YouTube"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </div>
  );
}
