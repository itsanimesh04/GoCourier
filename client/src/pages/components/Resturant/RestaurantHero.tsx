import { BiHeart, BiSolidHeart, BiStar } from 'react-icons/bi';
import type { Restaurant } from '../../../utils/types';

interface RestaurantHeroProps {
  restaurant: Restaurant;
  wishlisted: boolean;
  onToggleWishlist: () => void;
}

const RestaurantHero = ({
  restaurant,
  wishlisted,
  onToggleWishlist,
}: RestaurantHeroProps) => {
  return (
    <div className="relative min-h-60 overflow-hidden bg-bg text-fg sm:min-h-70 md:min-h-80">
      <div className="absolute inset-0">
        <img
          src={restaurant.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/60 to-bg/20" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-60 max-w-7xl flex-col justify-end px-4 py-12 sm:min-h-70 sm:py-16 md:min-h-80 md:px-10 md:py-20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-full">
            <span
              className={`mb-3 inline-block rounded-lg px-2 py-0.5 font-sans text-xs font-bold uppercase tracking-wider ${
                restaurant.isOpen ? 'bg-fg text-bg' : 'bg-surface-2 text-muted'
              }`}
            >
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </span>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-fg sm:text-3xl">
              {restaurant.name}
            </h1>
            <p className="mt-2 font-sans text-sm text-muted">{restaurant.cuisine}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 font-sans text-sm text-fg sm:gap-4">
              <span className="flex items-center gap-1">
                <BiStar className="fill-yellow-400 text-yellow-400" size={18} />
                {restaurant.rating.toFixed(1)}
              </span>
              <span>{restaurant.etaMinutes} mins</span>
              <span>{restaurant.distanceKm} km</span>
              <span>
                {restaurant.openTime} – {restaurant.closeTime}
              </span>
            </div>
          </div>

          <button
            type="button"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={onToggleWishlist}
            className="rounded-xl border border-border bg-surface/80 p-3 text-fg hover:bg-fg hover:text-primary"
          >
            {wishlisted ? (
              <BiSolidHeart size={22} className="text-primary" />
            ) : (
              <BiHeart size={22} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantHero;
