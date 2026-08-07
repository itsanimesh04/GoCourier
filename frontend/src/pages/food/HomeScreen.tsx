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
} from '../../components/ui';
import { useAppState } from '../../state/AppState';
import { useCountdown } from '../../lib/useCountdown';
import { ServiceModeSwitch } from '../../components/common/ServiceModeSwitch';
import { routes } from '../../lib/serviceMode';
import { foodCategories } from '../../data/homepageData';

const FOOD_CATEGORIES = [{ label: 'All' }, ...foodCategories.map((c) => ({ label: c.name }))];

export function HomeScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurants, menuItems, cartItems, selectedCampus, loadRestaurants } = useAppState();
  const urlQ = new URLSearchParams(location.search).get('q') ?? '';
  const [query, setQuery] = useState(urlQ);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const timerParam = new URLSearchParams(location.search).get('timer');
  const initialSeconds = timerParam === 'low' ? 205 : timerParam === 'cutoff' ? 0 : 2052;
  const secondsLeft = useCountdown(initialSeconds);

  useEffect(() => {
    setQuery(urlQ);
  }, [urlQ]);

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
    const haystack =
      `${restaurant.name} ${restaurant.cuisine} ${restaurantMenu.map((item) => item.name).join(' ')}`.toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' ||
      restaurant.cuisine.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      restaurantMenu.some((item) => item.category?.toLowerCase().includes(selectedCategory.toLowerCase()));
    return matchesQuery && matchesCategory;
  });

  return (
    <AppShell
      bottomNav={<BottomNav cartCount={cartItems.length} />}
      className="px-0"
      contentClassName="content-rail py-4 sm:py-6"
    >
      <div className="mb-6 flex min-h-[44px] items-center justify-between gap-4">
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2">
          <Logo compact />
        </button>
        <CampusLocation
          label={selectedCampus?.name || 'Select Campus'}
          onClick={() => navigate('/campus')}
        />
      </div>

      <div className="mb-6">
        <ServiceModeSwitch />
      </div>

      <div className="mb-6 flex justify-center">
        <CountdownCard
          label="Beat the clock"
          secondsLeft={secondsLeft}
          totalSeconds={2052}
          note="Cart locks when timer hits zero"
        />
      </div>

      <TextInput
        value={query}
        onChange={setQuery}
        placeholder="Search dishes, restaurants, cuisines..."
        icon={<Search size={19} />}
      />

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {FOOD_CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.label;
          return (
            <button
              key={cat.label}
              type="button"
              onClick={() => setSelectedCategory(cat.label)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold premium-transition ${
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted hover:border-border/80 hover:text-foreground'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-baseline justify-between border-b border-border/40 pb-2">
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {selectedCategory === 'All' ? 'Campus restaurants' : `${selectedCategory} kitchens`}
        </h2>
        <span className="text-xs font-medium text-muted">
          {visibleRestaurants.length} {visibleRestaurants.length === 1 ? 'partner' : 'partners'}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleRestaurants.length ? (
          visibleRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onClick={() => navigate(routes.foodRestaurant(restaurant.id))}
            />
          ))
        ) : (
          <div className="col-span-full">
            <EmptyStateBlock
              icon={<Search size={48} />}
              heading="No restaurants match your filter"
              subtext="Try switching category or clearing search"
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
