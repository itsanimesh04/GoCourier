import type { Restaurant } from '../../lib/types';
import { Clock, Heart, Star } from '../icons';
import { useFavorites } from '../../lib/hooks/useFavorites';
import { cn } from '../../lib/utils';

export interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(restaurant.id);
  const isPopular = restaurant.tags.includes('Hot') || restaurant.rating >= 4.5;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-subtle premium-transition hover:shadow-card">
      <button type="button" onClick={onClick} className="block w-full text-left">
        <div className="relative aspect-[16/10] overflow-hidden bg-input">
          <img
            className="h-full w-full object-cover premium-transition group-hover:scale-[1.03]"
            src={restaurant.imageUrl}
            alt={restaurant.name}
            loading="lazy"
          />
          <span
            className={cn(
              'absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold',
              restaurant.isOpen ? 'bg-success/95 text-white' : 'bg-foreground/80 text-white'
            )}
          >
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </span>
          {isPopular ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
              Popular
            </span>
          ) : null}
        </div>
        <div className="p-4">
          <h3 className="truncate font-display text-lg font-bold text-foreground group-hover:text-primary premium-transition">
            {restaurant.name}
          </h3>
          <p className="mt-0.5 truncate text-sm text-muted">{restaurant.cuisine}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <Star size={13} className="fill-secondary text-secondary" aria-hidden />
              {restaurant.rating.toFixed(1)}
            </span>
            <span>{restaurant.etaMinutes} min</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} aria-hidden />
              {restaurant.openTime} – {restaurant.closeTime}
            </span>
          </div>
        </div>
      </button>
      <button
        type="button"
        aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(restaurant.id);
        }}
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-subtle premium-transition hover:scale-105"
      >
        <Heart size={18} className={cn(fav ? 'fill-primary text-primary' : 'text-muted')} strokeWidth={2.2} />
      </button>
    </article>
  );
}
