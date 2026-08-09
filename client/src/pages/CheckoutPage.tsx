import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
  clearLastPlaced,
  placeOrder,
  selectCartItems,
  selectCartSubtotal,
  selectDeliveryFee,
  selectLastPlacedOrderId,
  selectOrders,
} from '../store/slices/cartSlice';
import {
  selectSelectedCampusId,
  setSelectedCampusId,
} from '../store/slices/uiSlice';
import CheckoutForm from './components/Checkout/CheckoutForm';
import OrderSummary from './components/Checkout/OrderSummary';

const CheckoutPage = () => {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const fee = useAppSelector(selectDeliveryFee);
  const lastId = useAppSelector(selectLastPlacedOrderId);
  const orders = useAppSelector(selectOrders);
  const selectedCampusId = useAppSelector(selectSelectedCampusId);
  const dispatch = useAppDispatch();

  const [campusId, setCampusId] = useState(selectedCampusId);

  useEffect(() => {
    setCampusId(selectedCampusId);
  }, [selectedCampusId]);

  const handleCampusChange = (id: string) => {
    setCampusId(id);
    dispatch(setSelectedCampusId(id));
  };
  const [dropPoint, setDropPoint] = useState('Hostel Block A, Room 204');
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const placed = lastId ? orders.find((o) => o.id === lastId) : null;

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-fg sm:text-3xl">
          Order Placed
        </h1>
        <p className="mt-3 font-display text-lg font-semibold text-primary sm:text-xl">
          {placed.displayId}
        </p>
        <p className="mt-2 font-sans text-sm text-muted">
          Delivering to {placed.dropPoint}. ETA {placed.eta}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/profile"
            onClick={() => dispatch(clearLastPlaced())}
            className="rounded-xl bg-primary px-6 py-2.5 font-sans text-sm font-semibold uppercase text-on-primary hover:opacity-90"
          >
            View Orders
          </Link>
          <Link
            to="/"
            onClick={() => dispatch(clearLastPlaced())}
            className="rounded-xl border border-border px-6 py-2.5 font-sans text-sm font-semibold uppercase text-fg hover:border-primary hover:text-primary"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 md:px-10">
      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide text-fg sm:mb-8 sm:text-3xl">
        Checkout
      </h1>
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CheckoutForm
            campusId={campusId}
            dropPoint={dropPoint}
            paymentMethod={paymentMethod}
            onCampusChange={handleCampusChange}
            onDropPointChange={setDropPoint}
            onPaymentChange={setPaymentMethod}
          />
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            fee={fee}
            disabled={!dropPoint.trim()}
            onPlaceOrder={() =>
              dispatch(
                placeOrder({
                  campusId,
                  dropPoint: dropPoint.trim(),
                  paymentMethod,
                })
              )
            }
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
