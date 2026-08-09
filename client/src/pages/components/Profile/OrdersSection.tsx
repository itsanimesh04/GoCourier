import { useAppSelector } from '../../../store';
import { selectOrders } from '../../../store/slices/cartSlice';

const OrdersSection = () => {
  const orders = useAppSelector(selectOrders);

  return (
    <section className="border border-gray-200 p-5">
      <h2 className="mb-4 font-bebas text-2xl uppercase text-tertiary">Past Orders</h2>
      {orders.length === 0 ? (
        <p className="font-sans text-sm text-gray-600">No orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border border-gray-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bebas text-xl uppercase text-tertiary">
                    {order.displayId}
                  </p>
                  <p className="font-bebas text-base text-gray-600">
                    {order.restaurantName}
                  </p>
                </div>
                <span className="bg-gray-100 px-2 py-0.5 font-bebas text-sm uppercase text-gray-700">
                  {order.orderStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <ul className="mt-3 space-y-1 font-sans text-sm text-gray-600">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.name}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between font-bebas text-lg text-tertiary">
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
