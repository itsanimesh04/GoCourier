import type { Restaurant } from '../../lib/types';
import { Star } from '../icons';

export interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  const hot = restaurant.tags.includes('Hot');
  return (
    <button
      type="button"
      onClick={onClick}
      className="card-gradient group grid min-h-[96px] w-full grid-cols-[88px_1fr_auto] items-center gap-3.5 rounded-card border border-border p-3 text-left transition duration-200 hover:border-border/80 hover:bg-surface2/50 active:scale-[0.99]"
    >
      <div className="relative h-[80px] w-[88px] overflow-hidden rounded-[14px] bg-surface2">
        <img
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          src={restaurant.imageUrl}
          alt={restaurant.name}
        />
      </div>
      <div className="min-w-0">
        <h3 className="truncate font-display text-base font-bold text-text group-hover:text-brand transition-colors">
          {restaurant.name}
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted">{restaurant.cuisine}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded bg-surface2 px-1.5 py-0.5 font-bold text-text">
            <Star size={12} className="fill-urgent text-urgent" aria-hidden />
            {restaurant.rating.toFixed(1)}
          </span>
          <span className="text-muted">•</span>
          <span className="text-muted">{restaurant.etaMinutes} mins</span>
          <span className="text-muted">•</span>
          <span className="font-medium text-success">Free delivery</span>
        </div>
      </div>
      {hot ? (
        <span className="self-start rounded-full border border-brand/40 bg-brand/10 px-2.5 py-1 font-display text-[11px] font-bold text-brand">
          Popular
        </span>
      ) : null}
    </button>
  );
}
