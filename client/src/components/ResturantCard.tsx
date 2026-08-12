import { BiHeart, BiSolidHeart, BiStar } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
  selectIsRestaurantWishlisted,
  toggleRestaurantWishlist,
} from '../store/slices/wishlistSlice';
import type { Restaurant } from '../utils/types';

const ResturantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const wishlisted = useAppSelector(selectIsRestaurantWishlisted(restaurant.id));

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-primary">
      <button
        type="button"
        className="flex w-full flex-1 flex-col text-left"
        onClick={() => navigate(`/food/restaurants/${restaurant.id}`)}
      >
        <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden bg-surface-2">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          <span
            className={`absolute left-2 top-2 z-10 rounded-lg px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider ${
              restaurant.isOpen
                ? 'bg-fg text-bg'
                : 'bg-surface-2 text-muted'
            }`}
          >
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-2.5 sm:p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 flex-1 truncate font-display text-sm font-semibold text-fg sm:text-base">
              {restaurant.name}
            </h3>
            <div className="flex shrink-0 items-center gap-0.5 font-sans text-xs text-muted">
              <BiStar className="fill-yellow-500 text-yellow-500" size={12} />
              <span>{restaurant.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="mt-1 line-clamp-1 font-sans text-[11px] text-muted sm:text-xs">
            {restaurant.cuisine}
          </p>

          <p className="mt-1 line-clamp-2 font-sans text-[11px] leading-snug text-muted">
            {restaurant.address}
          </p>
        </div>
      </button>

      <button
        type="button"
        aria-label={wishlisted ? 'Remove from favourites' : 'Add to favourites'}
        onClick={(e) => {
          e.stopPropagation();
          dispatch(toggleRestaurantWishlist(restaurant.id));
        }}
        className="absolute right-2 top-2 z-10 rounded-xl bg-surface/90 p-1.5 text-fg transition-colors hover:bg-surface"
      >
        {wishlisted ? (
          <BiSolidHeart size={16} className="text-primary" />
        ) : (
          <BiHeart size={16} />
        )}
      </button>
    </div>
  );
};

export default ResturantCard;
