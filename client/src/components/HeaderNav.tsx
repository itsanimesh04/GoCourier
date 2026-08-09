import { FiChevronDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { setCatalogMode } from '../store/slices/uiSlice';
import CuisineMenu from './CuisineMenu';
import MealDealsMenu from './MealDealsMenu';

const HeaderNav = () => {
  const dispatch = useAppDispatch();

  return (
    <nav className="hidden items-center gap-5 font-display text-sm font-semibold uppercase tracking-wide lg:flex">
      <Link
        to="/food"
        onClick={() => dispatch(setCatalogMode('food'))}
        className="transition-opacity hover:opacity-80"
      >
        Restaurants
      </Link>

      <div className="group relative cursor-pointer">
        <div className="flex items-center gap-1 transition-opacity hover:opacity-80">
          <span>Cuisines</span>
          <FiChevronDown className="h-4 w-4 stroke-[2.5]" />
        </div>
        <CuisineMenu />
      </div>

      <div className="group relative cursor-pointer">
        <div className="flex items-center gap-1 transition-opacity hover:opacity-80">
          <span>Meal Deals</span>
          <FiChevronDown className="h-4 w-4 stroke-[2.5]" />
        </div>
        <MealDealsMenu />
      </div>

      <Link
        to="/extras"
        onClick={() => dispatch(setCatalogMode('extras'))}
        className="transition-opacity hover:opacity-80"
      >
        Extras
      </Link>
    </nav>
  );
};

export default HeaderNav;
