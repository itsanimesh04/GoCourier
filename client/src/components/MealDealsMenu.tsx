import { Link } from 'react-router-dom';

const deals = [
  { label: 'Under ₹100', href: '/food?priceTo=100' },
  { label: 'Under ₹200', href: '/food?priceTo=200' },
  { label: 'Veg Specials', href: '/food?diet=veg' },
  { label: 'Biryani Deals', href: '/food?cuisine=Biryani' },
  { label: 'Fast Food Combos', href: '/food?cuisine=Fast%20Food' },
];

const MealDealsMenu = () => {
  return (
    <div className="invisible absolute left-0 top-full z-40 min-w-56 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
      <div className="border border-gray-200 bg-white py-2 text-tertiary shadow-lg">
        {deals.map((deal) => (
          <Link
            key={deal.label}
            to={deal.href}
            className="block px-4 py-2 font-bebas text-lg uppercase tracking-wide hover:bg-gray-50 hover:text-primary"
          >
            {deal.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MealDealsMenu;
