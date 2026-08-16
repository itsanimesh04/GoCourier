import FoodCard from '../../../components/FoodCard';
import { useAppSelector } from '../../../store';
import { selectMenuItems } from '../../../store/slices/catalogSlice';
import Section5 from './Section5';

const HomeFoodGrid = () => {
  const menuItems = useAppSelector(selectMenuItems);
  const mid = Math.ceil(menuItems.length / 2);
  const firstHalf = menuItems.slice(0, mid);
  const secondHalf = menuItems.slice(mid);

  if (menuItems.length === 0) {
    return (
      <section className="w-full py-10 text-center font-sans text-sm text-muted">
        No dishes yet for this campus. Add restaurants and menu items in admin.
      </section>
    );
  }

  return (
    <section className="w-full py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-4 text-center sm:mb-5">
          <h2 className="font-display text-lg font-bold text-fg sm:text-xl">
            All campus food
          </h2>
          <p className="mt-1 font-sans text-xs text-muted sm:text-sm">
            {menuItems.length} dishes from partner kitchens — order before cutoff
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {firstHalf.map((item) => (
            <FoodCard key={item.id} menuItem={item} />
          ))}
        </div>
      </div>

      <div className="my-8 sm:my-10">
        <Section5 />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {secondHalf.map((item) => (
            <FoodCard key={item.id} menuItem={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeFoodGrid;
