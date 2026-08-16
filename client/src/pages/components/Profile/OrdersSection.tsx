import { useEffect } from 'react';
import orderService from '../../../services/order.service';
import { useAppDispatch, useAppSelector } from '../../../store';
import { selectOrders, setOrders } from '../../../store/slices/cartSlice';
import type { Order } from '../../../utils/types';

const OrdersSection = () => {
  const orders = useAppSelector(selectOrders);
  const dispatch = useAppDispatch();

  useEffect(() => {
    void orderService
      .list()
      .then((res) => {
        const rows = (res.data.data.orders ?? []) as {
          id: string;
          order_status: Order['orderStatus'];
          payment_status: Order['paymentStatus'];
          drop_point: string | null;
          total_amount: string;
          placed_at: string | null;
          restaurant?: { id?: string | null; name?: string | null };
          campus?: { id?: string };
          item_count?: number;
        }[];
        dispatch(
          setOrders(
            rows.map((row) => ({
              id: row.id,
              displayId: row.id.slice(-8).toUpperCase(),
              restaurantId: row.restaurant?.id ?? '',
              restaurantName: row.restaurant?.name ?? 'Campus extras',
              campusId: row.campus?.id ?? '',
              dropPoint: row.drop_point ?? '',
              orderStatus: row.order_status,
              paymentStatus: row.payment_status,
              subtotal: 0,
              fee: 0,
              totalAmount: Number(row.total_amount),
              eta: '',
              placedAt: row.placed_at
                ? new Date(row.placed_at).toLocaleString('en-IN')
                : '—',
              items: [],
            }))
          )
        );
      })
      .catch(() => dispatch(setOrders([])));
  }, [dispatch]);

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="mb-4 font-display text-lg font-bold uppercase text-fg sm:text-xl">Past Orders</h2>
      {orders.length === 0 ? (
        <p className="font-sans text-sm text-muted">No orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display text-sm font-semibold uppercase text-fg sm:text-base">
                    {order.displayId}
                  </p>
                  <p className="font-sans text-sm text-muted">{order.restaurantName}</p>
                </div>
                <span className="rounded-lg bg-surface-2 px-2 py-0.5 font-sans text-sm uppercase text-muted">
                  {order.orderStatus.replace(/_/g, ' ')} · {order.paymentStatus}
                </span>
              </div>
              <div className="mt-3 flex justify-between font-display text-sm font-semibold text-fg">
                <span>{order.placedAt}</span>
                <span>₹ {order.totalAmount}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default OrdersSection;
