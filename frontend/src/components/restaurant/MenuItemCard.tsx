import type { MenuItem } from '../../lib/types';
import { Minus, Plus } from '../icons';
import { formatINR } from '../../lib/utils';
import { VegMark } from '../common/StatusPill';

export interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement
}: QuantityStepperProps) {
  return (
    <div className="inline-flex h-[40px] w-[104px] items-center justify-between rounded-xl border border-primary bg-card font-display text-sm font-bold text-primary shadow-subtle">
      <button
        className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-primary/10 active:scale-90"
        type="button"
        onClick={onDecrement}
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>
      <span className="font-bold text-foreground">{quantity}</span>
      <button
        className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-primary/10 active:scale-90"
        type="button"
        onClick={onIncrement}
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

export interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function MenuItemCard({
  item,
  quantity,
  onAdd,
  onIncrement,
  onDecrement
}: MenuItemCardProps) {
  return (
    <article className="card-gradient group flex items-start justify-between gap-4 rounded-card border border-border p-4 transition duration-200 hover:border-border/80">
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-2">
          <VegMark isVeg={item.isVeg} />
          {item.isAvailable ? (
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-success uppercase">
              Available
            </span>
          ) : (
            <span className="rounded-full bg-muted/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-muted uppercase">
              Sold Out
            </span>
          )}
        </div>
        <h3 className="mt-2 truncate font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
          {item.name}
        </h3>
        <div className="mt-1.5 font-display text-lg font-bold text-foreground">
          {formatINR(item.price)}
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{item.description}</p>
      </div>

      <div className="flex flex-col items-center shrink-0 w-[120px]">
        <div className="relative h-[100px] w-[120px] overflow-hidden rounded-2xl bg-muted/10 shadow-md">
          <img
            className="h-full w-full object-cover premium-transition group-hover:scale-105"
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
          />
        </div>
        <div className="relative -mt-5 z-10 flex justify-center w-full">
          {quantity > 0 ? (
            <QuantityStepper quantity={quantity} onIncrement={onIncrement} onDecrement={onDecrement} />
          ) : (
            <button
              type="button"
              onClick={onAdd}
              disabled={!item.isAvailable}
              className="inline-flex h-[40px] w-[104px] items-center justify-center rounded-xl border border-primary/30 bg-card font-display text-xs font-bold tracking-wider text-primary uppercase shadow-subtle transition hover:bg-primary/5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ADD +
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
