import type { CuisineSection } from '../../../utils/types';
import FoodCard from '../../../components/FoodCard';

interface CategoryDishSectionProps {
  section: CuisineSection;
}

const Section4 = ({ section }: CategoryDishSectionProps) => {
  if (!section.dishes.length) return null;

  return (
    <section className="w-full py-8 sm:py-10">
      <div className="px-4 sm:px-6 md:px-10">
        <h2 className="font-bebas text-2xl font-bold text-tertiary sm:text-3xl">
          {section.title}
        </h2>
        <div className="mt-5 flex gap-3 overflow-x-auto pb-2 sm:gap-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {section.dishes.map((dish) => (
            <div key={dish.id} className="w-44 shrink-0 sm:w-56 md:w-64">
              <FoodCard menuItem={dish} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Section4;
