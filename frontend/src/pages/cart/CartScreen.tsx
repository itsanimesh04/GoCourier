import { useNavigate } from 'react-router-dom';
import {
  AppShell,
  BillSummary,
  BottomNav,
  Clock,
  EmptyStateBlock,
  Minus,
  Plus,
  PrimaryButton,
  ScreenHeader,
  ShoppingCart,
  Zap
} from '../../components/ui';
import { useAppState } from '../../state/AppState';
import { useCartLines } from '../../lib/useCartLines';
import { useCountdown } from '../../lib/useCountdown';
import { formatINR, formatTime, itemCountLabel } from '../../lib/utils';

function MenuQuantity({
  quantity,
  onIncrement,
  onDecrement
}: {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="grid h-9 w-full grid-cols-3 overflow-hidden rounded-xl border border-primary/40 bg-primary/10 font-display text-sm font-bold text-primary">
      <button
        className="grid h-full place-items-center transition hover:bg-primary/20 premium-scale"
        type="button"
        onClick={onDecrement}
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>
      <div className="grid place-items-center text-foreground font-bold">{quantity}</div>
      <button
        className="grid h-full place-items-center transition hover:bg-primary/20 premium-scale"
        type="button"
        onClick={onIncrement}
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export function CartScreen() {
  const navigate = useNavigate();
  const { cartItems, removeItem, addItem, order } = useAppState();
  const { lines, subtotal, fee, total, restaurant } = useCartLines();
  const lockSeconds = useCountdown(1725);

  return (
    <AppShell bottomNav={<BottomNav cartCount={cartItems.length} />} className="px-0" contentClassName="content-rail py-4">
      <ScreenHeader title="Your Cart" />
      {lines.length && restaurant ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-7 space-y-4">
            <section className="card-gradient flex min-h-[72px] items-center gap-3 rounded-card border border-border p-3">
              <img src={restaurant.imageUrl} alt={restaurant.name} className="h-14 w-14 rounded-xl object-cover" />
              <div>
                <h2 className="font-display text-base font-bold text-foreground">{restaurant.name}</h2>
                <p className="text-sm text-muted">{itemCountLabel(lines.length)}</p>
              </div>
            </section>
            <div className="space-y-3">
              {lines.map(({ cartItem, item }) => (
                <article key={item.id} className="card-gradient flex min-h-[76px] items-center gap-3 rounded-card border border-border p-3">
                  <img src={item.imageUrl} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-sm font-bold text-foreground">{item.name}</h3>
                    <p className="font-display text-sm font-bold text-foreground">{formatINR(item.price * cartItem.quantity)}</p>
                  </div>
                  {cartItem.quantity > 1 ? (
                    <span className="hidden rounded-full bg-muted/10 px-2.5 py-1 text-sm text-muted sm:inline-flex">
                      ×{cartItem.quantity}
                    </span>
                  ) : null}
                  <div className="w-[108px] shrink-0">
                    <MenuQuantity
                      quantity={cartItem.quantity}
                      onIncrement={() => addItem(item.id)}
                      onDecrement={() => removeItem(item.id)}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 space-y-4">
            <BillSummary subtotal={subtotal} fee={fee} total={total} />
            <section className="rounded-card border border-secondary/30 bg-secondary/10 p-4">
              <p className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                <Zap size={18} className="text-secondary" /> Cart locks in <span className="timer-nums text-secondary">{formatTime(lockSeconds)}</span>
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                <Clock size={16} /> Expected delivery: <span className="text-secondary">{order.eta || '25-30 mins'}</span>
              </p>
            </section>
            <div className="pt-2">
              <PrimaryButton disabled={lockSeconds <= 0} onClick={() => navigate('/checkout')}>
                Checkout ({formatINR(total)})
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : (
        <EmptyStateBlock
          icon={<ShoppingCart size={52} />}
          heading="Your cart is empty"
          subtext="Add delicious items from campus restaurants"
          action="Browse restaurants"
          onAction={() => navigate('/food')}
        />
      )}
    </AppShell>
  );
}
