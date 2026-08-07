import { BiHeart, BiStar } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

interface Restaurant {
  id: string;
  name: string;
  imageUrl: string;
  isOpen: boolean;
  etaMinutes: number;
  cuisine: string;
  rating: number;
}

const ResturantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  const navigate = useNavigate();

  return (
    <div className="group relative flex flex-col justify-between border border-gray-200 bg-white rounded-none transition-colors hover:border-gray-400">
      <button
        type="button"
        className="block w-full text-left"
        onClick={() => navigate(`/food/restaurants/${restaurant.id}`)}
      >
        {/* Square Image Box */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100 rounded-none">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Simple Status Tag */}
          <span
            className={`absolute left-2 top-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
              restaurant.isOpen
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {restaurant.isOpen ? "Open" : "Closed"}
          </span>
        </div>

        {/* Card Content */}
        <div className="p-3 flex flex-col justify-between grow">
          <div>
            {/* Bold Uppercase Restaurant Name */}
            <h3 className="truncate text-xl font-bebas text-tertiary">
              {restaurant.name}
            </h3>

            {/* Subtitle / Cuisine & Price / ETA */}
            <p className="mt-1 text-sm text-gray-500 font-bebas truncate">
              Starting {restaurant.etaMinutes} mins • {restaurant.cuisine}
            </p>

            {/* Rating */}
            <div className="mt-1 flex items-center gap-1 text-base font-bebas text-gray-700">
              <BiStar className="text-yellow-500 fill-yellow-500" size={14} />
              <span>{restaurant.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Boxy CTA Button (Matching BUY NOW) */}
          <div className="mt-2">
            <span className="inline-block border border-red-600 text-red-600 text-base font-bebas px-2.5 py-0.5 rounded-none group-hover:bg-red-600 group-hover:text-white transition-colors">
              ORDER NOW
            </span>
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

export default ResturantCard;
