import { FiChevronDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import CuisineMenu from './CuisineMenu';
import MealDealsMenu from './MealDealsMenu';

const HeaderNav = () => {
  return (
    <nav className="hidden items-center space-x-6 text-xl tracking-wide uppercase lg:flex">
      <Link to="/food" className="hover:opacity-80 transition-opacity">
        Restaurants
      </Link>

      <div className="relative group cursor-pointer">
        <div className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          <span>Cuisines</span>
          <FiChevronDown className="w-4 h-4 stroke-[2.5]" />
        </div>
        <CuisineMenu />
      </div>

      <div className="relative group cursor-pointer">
        <div className="flex items-center gap-1 hover:opacity-80 transition-opacity">
          <span>Meal Deals</span>
          <FiChevronDown className="w-4 h-4 stroke-[2.5]" />
        </div>
        <MealDealsMenu />
      </div>

      <Link
        to="/food?cuisine=Fast%20Food"
        className="hover:opacity-80 transition-opacity"
      >
        Fast Food
      </Link>
    </nav>
  );
};

export default HeaderNav;
