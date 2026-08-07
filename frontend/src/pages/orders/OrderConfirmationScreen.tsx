import { useNavigate } from 'react-router-dom';
import { Check, PrimaryButton, SecondaryButton } from '../../components/ui';
import { useAppState } from '../../state/AppState';
import { cn } from '../../lib/utils';

export function OrderConfirmationScreen() {
  const navigate = useNavigate();
  const { order } = useAppState();
  return (
    <div className="relative flex min-h-[calc(100vh-40px)] flex-col justify-center overflow-hidden">
      {Array.from({ length: 16 }).map((_, index) => (
        <span
          key={index}
          className={cn('animate-confetti absolute h-2 w-2 rounded-[2px]', index % 2 ? 'bg-brand' : 'bg-urgent')}
          style={{ left: `${12 + ((index * 19) % 78)}%`, top: `${8 + ((index * 13) % 28)}%`, animationDelay: `${index * 90}ms` }}
        />
      ))}
      <div className="animate-check mx-auto grid h-24 w-24 place-items-center rounded-full bg-success text-text shadow-[0_0_40px_rgba(0,226,138,0.4)]">
        <Check size={56} strokeWidth={3.4} />
      </div>
      <h1 className="mt-10 font-display text-[44px] font-bold leading-none">You're in!</h1>
      <p className="mt-4 text-sm text-muted">Order #{order.displayId} - {order.restaurantName}</p>
      <section className="card-gradient mt-7 rounded-card border border-border p-5 text-center">
        <p className="text-sm text-muted">Drops by</p>
        <p className="timer-nums mt-2 font-display text-[48px] font-bold text-urgent">{order.eta}</p>
        <p className="mt-2 text-sm text-muted">We'll ping you when it's out for delivery</p>
      </section>
      <div className="mt-5 space-y-3">
        <PrimaryButton onClick={() => navigate(`/orders/${order.id}/tracking`)}>Track my order</PrimaryButton>
        <SecondaryButton onClick={() => navigate('/home')}>Back to browse</SecondaryButton>
      </div>
    </div>
  );
}
