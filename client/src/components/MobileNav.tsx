import { FiMoon, FiSun } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { selectMenuItems } from '../store/slices/catalogSlice';
import { getAllCategories } from '../data/selectors';
import { useAppDispatch, useAppSelector } from '../store';
import {
  selectTheme,
  setCatalogMode,
  toggleTheme,
} from '../store/slices/uiSlice';
import CampusPicker from './CampusPicker';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const MobileNav = ({ open, onClose }: MobileNavProps) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  if (!open) return null;
  const menuItems = useAppSelector(selectMenuItems);
  const categories = getAllCategories(menuItems).slice(0, 6);

  return (
    <div className="border-t border-on-primary/20 bg-primary lg:hidden">
      <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 font-display text-base font-semibold uppercase tracking-wide text-on-primary">
        <div className="mb-3 flex items-center justify-between gap-2 sm:hidden">
          <CampusPicker />
          <button
            type="button"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => dispatch(toggleTheme())}
            className="rounded-lg border border-on-primary/40 p-2 hover:bg-on-primary/10"
          >
            {theme === 'dark' ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
          </button>
        </div>

        <Link
          to="/food"
          onClick={() => {
            dispatch(setCatalogMode('food'));
            onClose();
          }}
          className="py-2.5 hover:opacity-80"
        >
          Restaurants
        </Link>
        <Link
          to="/extras"
          onClick={() => {
            dispatch(setCatalogMode('extras'));
            onClose();
          }}
          className="py-2.5 hover:opacity-80"
        >
          Extras
        </Link>
        <Link
          to="/food?cuisine=Fast%20Food"
          onClick={() => {
            dispatch(setCatalogMode('food'));
            onClose();
          }}
          className="py-2.5 hover:opacity-80"
        >
          Fast Food
        </Link>
        <p className="mt-2 border-t border-on-primary/20 pt-3 font-sans text-sm font-medium normal-case text-on-primary/70">
          Cuisines
        </p>
        {categories.map((cat) => (
          <Link
            key={cat}
            to={`/food?cuisine=${encodeURIComponent(cat)}`}
            onClick={() => {
              dispatch(setCatalogMode('food'));
              onClose();
            }}
            className="py-2 pl-2 text-base hover:opacity-80"
          >
            {cat}
          </Link>
        ))}
        <p className="mt-2 border-t border-on-primary/20 pt-3 font-sans text-sm font-medium normal-case text-on-primary/70">
          Meal Deals
        </p>
        <Link
          to="/food?priceTo=100"
          onClick={() => {
            dispatch(setCatalogMode('food'));
            onClose();
          }}
          className="py-2 pl-2 text-base hover:opacity-80"
        >
          Under ₹100
        </Link>
        <Link
          to="/food?diet=veg"
          onClick={() => {
            dispatch(setCatalogMode('food'));
            onClose();
          }}
          className="py-2 pl-2 text-base hover:opacity-80"
        >
          Veg Specials
        </Link>
        <Link
          to="/login"
          onClick={onClose}
          className="mt-3 rounded-xl border border-on-primary py-2.5 text-center hover:bg-on-primary hover:text-primary"
        >
          Login
        </Link>
      </nav>
    </div>
  );
};

export default MobileNav;
