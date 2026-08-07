import { useNavigate } from 'react-router-dom';
import type { CuisineSection } from '../../../lib/types';

interface CategoryDishSectionProps {
  section: CuisineSection;
}

export function CategoryDishSection({ section }: CategoryDishSectionProps) {
  const navigate = useNavigate();

  if (!section.dishes.length) return null;

  return (
    <section className="w-full py-8 sm:py-10">
      <div className="content-rail">
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {section.title}
        </h2>
        <div className="mt-5 flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {section.dishes.map((dish) => (
            <button
              key={dish.id}
              type="button"
              onClick={() => navigate(`/food/restaurants/${dish.restaurantId}`)}
              className="w-[200px] shrink-0 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-subtle premium-transition hover:-translate-y-0.5 hover:shadow-card sm:w-[220px]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-input">
                <img src={dish.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="p-3.5">
                <h3 className="truncate font-display text-sm font-bold text-foreground">{dish.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted leading-relaxed">{dish.description}</p>
                <p className="mt-2 font-display text-sm font-bold text-primary">₹{dish.price}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
