import { useAppSelector } from '../../../store';
import { selectOrders } from '../../../store/slices/cartSlice';

const OrdersSection = () => {
  const orders = useAppSelector(selectOrders);

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
                  <p className="font-sans text-sm text-muted">
                    {order.restaurantName}
                  </p>
                </div>
                <span className="rounded-lg bg-surface-2 px-2 py-0.5 font-sans text-sm uppercase text-muted">
                  {order.orderStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <ul className="mt-3 space-y-1 font-sans text-sm text-muted">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.name}
                  </li>
                ))}
              </ul>
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
