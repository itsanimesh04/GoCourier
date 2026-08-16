import { Link } from 'react-router-dom';
import { useAppSelector } from '../store';
import { selectMenuItems } from '../store/slices/catalogSlice';
import { getAllCategories } from '../data/selectors';

const CuisineMenu = () => {
  const menuItems = useAppSelector(selectMenuItems);
  const categories = getAllCategories(menuItems);

  return (
    <div className="invisible absolute left-0 top-full z-40 min-w-52 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface py-2 text-fg shadow-lg">
        {categories.map((cat) => (
          <Link
            key={cat}
            to={`/food?cuisine=${encodeURIComponent(cat)}`}
            className="block px-4 py-2 font-display text-lg font-semibold uppercase tracking-wide hover:bg-surface-2 hover:text-primary"
          >
            {cat}
          </Link>
        ))}
        <Link
          to="/food"
          className="mt-1 block border-t border-border px-4 py-2 font-display text-lg font-semibold uppercase tracking-wide text-primary hover:bg-surface-2"
        >
          View All
        </Link>
      </div>
    </div>
  );
};

export default CuisineMenu;
