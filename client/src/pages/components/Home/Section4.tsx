import type { CuisineSection } from '../../../utils/types';
import FoodCard from '../../../components/FoodCard';

interface CategoryDishSectionProps {
  section: CuisineSection;
}

const Section4 = ({ section }: CategoryDishSectionProps) => {
  if (!section.dishes.length) return null;

  return (
    <section className="w-full sm:py-2 mt-20">
      <div className="mx-auto px-4 space-y-6">
        <h2 className="text-center font-display text-lg font-bold text-fg sm:text-2xl">
          {section.title}
        </h2>
        <div className="mt-4 flex justify-center flex-wrap pb-2 sm:gap-7">
          {section.dishes.map((dish) => (
            <div key={dish.id} className="w-44 shrink-0 sm:w-52 md:w-56">
              <FoodCard menuItem={dish} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Section4;
