import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { campuses, currentUser } from '../data/mockData';
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
import CheckoutForm from './components/Checkout/CheckoutForm';
import OrderSummary from './components/Checkout/OrderSummary';

const CheckoutPage = () => {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const fee = useAppSelector(selectDeliveryFee);
  const lastId = useAppSelector(selectLastPlacedOrderId);
  const orders = useAppSelector(selectOrders);
  const dispatch = useAppDispatch();

  const [campusId, setCampusId] = useState(
    currentUser.campus_id ?? campuses[0]?.id ?? ''
  );
  const [dropPoint, setDropPoint] = useState('Hostel Block A, Room 204');
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const placed = lastId ? orders.find((o) => o.id === lastId) : null;

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-bebas text-5xl uppercase text-tertiary">Order Placed</h1>
        <p className="mt-3 font-bebas text-2xl text-primary">{placed.displayId}</p>
        <p className="mt-2 font-sans text-gray-600">
          Delivering to {placed.dropPoint}. ETA {placed.eta}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/profile"
            onClick={() => dispatch(clearLastPlaced())}
            className="bg-primary px-6 py-3 font-bebas text-xl uppercase text-white hover:bg-red-700"
          >
            View Orders
          </Link>
          <Link
            to="/"
            onClick={() => dispatch(clearLastPlaced())}
            className="border border-tertiary px-6 py-3 font-bebas text-xl uppercase text-tertiary hover:border-primary hover:text-primary"
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
      <h1 className="mb-6 font-bebas text-3xl uppercase tracking-wide text-tertiary sm:mb-8 sm:text-4xl md:text-5xl">
        Checkout
      </h1>
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CheckoutForm
            campusId={campusId}
            dropPoint={dropPoint}
            paymentMethod={paymentMethod}
            onCampusChange={setCampusId}
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
