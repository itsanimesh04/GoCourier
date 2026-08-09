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
          <span className="rounded-lg bg-surface-2 px-2 py-0.5 font-sans text-sm uppercase text-muted">
            Out of Stock
          </span>
        )}
      </div>

      <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-fg sm:text-3xl">
        {item.name}
      </h1>

      <p className="max-w-xl font-sans text-sm text-muted">{item.description}</p>

      {restaurant && (
        <div className="flex flex-wrap items-center gap-3 font-sans text-sm text-muted sm:gap-4">
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
              restaurant.isOpen ? 'text-green-400' : 'text-muted'
            }
          >
            {restaurant.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
      )}

      {item.category && (
        <p className="font-sans text-sm uppercase tracking-wide text-muted">
          Category · {item.category}
        </p>
      )}

      <PriceDisplay price={item.price} originalPrice={item.originalPrice} size="lg" />
    </div>
  );
};

export default ProductInfo;
