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
    <aside className="border border-gray-200 p-5">
      <h2 className="mb-4 font-bebas text-2xl uppercase text-tertiary">Your Order</h2>
      <ul className="mb-4 max-h-64 space-y-3 overflow-y-auto">
        {items.map((item) => {
          const unit = lineUnitTotal(item.unitPrice, item.selectedAddons);
          return (
            <li key={item.cartKey} className="flex justify-between gap-3 font-bebas text-base">
              <span className="uppercase text-tertiary">
                {item.quantity}× {item.name}
                {item.selectedAddons.length > 0 && (
                  <span className="block font-sans text-xs normal-case text-gray-500">
                    {item.selectedAddons.map((a) => a.name).join(', ')}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-gray-700">₹ {unit * item.quantity}</span>
            </li>
          );
        })}
      </ul>
      <dl className="space-y-2 border-t border-gray-200 pt-3 font-bebas text-lg">
        <div className="flex justify-between text-gray-700">
          <dt>Subtotal</dt>
          <dd>₹ {subtotal}</dd>
        </div>
        <div className="flex justify-between text-gray-700">
          <dt>Fee</dt>
          <dd>₹ {fee}</dd>
        </div>
        <div className="flex justify-between text-2xl text-tertiary">
          <dt>Total</dt>
          <dd>₹ {subtotal + fee}</dd>
        </div>
      </dl>
      <button
        type="button"
        disabled={disabled}
        onClick={onPlaceOrder}
        className="mt-6 w-full bg-primary py-3 font-bebas text-2xl uppercase text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Place Order
      </button>
    </aside>
  );
};

export default OrderSummary;
