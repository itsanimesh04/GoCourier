import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertTriangle,
  BottomSheet,
  Check,
  Clock,
  CreditCard,
  PrimaryButton,
  ScreenHeader,
  StatusPill,
  VegMark
} from '../components/ui';
import { useAppState } from '../state/AppState';
import type { ItemStatus } from '../lib/types';
import { cn, formatINR, getOrderStatusView, paymentLabel } from '../lib/utils';

function itemStatusTone(status: ItemStatus) {
  if (status === 'confirmed') return 'success';
  if (status === 'unavailable' || status === 'refunded') return 'danger';
  return 'neutral';
}

function itemStatusLabel(status: ItemStatus, refundAmount: number) {
  if (status === 'confirmed') return 'Confirmed';
  if (status === 'unavailable') return refundAmount > 0 ? 'Unavailable - Refunded' : 'Unavailable';
  if (status === 'refunded') return 'Refunded';
  return 'Pending';
}

export function OrderTrackingScreen() {
  const { id } = useParams();
  const { order, refreshOrder } = useAppState();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (id) {
      void refreshOrder(id);
    }
  }, [id, refreshOrder]);

  const view = getOrderStatusView(order.orderStatus);
  const steps = ['Confirmed', 'Preparing', 'On the way', 'Delivered'];
  const dangerMode = view.tone === 'danger';

  return (
    <div className="flex min-h-[calc(100vh-40px)] flex-col">
      <ScreenHeader title={`Order #${order.displayId}`} right={<button type="button" onClick={() => setShowHelp(true)} className="min-h-tap text-brand">Help</button>} />
      <section className="card-gradient rounded-card border border-border p-4">
        <div className="text-center">
          <StatusPill tone={view.tone === 'danger' ? 'danger' : 'urgent'} icon={view.tone === 'danger' ? <AlertTriangle size={15} /> : <Clock size={15} />}>
            {view.pill}
          </StatusPill>
        </div>
        {dangerMode ? (
          <div className="mt-6 rounded-card border border-danger p-4 text-center text-danger">{view.helper}</div>
        ) : (
          <div className="mt-6">
            <div className="grid grid-cols-4 items-start gap-1">
              {steps.map((step, index) => {
                const done = index < view.completedSteps;
                const active = index === view.activeStep && view.completedSteps < 4;
                return (
                  <div key={step} className="relative text-center">
                    {index < steps.length - 1 ? <span className={cn('absolute left-1/2 top-3 h-0.5 w-full', done ? 'bg-success' : active ? 'bg-urgent' : 'bg-muted')} /> : null}
                    <span
                      className={cn(
                        'relative z-10 mx-auto grid h-7 w-7 place-items-center rounded-full border bg-card',
                        done ? 'border-success bg-success text-bg' : active ? 'border-urgent text-urgent shadow-[0_0_18px_rgba(212,255,79,0.36)]' : 'border-muted text-muted'
                      )}
                    >
                      {done ? <Check size={16} /> : null}
                    </span>
                    <p className={cn('mt-2 text-[11px] font-medium', active ? 'text-urgent' : done ? 'text-text' : 'text-muted')}>{step}</p>
                    {index === 0 && done ? <p className="text-[10px] text-muted">{order.placedAt || 'Just now'}</p> : null}
                    {index === 1 && active ? <p className="text-[10px] text-muted">In progress</p> : null}
                  </div>
                );
              })}
            </div>
            <p className="mt-7 text-center text-sm text-muted">
              Est. delivery <span className="timer-nums font-display text-lg font-bold text-urgent">{order.eta}</span>
            </p>
          </div>
        )}
      </section>
      <section className="card-gradient mt-3 flex min-h-[64px] items-center gap-3 rounded-card border border-border p-4">
        <CreditCard size={27} className="text-success" />
        <p className="font-display text-base font-bold text-success">
          Payment: {paymentLabel(order.paymentStatus)} <Check className="inline" size={16} />
        </p>
      </section>
      <section className="card-gradient mt-3 rounded-card border border-border p-4">
        <h2 className="font-display text-base font-bold">Your items</h2>
        <div className="mt-3 divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.id} className="py-3">
              <div className="flex items-center gap-3">
                <VegMark isVeg={item.menuItemId !== 'chicken-biryani'} />
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{item.name}</span>
                <span className="text-xs text-text">x{item.quantity}</span>
                <StatusPill tone={itemStatusTone(item.itemStatus)} icon={item.itemStatus === 'confirmed' ? <Check size={13} /> : undefined}>
                  {itemStatusLabel(item.itemStatus, item.refundAmount)}
                </StatusPill>
              </div>
              {item.refundAmount > 0 ? <p className="mt-2 pl-8 text-xs text-muted">{formatINR(item.refundAmount)} refunded to source</p> : null}
            </div>
          ))}
        </div>
      </section>
      <button onClick={() => setShowHelp(true)} className="mt-auto min-h-tap pb-4 pt-8 font-display text-sm font-bold text-brand" type="button">
        Need help with this order?
      </button>

      <BottomSheet open={showHelp} onClose={() => setShowHelp(false)}>
        <div className="text-center py-2">
          <h2 className="font-display text-xl font-bold text-text">Order Help & Support</h2>
          <p className="mt-2 text-sm text-muted">Customer support is available 24/7 for order #{order.displayId}.</p>
          <div className="mt-6 space-y-3">
            <PrimaryButton icon={false} onClick={() => setShowHelp(false)}>
              Contact Support
            </PrimaryButton>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
