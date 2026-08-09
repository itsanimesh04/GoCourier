import { Link } from 'react-router-dom';
import { useAppSelector } from '../store';
import {
  selectCartCount,
  selectCartItems,
  selectCartSubtotal,
  selectDeliveryFee,
} from '../store/slices/cartSlice';
import CartExtrasSection from './components/Cart/CartExtrasSection';
import CartLineItem from './components/Cart/CartLineItem';
import CartSummary from './components/Cart/CartSummary';

const CartPage = () => {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const fee = useAppSelector(selectDeliveryFee);
  const count = useAppSelector(selectCartCount);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-16 text-center md:px-10">
        <h1 className="font-display text-2xl font-bold uppercase text-fg sm:text-3xl">
          Your Cart is Empty
        </h1>
        <p className="mt-2 font-sans text-sm text-muted">
          Add some food or campus extras to get started.
        </p>
        <Link
          to="/food"
          className="mt-6 inline-block rounded-xl bg-primary px-6 py-2.5 font-sans text-sm font-semibold uppercase text-on-primary hover:opacity-90"
        >
          Browse Food
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:py-10 md:px-10">
      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide text-fg sm:text-3xl">
        Cart
      </h1>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <CartLineItem key={item.cartKey} item={item} />
          ))}
          <CartExtrasSection />
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <CartSummary subtotal={subtotal} fee={fee} itemCount={count} />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
