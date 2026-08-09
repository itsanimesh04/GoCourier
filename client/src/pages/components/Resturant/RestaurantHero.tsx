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
    <div className="relative min-h-[240px] overflow-hidden bg-tertiary text-white sm:min-h-[280px] md:min-h-[320px]">
      <div className="absolute inset-0">
        <img
          src={restaurant.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[240px] max-w-7xl flex-col justify-end px-4 py-12 sm:min-h-[280px] sm:py-16 md:min-h-[320px] md:px-10 md:py-20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-full">
            <span
              className={`mb-3 inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${
                restaurant.isOpen ? 'bg-white text-tertiary' : 'bg-gray-400 text-white'
              }`}
            >
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </span>
            <h1 className="font-bebas text-3xl uppercase tracking-wide sm:text-5xl md:text-6xl">
              {restaurant.name}
            </h1>
            <p className="mt-2 font-bebas text-base text-white/80 sm:text-xl">{restaurant.cuisine}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 font-bebas text-sm sm:gap-4 sm:text-lg">
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
            className="border border-white/50 bg-black/30 p-3 hover:bg-white hover:text-primary"
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
