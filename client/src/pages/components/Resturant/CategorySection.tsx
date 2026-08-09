import FoodCard from '../../../components/FoodCard';
import type { MenuItem } from '../../../utils/types';

interface CategorySectionProps {
  title: string;
  items: MenuItem[];
  id: string;
}

const CategorySection = ({ title, items, id }: CategorySectionProps) => {
  if (items.length === 0) return null;

  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="mb-4 font-bebas text-3xl uppercase tracking-wide text-tertiary">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <FoodCard key={item.id} menuItem={item} />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
