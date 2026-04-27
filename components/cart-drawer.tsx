export function CartDrawer() {
  return (
    <dialog id="cart-drawer" className="cart-drawer" aria-labelledby="cart-drawer-title">
      <div className="cart-drawer__panel">
        <header className="cart-drawer__head">
          <h2 id="cart-drawer-title" className="cart-drawer__title font-display">
            Cart
          </h2>
          <button type="button" className="cart-drawer__close js-cart-close" aria-label="Close cart">
            ×
          </button>
        </header>
        <div className="cart-drawer__body">
          <p className="cart-drawer__empty js-cart-empty">
            Your cart is empty. Use Pre-Order to add the mat.
          </p>
          <ul className="cart-drawer__lines js-cart-lines" aria-label="Cart items" />
        </div>
        <footer className="cart-drawer__footer js-cart-footer" hidden>
          <div className="cart-drawer__subrow">
            <span className="cart-drawer__sub-label">Subtotal</span>
            <strong className="cart-drawer__sub-value js-cart-subtotal">—</strong>
          </div>
          <p className="cart-drawer__hint js-cart-subtotal-hint" />
          <button
            type="button"
            className="btn btn-primary js-cart-checkout"
            style={{ width: '100%', fontSize: 14, padding: '14px 20px' }}
          >
            Checkout link not set
          </button>
        </footer>
      </div>
    </dialog>
  );
}
