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
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-muted">
      <button
        type="button"
        className="flex w-full flex-1 flex-col text-left"
        onClick={() => navigate(`/food/restaurants/${restaurant.id}`)}
      >
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-surface-2">
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

        <div className="flex flex-1 flex-col items-center p-2 text-center sm:p-2.5">
          <h3 className="w-full truncate font-display text-sm font-semibold text-fg sm:text-base">
            {restaurant.name}
          </h3>
          <p className="mt-0.5 line-clamp-2 font-sans text-[11px] text-muted">
            Starting {restaurant.etaMinutes} mins • {restaurant.cuisine}
          </p>
          <div className="mt-1 flex items-center justify-center gap-1 font-sans text-xs text-muted">
            <BiStar className="fill-yellow-500 text-yellow-500" size={12} />
            <span>{restaurant.rating.toFixed(1)}</span>
          </div>

          <div className="mt-auto pt-2">
            <span className="inline-block rounded-lg border border-primary px-2 py-0.5 font-display text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
              ORDER NOW
            </span>
          </div>
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
