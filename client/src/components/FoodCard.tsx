import { BiHeart, BiSolidHeart } from 'react-icons/bi';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { HiOutlineBuildingStorefront } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { getRestaurantById } from '../data/selectors';
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
  const restaurant = getRestaurantById(menuItem.restaurantId);

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
    <div className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-muted">
      <button
        type="button"
        className="flex w-full flex-1 flex-col text-left"
        onClick={() => navigate(`/food/foods/${menuItem.id}`)}
      >
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-surface-2">
          <img
            src={menuItem.imageUrl}
            alt={menuItem.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {!menuItem.isAvailable && (
            <span className="absolute left-2 top-2 z-10 rounded-lg bg-surface px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-fg">
              Sold out
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3 sm:p-3.5">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <VegBadge isVeg={menuItem.isVeg} showLabel={false} />
            {menuItem.category && (
              <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide text-muted">
                {menuItem.category}
              </span>
            )}
          </div>

          <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-fg sm:text-base">
            {menuItem.name}
          </h3>

          {restaurant && (
            <p className="mt-1 flex min-w-0 items-center gap-1 font-sans text-[11px] text-muted sm:text-xs">
              <HiOutlineBuildingStorefront className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{restaurant.name}</span>
            </p>
          )}

          <p className="mt-1.5 line-clamp-3 font-sans text-xs leading-relaxed text-muted">
            {menuItem.description}
          </p>

          <PriceDisplay
            price={menuItem.price}
            originalPrice={menuItem.originalPrice}
            size="md"
            className="mt-2"
          />
        </div>
      </button>

      <div className="mt-auto px-3 pb-3 sm:px-3.5 sm:pb-3.5">
        {!menuItem.isAvailable ? (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-primary px-2 py-2 text-center font-display text-xs font-semibold text-primary opacity-40"
          >
            UNAVAILABLE
          </button>
        ) : cartQty > 0 ? (
          <div className="flex w-full items-center rounded-lg border border-primary bg-primary text-on-primary">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={handleDecrement}
              className="flex flex-1 items-center justify-center py-2 hover:opacity-80"
            >
              <FiMinus size={14} />
            </button>
            <span className="min-w-7 px-1.5 text-center font-display text-base font-semibold leading-none">
              {cartQty}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={handleIncrement}
              className="flex flex-1 items-center justify-center py-2 hover:opacity-80"
            >
              <FiPlus size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full rounded-lg border border-primary px-2 py-2 text-center font-display text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-on-primary"
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

export default FoodCard;
