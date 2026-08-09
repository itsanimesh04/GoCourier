import { Link } from 'react-router-dom';

interface CartSummaryProps {
  subtotal: number;
  fee: number;
  itemCount: number;
}

const CartSummary = ({ subtotal, fee, itemCount }: CartSummaryProps) => {
  const total = subtotal + fee;

  return (
    <aside className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-fg sm:text-xl">
        Order Summary
      </h2>
      <dl className="space-y-2 font-sans text-sm text-muted">
        <div className="flex justify-between">
          <dt>Items ({itemCount})</dt>
          <dd>₹ {subtotal}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Delivery fee</dt>
          <dd>₹ {fee}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-semibold text-fg sm:text-xl">
          <dt>Total</dt>
          <dd>₹ {total}</dd>
        </div>
      </dl>
      <Link
        to="/checkout"
        className="mt-6 block w-full rounded-xl bg-primary py-3 text-center font-display text-sm font-semibold uppercase tracking-wide text-on-primary hover:opacity-90"
      >
        Proceed to Checkout
      </Link>
      <Link
        to="/food"
        className="mt-3 block w-full rounded-xl border border-border py-2.5 text-center font-display text-sm font-semibold uppercase tracking-wide text-fg hover:border-primary hover:text-primary"
      >
        Continue Shopping
      </Link>
    </aside>
  );
};

export default CartSummary;
