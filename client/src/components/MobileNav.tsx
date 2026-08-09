import { Link } from 'react-router-dom';
import { getAllCategories } from '../data/selectors';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const MobileNav = ({ open, onClose }: MobileNavProps) => {
  if (!open) return null;
  const categories = getAllCategories().slice(0, 6);

  return (
    <div className="border-t border-white/20 bg-primary lg:hidden">
      <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 font-bebas text-lg uppercase tracking-wide text-white">
        <Link to="/food" onClick={onClose} className="py-2.5 hover:opacity-80">
          Restaurants
        </Link>
        <Link
          to="/food?cuisine=Fast%20Food"
          onClick={onClose}
          className="py-2.5 hover:opacity-80"
        >
          Fast Food
        </Link>
        <p className="mt-2 border-t border-white/20 pt-3 text-sm text-white/70">Cuisines</p>
        {categories.map((cat) => (
          <Link
            key={cat}
            to={`/food?cuisine=${encodeURIComponent(cat)}`}
            onClick={onClose}
            className="py-2 pl-2 text-base hover:opacity-80"
          >
            {cat}
          </Link>
        ))}
        <p className="mt-2 border-t border-white/20 pt-3 text-sm text-white/70">Meal Deals</p>
        <Link to="/food?priceTo=100" onClick={onClose} className="py-2 pl-2 text-base hover:opacity-80">
          Under ₹100
        </Link>
        <Link to="/food?diet=veg" onClick={onClose} className="py-2 pl-2 text-base hover:opacity-80">
          Veg Specials
        </Link>
        <Link
          to="/login"
          onClick={onClose}
          className="mt-3 border border-white py-2.5 text-center hover:bg-white hover:text-primary"
        >
          Login
        </Link>
      </nav>
    </div>
  );
};

export default MobileNav;
