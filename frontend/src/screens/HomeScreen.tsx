import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppShell,
  BottomNav,
  CampusLocation,
  CountdownCard,
  EmptyStateBlock,
  Logo,
  RestaurantCard,
  Search,
  TextInput
} from '../components/ui';
import { useAppState } from '../state/AppState';
import { useCountdown } from '../lib/useCountdown';
import { ServiceModeSwitch } from '../components/common/ServiceModeSwitch';
import { routes } from '../lib/serviceMode';

const FOOD_CATEGORIES = [
  { label: 'All', icon: '🍽️' },
  { label: 'Pizza', icon: '🍕' },
  { label: 'Burger', icon: '🍔' },
  { label: 'Biryani', icon: '🍛' },
  { label: 'Momo', icon: '🥟' },
  { label: 'Cakes', icon: '🍰' },
  { label: 'Rolls', icon: '🌯' },
  { label: 'South Indian', icon: '🥘' },
  { label: 'Chinese', icon: '🥢' }
];

export function HomeScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurants, menuItems, cartItems, selectedCampus, loadRestaurants } = useAppState();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const timerParam = new URLSearchParams(location.search).get('timer');
  const initialSeconds = timerParam === 'low' ? 205 : timerParam === 'cutoff' ? 0 : 2052;
  const secondsLeft = useCountdown(initialSeconds);

  useEffect(() => {
    const controller = new AbortController();
    const id = window.setTimeout(() => {
      void loadRestaurants(query, controller.signal);
    }, 220);
    return () => {
      window.clearTimeout(id);
      controller.abort();
    };
  }, [loadRestaurants, query]);

  const visibleRestaurants = restaurants.filter((restaurant) => {
    const restaurantMenu = menuItems.filter((item) => item.restaurantId === restaurant.id);
    const haystack = `${restaurant.name} ${restaurant.cuisine} ${restaurantMenu.map((item) => item.name).join(' ')}`.toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' ||
      restaurant.cuisine.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesQuery && matchesCategory;
  });

  return (
    <AppShell bottomNav={<BottomNav cartCount={cartItems.length} />}>
      {/* Top Bar */}
      <div className="mb-5 flex min-h-tap items-center justify-between gap-3">
        <Logo compact />
        <CampusLocation
          label={selectedCampus?.name || 'Manipal University'}
          onClick={() => navigate('/campus')}
        />
      </div>

      <div className="mb-5"><ServiceModeSwitch /></div>

      {/* Dispatch Batch Banner */}
      <div className="mb-5 flex justify-center">
        <CountdownCard label="Beat the clock" secondsLeft={secondsLeft} totalSeconds={2052} note="Cart locks when timer hits zero" />
      </div>

      {/* Search Input */}
      <TextInput
        value={query}
        onChange={setQuery}
        placeholder="Search dishes, restaurants, cuisines..."
        icon={<Search size={19} />}
      />

      {/* Categories Horizontal Scroll */}
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {FOOD_CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.label;
          return (
            <button
              key={cat.label}
              type="button"
              onClick={() => setSelectedCategory(cat.label)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                active
                  ? 'border-brand bg-brand/15 text-brand shadow-sm'
                  : 'border-border bg-card text-muted hover:border-border/80 hover:text-text'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section Header */}
      <div className="mt-6 flex items-baseline justify-between border-b border-border/40 pb-2">
        <h2 className="font-display text-lg font-bold tracking-tight text-text">
          {selectedCategory === 'All' ? 'Campus Restaurants' : `${selectedCategory} Kitchens`}
        </h2>
        <span className="text-xs font-medium text-muted">
          {visibleRestaurants.length} {visibleRestaurants.length === 1 ? 'partner' : 'partners'} open
        </span>
      </div>

      {/* Responsive Restaurant Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {visibleRestaurants.length ? (
          visibleRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} onClick={() => navigate(routes.foodRestaurant(restaurant.id))} />
          ))
        ) : (
          <div className="col-span-full">
            <EmptyStateBlock icon={<Search size={48} />} heading="No partners match your filter" subtext="Try switching your food category or clearing search" />
          </div>
        )}
      </div>
    </AppShell>
  );
}
