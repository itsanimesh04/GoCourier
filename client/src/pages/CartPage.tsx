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
      <div className="mx-auto max-w-7xl px-4 py-20 text-center md:px-10">
        <h1 className="font-bebas text-5xl uppercase text-tertiary">Your Cart is Empty</h1>
        <p className="mt-3 font-sans text-gray-600">
          Add some food or campus extras to get started.
        </p>
        <Link
          to="/food"
          className="mt-8 inline-block bg-primary px-8 py-3 font-bebas text-2xl uppercase text-white hover:bg-red-700"
        >
          Browse Food
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 md:px-10">
      <h1 className="mb-6 font-bebas text-3xl uppercase tracking-wide text-tertiary sm:mb-8 sm:text-4xl md:text-5xl">
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
