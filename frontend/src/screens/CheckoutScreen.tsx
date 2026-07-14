import { useNavigate } from 'react-router-dom';
import {
  AppShell,
  BillSummary,
  Clock,
  MapPin,
  PrimaryButton,
  ScreenHeader,
  TextInput,
  Zap
} from '../components/ui';
import { useAppState } from '../state/AppState';
import { useCartLines } from '../lib/useCartLines';
import { useCountdown } from '../lib/useCountdown';
import { formatINR, formatTime } from '../lib/utils';

export function CheckoutScreen() {
  const navigate = useNavigate();
  const { order, setDropPoint, createOrder } = useAppState();
  const { lines, subtotal, fee, total, restaurant } = useCartLines();
  const lockSeconds = useCountdown(754);

  return (
    <AppShell>
      <div className="flex flex-col max-w-2xl mx-auto w-full">
        <ScreenHeader title="Almost there" />
        <section className="card-gradient rounded-card border border-border p-4">
          <label className="block font-display text-sm font-bold">Where should we drop it?</label>
          <div className="mt-3">
            <TextInput value={order.dropPoint} onChange={setDropPoint} placeholder="Hostel Block A, Room 204" icon={<MapPin size={18} />} helper="Be specific - helps riders find you" />
          </div>
        </section>
        <section className="card-gradient mt-4 rounded-card border border-border p-4">
          <div className="flex items-start gap-3">
            {restaurant ? <img src={restaurant.imageUrl} alt={restaurant.name} className="h-14 w-14 rounded-[14px] object-cover" /> : null}
            <div>
              <h2 className="font-display text-base font-bold">{restaurant?.name ?? 'The Rising Cafe'}</h2>
              <p className="mt-1 text-xs leading-5 text-muted">{lines.map(({ cartItem, item }) => `${item.name} x${cartItem.quantity}`).join(' - ')}</p>
            </div>
          </div>
          <div className="mt-5">
            <BillSummary subtotal={subtotal} fee={fee} total={total} />
          </div>
        </section>
        <section className="mt-4 rounded-card border border-urgent/40 bg-urgent/10 p-4">
          <p className="flex items-center gap-2 font-display text-sm font-bold">
            <Zap size={18} className="text-urgent" /> Locks in <span className="timer-nums text-urgent">{formatTime(lockSeconds)}</span>
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted">
            <Clock size={16} /> Drops by {order.eta || '25-30 mins'}
          </p>
        </section>
        <div className="mt-8 pb-2 pt-6">
          <PrimaryButton
            disabled={!order.dropPoint.trim() || lockSeconds <= 0}
            onClick={async () => {
              const orderId = await createOrder();
              navigate(`/payment/loading?orderId=${encodeURIComponent(orderId)}`);
            }}
          >
            Pay {formatINR(total)}
          </PrimaryButton>
        </div>
      </div>
    </AppShell>
  );
}
