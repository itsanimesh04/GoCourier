import { BiHeart} from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import type { MenuItem } from "../utils/types";



const FoodCard = ({ menuItem }: { menuItem: MenuItem }) => {
  const navigate = useNavigate();

  return (
    <div className="group relative flex flex-col justify-between border border-gray-200 bg-white rounded-none transition-colors hover:border-gray-400">
      <button
        type="button"
        className="block w-full text-left"
        onClick={() => navigate(`/food/foods/${menuItem.id}`)}
      >
        {/* Square Image Box */}
        <div className="relative aspect-square  overflow-hidden bg-gray-100 rounded-none h-55 w-75">
          <img
            src={menuItem.imageUrl}
            alt={menuItem.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Card Content */}
        <div className="p-3 flex flex-col justify-between grow">
          <div>
            {/* Bold Uppercase Restaurant Name */}
            <h3 className="truncate text-xl font-bebas text-tertiary">
              {menuItem.name}
            </h3>

            {/* Subtitle / Cuisine & Price / ETA */}
            <p className="mt-1 text-sm text-gray-500 font-bebas truncate">
              {menuItem.description}
            </p>

            {/* Rating */}
            <div className="mt-1 flex items-center gap-1 text-2xl font-bebas text-gray-700">
              <span>₹ {menuItem.price}</span>
            </div>
          </div>

          {/* Boxy CTA Button (Matching BUY NOW) */}
            <div className="mt-3 w-full text-center border border-red-600 text-red-600 text-base font-bebas px-2.5 py-0.5 rounded-none group-hover:bg-red-600 group-hover:text-white transition-colors">
              ADD TO CART
            </div>
        </div>
      </button>

      {/* Optional Heart Favorite Action */}
      <button
        type="button"
        aria-label="Add to favourites"
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="absolute right-2 top-2 p-1.5 bg-white/80 hover:bg-white text-gray-700 transition-colors"
      >
        <BiHeart size={16} />
      </button>
    </div>
  );
};

export default FoodCard;
