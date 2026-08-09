import { Link } from 'react-router-dom';
import { getMenuItemById, getRestaurantById } from '../../../data/selectors';
import { useAppSelector } from '../../../store';
import {
  selectFoodWishlist,
  selectRestaurantWishlist,
} from '../../../store/slices/wishlistSlice';

const WishlistSection = () => {
  const foodIds = useAppSelector(selectFoodWishlist);
  const restaurantIds = useAppSelector(selectRestaurantWishlist);

  const foods = foodIds.map(getMenuItemById).filter(Boolean);
  const restos = restaurantIds.map(getRestaurantById).filter(Boolean);

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="mb-4 font-display text-lg font-bold uppercase text-fg sm:text-xl">Wishlist</h2>

      {foods.length === 0 && restos.length === 0 ? (
        <p className="font-sans text-sm text-muted">
          Heart items and restaurants to save them here.
        </p>
      ) : (
        <div className="space-y-6">
          {foods.length > 0 && (
            <div>
              <h3 className="mb-2 font-sans text-sm uppercase text-muted">Food</h3>
              <ul className="space-y-2">
                {foods.map(
                  (item) =>
                    item && (
                      <li key={item.id}>
                        <Link
                          to={`/food/foods/${item.id}`}
                          className="flex items-center gap-3 hover:opacity-80"
                        >
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <span className="font-display text-sm font-semibold uppercase text-fg">
                            {item.name}
                          </span>
                        </Link>
                      </li>
                    )
                )}
              </ul>
            </div>
          )}
          {restos.length > 0 && (
            <div>
              <h3 className="mb-2 font-sans text-sm uppercase text-muted">
                Restaurants
              </h3>
              <ul className="space-y-2">
                {restos.map(
                  (r) =>
                    r && (
                      <li key={r.id}>
                        <Link
                          to={`/food/restaurants/${r.id}`}
                          className="flex items-center gap-3 hover:opacity-80"
                        >
                          <img
                            src={r.imageUrl}
                            alt=""
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <span className="font-display text-sm font-semibold uppercase text-fg">
                            {r.name}
                          </span>
                        </Link>
                      </li>
                    )
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default WishlistSection;
