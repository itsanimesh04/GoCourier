import { BiHeart, BiSolidHeart } from 'react-icons/bi';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
  addFoodItem,
  decrementFoodItem,
  selectMenuItemQty,
} from '../store/slices/cartSlice';
import {
  selectIsFoodWishlisted,
  toggleFoodWishlist,
} from '../store/slices/wishlistSlice';
import type { MenuItem } from '../utils/types';
import PriceDisplay from './PriceDisplay';
import VegBadge from './VegBadge';

const FoodCard = ({ menuItem }: { menuItem: MenuItem }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const wishlisted = useAppSelector(selectIsFoodWishlisted(menuItem.id));
  const cartQty = useAppSelector(selectMenuItemQty(menuItem.id));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!menuItem.isAvailable) return;
    dispatch(
      addFoodItem({
        menuItemId: menuItem.id,
        restaurantId: menuItem.restaurantId,
        name: menuItem.name,
        imageUrl: menuItem.imageUrl,
        unitPrice: menuItem.price,
        quantity: 1,
        selectedAddons: [],
      })
    );
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    handleAddToCart(e);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(decrementFoodItem(menuItem.id));
  };

  return (
    <div className="group relative flex h-full flex-col border border-gray-200 bg-white transition-colors hover:border-gray-400">
      <button
        type="button"
        className="flex w-full flex-1 flex-col text-left"
        onClick={() => navigate(`/food/foods/${menuItem.id}`)}
      >
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-gray-100">
          <img
            src={menuItem.imageUrl}
            alt={menuItem.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {!menuItem.isAvailable && (
            <span className="absolute left-2 top-2 z-10 bg-gray-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Sold out
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-2.5 sm:p-3">
          <div className="mb-1">
            <VegBadge isVeg={menuItem.isVeg} showLabel={false} />
          </div>
          <h3 className="truncate font-bebas text-lg text-tertiary sm:text-xl">
            {menuItem.name}
          </h3>
          <p className="mt-1 line-clamp-2 font-bebas text-xs text-gray-500 sm:text-sm">
            {menuItem.description}
          </p>
          <PriceDisplay
            price={menuItem.price}
            originalPrice={menuItem.originalPrice}
            size="md"
            className="mt-1 text-xl sm:text-2xl"
          />
        </div>
      </button>

      <div className="mt-auto px-2.5 pb-2.5 sm:px-3 sm:pb-3">
        {!menuItem.isAvailable ? (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed border border-red-600 px-2.5 py-1.5 text-center font-bebas text-sm text-red-600 opacity-40 sm:text-base"
          >
            UNAVAILABLE
          </button>
        ) : cartQty > 0 ? (
          <div className="flex w-full items-center border border-red-600 bg-red-600 text-white">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={handleDecrement}
              className="flex flex-1 items-center justify-center py-1.5 hover:bg-red-700"
            >
              <FiMinus size={16} />
            </button>
            <span className="min-w-8 px-2 text-center font-bebas text-xl leading-none">
              {cartQty}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={handleIncrement}
              className="flex flex-1 items-center justify-center py-1.5 hover:bg-red-700"
            >
              <FiPlus size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full border border-red-600 px-2.5 py-1.5 text-center font-bebas text-sm text-red-600 transition-colors hover:bg-red-600 hover:text-white sm:text-base"
          >
            ADD TO CART
          </button>
        )}
      </div>

      <button
        type="button"
        aria-label={wishlisted ? 'Remove from favourites' : 'Add to favourites'}
        onClick={(e) => {
          e.stopPropagation();
          dispatch(toggleFoodWishlist(menuItem.id));
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

export default FoodCard;
