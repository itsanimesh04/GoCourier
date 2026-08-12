import { FiShoppingBag } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import { selectCartCount, selectCartSubtotal } from '../store/slices/cartSlice';

const HIDDEN_PATHS = ['/cart', '/checkout'];

const FloatingCartButton = () => {
  const location = useLocation();
  const count = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectCartSubtotal);

  const hidden = HIDDEN_PATHS.some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  if (hidden || count === 0) return null;

  return (
    <Link
      to="/cart"
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-primary px-4 py-3 text-on-primary shadow-2xl shadow-black/40 transition-opacity hover:opacity-90"
      aria-label={`View cart, ${count} items`}
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-on-primary/15">
        <FiShoppingBag size={18} />
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-on-primary px-1 font-display text-[10px] font-bold text-primary">
          {count}
        </span>
      </span>
      <span className="min-w-0">
        <span className="block font-display text-sm font-semibold uppercase tracking-wide">
          View cart
        </span>
        <span className="block font-sans text-xs opacity-90">₹{subtotal.toFixed(0)}</span>
      </span>
    </Link>
  );
};

export default FloatingCartButton;
