import { Link } from 'react-router-dom';
import { getAllCategories } from '../data/selectors';

const CuisineMenu = () => {
  const categories = getAllCategories();

  return (
    <div className="invisible absolute left-0 top-full z-40 min-w-52 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
      <div className="border border-gray-200 bg-white py-2 text-tertiary shadow-lg">
      {categories.map((cat) => (
        <Link
          key={cat}
          to={`/food?cuisine=${encodeURIComponent(cat)}`}
          className="block px-4 py-2 font-bebas text-lg uppercase tracking-wide hover:bg-gray-50 hover:text-primary"
        >
          {cat}
        </Link>
      ))}
      <Link
          to="/food"
          className="mt-1 block border-t border-gray-100 px-4 py-2 font-bebas text-lg uppercase tracking-wide text-primary hover:bg-gray-50"
        >
          View All
        </Link>
      </div>
    </div>
  );
};

export default CuisineMenu;
