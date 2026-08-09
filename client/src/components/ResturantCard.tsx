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
    <div className="group relative flex h-full flex-col border border-gray-700 transition-colors hover:border-gray-400">
      <button
        type="button"
        className="flex w-full flex-1 flex-col text-left"
        onClick={() => navigate(`/food/restaurants/${restaurant.id}`)}
      >
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-gray-800">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          <span
            className={`absolute left-2 top-2 z-10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
              restaurant.isOpen
                ? 'bg-black text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-2.5 sm:p-3">
          <h3 className="truncate font-bebas text-lg text-white sm:text-xl">
            {restaurant.name}
          </h3>
          <p className="mt-1 line-clamp-2 font-bebas text-xs text-gray-500 sm:text-sm">
            Starting {restaurant.etaMinutes} mins • {restaurant.cuisine}
          </p>
          <div className="mt-1 flex items-center gap-1 font-bebas text-sm text-gray-700 sm:text-base">
            <BiStar className="fill-yellow-500 text-yellow-500" size={14} />
            <span>{restaurant.rating.toFixed(1)}</span>
          </div>

          <div className="mt-auto pt-2">
            <span className="inline-block border border-red-600 px-2.5 py-0.5 font-bebas text-sm text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white sm:text-base">
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
        className="absolute right-2 top-2 z-10 bg-white/90 p-1.5 text-gray-700 transition-colors hover:bg-white"
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
