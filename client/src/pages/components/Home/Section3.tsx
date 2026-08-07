import { useNavigate } from "react-router-dom";
import { restaurants } from "../../../data/mockData";
import ResturantCard from "../../../components/ResturantCard";

export const Section3 = () => {
  const navigate = useNavigate();
  // Adjusted slice to 6 items to match the 6-column grid layout in your reference image
  const list = restaurants.slice(0, 6);

  return (
    <section className="w-full bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Centered Heading Layout matching the image */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bebas text-tertiary ">
            Available Restaurants
          </h2>
        </div>

        {/* Product / Restaurant Grid - 6 Column boxy layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {list.map((restaurant) => {
            return (
              <ResturantCard key={restaurant.id} restaurant={restaurant} />
            );
          })}
        </div>

        {/* Bottom "See All" Option */}
        <div className="mt-15 text-center">
          <button
            type="button"
            onClick={() => navigate("/food")}
            className="border-b-2 border-gray-900 pb-0.5 text-xl font-bebas uppercase tracking-widest text-tertiary hover:text-red-600 hover:border-red-600 transition-colors"
          >
            VIEW ALL RESTAURANTS →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Section3;
