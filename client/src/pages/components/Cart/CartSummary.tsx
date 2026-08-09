import { Link } from 'react-router-dom';

interface CartSummaryProps {
  subtotal: number;
  fee: number;
  itemCount: number;
}

const CartSummary = ({ subtotal, fee, itemCount }: CartSummaryProps) => {
  const total = subtotal + fee;

  return (
    <aside className="border border-gray-200 p-5">
      <h2 className="mb-4 font-bebas text-2xl uppercase tracking-wide text-tertiary">
        Order Summary
      </h2>
      <dl className="space-y-2 font-bebas text-lg text-gray-700">
        <div className="flex justify-between">
          <dt>Items ({itemCount})</dt>
          <dd>₹ {subtotal}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Delivery fee</dt>
          <dd>₹ {fee}</dd>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-3 text-2xl text-tertiary">
          <dt>Total</dt>
          <dd>₹ {total}</dd>
        </div>
      </dl>
      <Link
        to="/checkout"
        className="mt-6 block w-full bg-primary py-3 text-center font-bebas text-2xl uppercase tracking-wide text-white hover:bg-red-700"
      >
        Proceed to Checkout
      </Link>
      <Link
        to="/food"
        className="mt-3 block w-full border border-tertiary py-2.5 text-center font-bebas text-lg uppercase tracking-wide text-tertiary hover:border-primary hover:text-primary"
      >
        Continue Shopping
      </Link>
    </aside>
  );
};

export default CartSummary;
