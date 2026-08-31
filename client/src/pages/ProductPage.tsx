import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import FoodCard from '../components/FoodCard';
import { getRelatedFoods } from '../data/relatedFoods';
import { lineUnitTotal } from '../data/selectors';
import { useAppDispatch, useAppSelector } from '../store';
import { selectMenuItems, selectRestaurants } from '../store/slices/catalogSlice';
import { addFoodItem } from '../store/slices/cartSlice';
import {
  selectIsFoodWishlisted,
  toggleFoodWishlist,
} from '../store/slices/wishlistSlice';
import ProductActions from './components/product/ProductActions';
import ProductGallery from './components/product/ProductGallery';
import ProductInfo from './components/product/ProductInfo';
import {
  hasCustomizableAddons,
  useAddonCustomize,
} from '../components/AddonCustomizeSheet';

const ProductPage = () => {
  const { id = '' } = useParams();
  const menuItems = useAppSelector(selectMenuItems);
  const restaurants = useAppSelector(selectRestaurants);
  const item = menuItems.find((m) => m.id === id);
  const restaurant = item ? restaurants.find((r) => r.id === item.restaurantId) : undefined;
  const dispatch = useAppDispatch();
  const { openCustomize } = useAddonCustomize();
  const wishlisted = useAppSelector(selectIsFoodWishlisted(id));

  const [quantity, setQuantity] = useState(1);
  const [addedFlash, setAddedFlash] = useState(false);

  const related = useMemo(
    () => (item ? getRelatedFoods(item, menuItems) : []),
    [item, menuItems]
  );

  if (!item) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-fg sm:text-3xl">
          Item not found
        </h1>
        <Link
          to="/"
          className="mt-4 inline-block font-sans text-sm font-semibold text-primary underline"
        >
          Browse food
        </Link>
      </div>
    );
  }

  const customizable = hasCustomizableAddons(item);
  const unitTotal = lineUnitTotal(item.price, []) * quantity;

  const handleAdd = () => {
    if (customizable) {
      openCustomize({ menuItem: item, mode: 'add', initialQuantity: quantity });
      return;
    }
    dispatch(
      addFoodItem({
        menuItemId: item.id,
        restaurantId: item.restaurantId,
        name: item.name,
        imageUrl: item.imageUrl,
        unitPrice: item.price,
        quantity,
        selectedAddons: [],
      })
    );
    setAddedFlash(true);
    window.setTimeout(() => setAddedFlash(false), 1800);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 md:px-10">
      <nav className="mb-4 flex flex-wrap items-center gap-x-2 font-sans text-xs uppercase tracking-wide text-muted sm:mb-6 sm:text-sm">
        <Link to="/food" className="hover:text-primary">
          Food
        </Link>
        {restaurant && (
          <>
            <span>/</span>
            <Link
              to={`/food/restaurants/${restaurant.id}`}
              className="hover:text-primary"
            >
              {restaurant.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-fg">{item.name}</span>
      </nav>

      <div className="grid gap-6 sm:gap-10 lg:grid-cols-2">
        <ProductGallery imageUrl={item.imageUrl} name={item.name} />
        <div className="min-w-0">
          <ProductInfo item={item} restaurant={restaurant} />
          <ProductActions
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={handleAdd}
            wishlisted={wishlisted}
            onToggleWishlist={() => dispatch(toggleFoodWishlist(item.id))}
            disabled={!item.isAvailable}
            unitTotal={unitTotal}
            customizeLabel={customizable}
          />
          {addedFlash && (
            <p className="mt-3 font-display text-sm font-semibold uppercase text-primary">
              Added to cart
            </p>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12 border-t border-border pt-10 sm:mt-16 sm:pt-12">
          <h2 className="mb-1 font-display text-lg font-bold text-fg sm:text-xl">
            Related foods
          </h2>
          <p className="mb-5 font-sans text-xs text-muted sm:text-sm">
            More from {item.category ?? 'this kitchen'} and {restaurant?.name ?? 'nearby partners'}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {related.map((food) => (
              <FoodCard key={food.id} menuItem={food} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductPage;
