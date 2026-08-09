import { useNavigate } from "react-router-dom";
import { restaurants } from "../../../data/mockData";
import ResturantCard from "../../../components/ResturantCard";

export const Section3 = () => {
  const navigate = useNavigate();
  const list = restaurants.slice(0, 6);

  return (
    <section className="w-full py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-5 text-center">
          <h2 className="font-display text-lg font-bold text-fg sm:text-xl">
            Available Restaurants
          </h2>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-2 justify-items-center gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
          {list.map((restaurant) => {
            return (
              <ResturantCard key={restaurant.id} restaurant={restaurant} />
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate("/food")}
            className="border-b border-fg pb-0.5 font-display text-sm font-semibold uppercase tracking-widest text-fg transition-colors hover:border-primary hover:text-primary"
          >
            VIEW ALL RESTAURANTS →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Section3;
