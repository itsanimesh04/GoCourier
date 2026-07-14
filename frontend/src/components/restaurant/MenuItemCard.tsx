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
    <div className="inline-flex h-[36px] w-[96px] items-center justify-between rounded-xl border border-brand bg-card px-2 font-display text-sm font-bold text-brand shadow-[0_4px_14px_rgba(0,0,0,0.45)]">
      <button
        className="grid h-7 w-7 place-items-center rounded-lg transition hover:bg-brand/15 active:scale-90"
        type="button"
        onClick={onDecrement}
        aria-label="Decrease quantity"
      >
        <Minus size={15} />
      </button>
      <span className="font-bold text-text">{quantity}</span>
      <button
        className="grid h-7 w-7 place-items-center rounded-lg transition hover:bg-brand/15 active:scale-90"
        type="button"
        onClick={onIncrement}
        aria-label="Increase quantity"
      >
        <Plus size={15} />
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
    <article className="card-gradient group flex items-start justify-between gap-4 rounded-card border border-border p-4 transition hover:border-border/80">
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-2">
          <VegMark isVeg={item.isVeg} />
          {item.isAvailable ? (
            <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-success uppercase">
              In Stock
            </span>
          ) : null}
        </div>
        <h3 className="mt-1.5 truncate font-display text-base font-bold text-text group-hover:text-brand transition-colors">
          {item.name}
        </h3>
        <div className="mt-1 font-display text-base font-bold text-text">
          {formatINR(item.price)}
        </div>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted">{item.description}</p>
      </div>

      <div className="flex flex-col items-center shrink-0 w-[118px]">
        <div className="relative h-[94px] w-[118px] overflow-hidden rounded-[16px] bg-surface2 shadow-md">
          <img
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            src={item.imageUrl}
            alt={item.name}
          />
        </div>
        <div className="relative -mt-4 z-10 flex justify-center w-full">
          {quantity > 0 ? (
            <QuantityStepper quantity={quantity} onIncrement={onIncrement} onDecrement={onDecrement} />
          ) : (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex h-[36px] w-[96px] items-center justify-center rounded-xl border border-brand bg-card font-display text-xs font-bold tracking-wider text-brand uppercase shadow-[0_4px_14px_rgba(0,0,0,0.45)] transition hover:bg-brand/10 active:scale-95"
            >
              ADD +
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
