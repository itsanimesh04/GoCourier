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
    <section className="border border-gray-200 p-5">
      <h2 className="mb-4 font-bebas text-2xl uppercase text-tertiary">Wishlist</h2>

      {foods.length === 0 && restos.length === 0 ? (
        <p className="font-sans text-sm text-gray-600">
          Heart items and restaurants to save them here.
        </p>
      ) : (
        <div className="space-y-6">
          {foods.length > 0 && (
            <div>
              <h3 className="mb-2 font-bebas text-lg uppercase text-gray-500">Food</h3>
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
                            className="h-12 w-12 object-cover"
                          />
                          <span className="font-bebas text-lg uppercase text-tertiary">
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
              <h3 className="mb-2 font-bebas text-lg uppercase text-gray-500">
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
                            className="h-12 w-12 object-cover"
                          />
                          <span className="font-bebas text-lg uppercase text-tertiary">
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
