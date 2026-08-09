import CategorySection from './CategorySection';
import type { MenuItem } from '../../../utils/types';

interface RestaurantMenuProps {
  grouped: Record<string, MenuItem[]>;
  categories: string[];
  activeCategory: string | null;
  onSelectCategory: (cat: string) => void;
}

const RestaurantMenu = ({
  grouped,
  categories,
  activeCategory,
  onSelectCategory,
}: RestaurantMenuProps) => {
  return (
    <div>
      <div className="sticky top-0 z-20 -mx-4 mb-8 border-b border-gray-200 bg-white px-4 py-3 md:-mx-10 md:px-10">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onSelectCategory(cat);
                document
                  .getElementById(`cat-${cat.replace(/\s+/g, '-').toLowerCase()}`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`shrink-0 border px-3 py-1.5 font-bebas text-base uppercase tracking-wide transition-colors ${
                activeCategory === cat
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 text-tertiary hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {categories.map((cat) => (
          <CategorySection
            key={cat}
            id={`cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
            title={cat}
            items={grouped[cat] ?? []}
          />
        ))}
      </div>
    </div>
  );
};

export default RestaurantMenu;
