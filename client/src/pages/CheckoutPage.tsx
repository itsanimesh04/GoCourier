import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { apiErrorMessage } from '../apis/clientApi';
import orderService from '../services/order.service';
import { useAppDispatch, useAppSelector } from '../store';
import {
  clearCartLocal,
  clearLastPlaced,
  fetchCart,
  selectCartItems,
  selectCartSubtotal,
  selectDeliveryFee,
  selectLastPlacedOrderId,
  setLastPlacedOrderId,
} from '../store/slices/cartSlice';
import { selectAuthUser } from '../store/slices/authSlice';
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
  const selectedCampusId = useAppSelector(selectSelectedCampusId);
  const user = useAppSelector(selectAuthUser);
  const dispatch = useAppDispatch();

  const [campusId, setCampusId] = useState(selectedCampusId);
  const [dropPoint, setDropPoint] = useState(user?.drop_point ?? '');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCampusId(selectedCampusId);
  }, [selectedCampusId]);

  const handleCampusChange = (id: string) => {
    setCampusId(id);
    dispatch(setSelectedCampusId(id));
  };

  const placed = lastId;

  const pay = async () => {
    if (!dropPoint.trim()) {
      setError('Enter a drop point');
      return;
    }
    setPaying(true);
    setError(null);
    try {
      const created = await orderService.create(dropPoint.trim());
      const orderId = created.data.data.order_id as string;
      const sessionRes = await orderService.pay(orderId);
      const session = sessionRes.data.data as {
        key_id: string;
        gateway_order_id: string;
        amount_subunits: number;
        currency: string;
      };

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: session.key_id,
          amount: session.amount_subunits,
          currency: session.currency,
          order_id: session.gateway_order_id,
          name: 'GoCourier',
          description: 'Campus batch order',
          prefill: {
            name: user?.name ?? undefined,
            email: user?.email ?? undefined,
            contact: user?.phone ?? undefined,
          },
          handler: () => resolve(),
          theme: { color: '#D4FF4F' },
        });
        rzp.open();
        window.setTimeout(() => reject(new Error('Payment window closed')), 15 * 60 * 1000);
      });

      dispatch(setLastPlacedOrderId(orderId));
      dispatch(clearCartLocal());
    } catch (err) {
      setError(apiErrorMessage(err));
      await dispatch(fetchCart());
    } finally {
      setPaying(false);
    }
  };

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-fg sm:text-3xl">
          Payment initiated
        </h1>
        <p className="mt-3 font-display text-lg font-semibold text-primary sm:text-xl">
          {placed.slice(-8).toUpperCase()}
        </p>
        <p className="mt-2 font-sans text-sm text-muted">
          We will confirm the order once Razorpay reports a captured payment.
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
      {error && <p className="mb-4 font-sans text-sm text-red-400">{error}</p>}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CheckoutForm
            campusId={campusId}
            dropPoint={dropPoint}
            onCampusChange={handleCampusChange}
            onDropPointChange={setDropPoint}
          />
        </div>
        <div className="lg:sticky lg:top-6 lg:self-start">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            fee={fee}
            onPlaceOrder={() => {
              if (!paying) void pay();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
