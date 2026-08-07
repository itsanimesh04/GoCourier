import type { CuisineSection } from '../../../utils/types';
import FoodCard from '../../../components/FoodCard';

interface CategoryDishSectionProps {
  section: CuisineSection;
}

const Section4 = ({ section }: CategoryDishSectionProps) => {

  if (!section.dishes.length) return null;

  return (
    <section className="w-full py-8 sm:py-10">
      <div className=" px-10">
        <h2 className="font-bebas text-tertiary font-bold text-3xl">
          {section.title}
        </h2>
        <div className="mt-5 flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {section.dishes.map((dish) => (
            <FoodCard key={dish.id} menuItem={dish} />     
          ))}
        </div>
      </div>
    </section>
  );
}

export default Section4;