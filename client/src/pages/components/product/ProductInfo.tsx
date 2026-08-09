import { Link } from 'react-router-dom';
import { BiStar } from 'react-icons/bi';
import PriceDisplay from '../../../components/PriceDisplay';
import VegBadge from '../../../components/VegBadge';
import type { MenuItem, Restaurant } from '../../../utils/types';

interface ProductInfoProps {
  item: MenuItem;
  restaurant?: Restaurant;
}

const ProductInfo = ({ item, restaurant }: ProductInfoProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <VegBadge isVeg={item.isVeg} />
        {!item.isAvailable && (
          <span className="bg-gray-200 px-2 py-0.5 font-bebas text-sm uppercase text-gray-700">
            Out of Stock
          </span>
        )}
      </div>

      <h1 className="font-bebas text-3xl uppercase tracking-wide text-tertiary sm:text-4xl md:text-5xl">
        {item.name}
      </h1>

      <p className="max-w-xl font-sans text-sm text-gray-600 sm:text-base">{item.description}</p>

      {restaurant && (
        <div className="flex flex-wrap items-center gap-3 font-bebas text-base text-gray-700 sm:gap-4 sm:text-lg">
          <Link
            to={`/food/restaurants/${restaurant.id}`}
            className="uppercase tracking-wide text-primary underline-offset-4 hover:underline"
          >
            {restaurant.name}
          </Link>
          <span className="flex items-center gap-1">
            <BiStar className="fill-yellow-500 text-yellow-500" size={16} />
            {restaurant.rating.toFixed(1)}
          </span>
          <span>{restaurant.etaMinutes} mins</span>
          <span
            className={
              restaurant.isOpen ? 'text-green-700' : 'text-gray-500'
            }
          >
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
      )}

      {item.category && (
        <p className="font-bebas text-base uppercase tracking-wide text-gray-500">
          Category · {item.category}
        </p>
      )}

      <PriceDisplay price={item.price} originalPrice={item.originalPrice} size="lg" />
    </div>
  );
};

export default ProductInfo;
