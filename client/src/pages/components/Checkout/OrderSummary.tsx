import { lineUnitTotal } from '../../../data/selectors';
import type { CartLineItem } from '../../../utils/types';

interface OrderSummaryProps {
  items: CartLineItem[];
  subtotal: number;
  fee: number;
  onPlaceOrder: () => void;
  disabled?: boolean;
}

const OrderSummary = ({
  items,
  subtotal,
  fee,
  onPlaceOrder,
  disabled,
}: OrderSummaryProps) => {
  return (
    <aside className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="mb-4 font-display text-lg font-bold uppercase text-fg sm:text-xl">Your Order</h2>
      <ul className="mb-4 max-h-64 space-y-3 overflow-y-auto">
        {items.map((item) => {
          const unit = lineUnitTotal(item.unitPrice, item.selectedAddons);
          return (
            <li key={item.cartKey} className="flex justify-between gap-3 font-display text-sm font-semibold">
              <span className="uppercase text-fg">
                {item.quantity}× {item.name}
                {item.selectedAddons.length > 0 && (
                  <span className="block font-sans text-xs font-normal normal-case text-muted">
                    {item.selectedAddons.map((a) => a.name).join(', ')}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-muted">₹ {unit * item.quantity}</span>
            </li>
          );
        })}
      </ul>
      <dl className="space-y-2 border-t border-border pt-3 font-sans text-sm">
        <div className="flex justify-between text-muted">
          <dt>Subtotal</dt>
          <dd>₹ {subtotal}</dd>
        </div>
        <div className="flex justify-between text-muted">
          <dt>Fee</dt>
          <dd>₹ {fee}</dd>
        </div>
        <div className="flex justify-between font-display text-lg font-semibold text-fg sm:text-xl">
          <dt>Total</dt>
          <dd>₹ {subtotal + fee}</dd>
        </div>
      </dl>
      <button
        type="button"
        disabled={disabled}
        onClick={onPlaceOrder}
        className="mt-6 w-full rounded-xl bg-primary py-3 font-display text-sm font-semibold uppercase text-on-primary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Place Order
      </button>
      <p className="mt-3 text-center font-sans text-xs text-muted">
        By placing an order you agree to our{' '}
        <a href="/terms" className="text-primary underline">
          Terms
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-primary underline">
          Privacy Policy
        </a>
        .
      </p>
    </aside>
  );
};

export default OrderSummary;
