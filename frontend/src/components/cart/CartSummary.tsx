import { ArrowRight } from '../icons';
import { formatINR, itemCountLabel } from '../../lib/utils';

export interface CartBarProps {
  count: number;
  total: number;
  onClick: () => void;
}

export function CartBar({ count, total, onClick }: CartBarProps) {
  return (
    <div className="w-full rounded-2xl bg-primary p-1.5 shadow-cta transition-all animate-scooter-in">
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[48px] w-full items-center justify-between rounded-xl px-4 font-display font-bold text-primary-foreground transition premium-scale"
      >
        <div className="flex items-center gap-2.5">
          <span className="rounded-md bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
            {itemCountLabel(count)}
          </span>
          <span className="text-base">{formatINR(total)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold tracking-wide uppercase">
          <span>View Cart</span>
          <ArrowRight size={17} />
        </div>
      </button>
    </div>
  );
}

export interface BillSummaryProps {
  subtotal: number;
  fee: number;
  total: number;
}

export function BillSummary({ subtotal, fee, total }: BillSummaryProps) {
  return (
    <section className="card-gradient rounded-card border border-border p-4 shadow-elevated">
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span>
          <span className="font-display font-bold text-foreground">{formatINR(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>Delivery fee</span>
          <span className="font-display font-bold text-foreground">{formatINR(fee)}</span>
        </div>
        <div className="border-t border-dashed border-border pt-4">
          <div className="flex items-end justify-between">
            <span className="font-display text-lg font-bold text-foreground">Total</span>
            <span className="font-display text-[30px] font-bold text-foreground">{formatINR(total)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
