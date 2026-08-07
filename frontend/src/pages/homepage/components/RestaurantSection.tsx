import { useNavigate } from 'react-router-dom';
import { Clock, Heart, Star } from '../../../components/icons';
import { restaurants } from '../../../data/mockData';
import { useFavorites } from '../../../lib/hooks/useFavorites';
import { cn } from '../../../lib/utils';

export function RestaurantSection() {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const list = restaurants.slice(0, 8);

  return (
    <section className="w-full bg-card py-12 sm:py-16">
      <div className="content-rail">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Restaurants near campus
            </h2>
            <p className="mt-1 text-sm text-muted">Open kitchens ready for tonight&apos;s batch delivery</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/food')}
            className="shrink-0 text-sm font-semibold text-primary hover:underline"
          >
            See all
          </button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((restaurant) => {
            const fav = isFavorite(restaurant.id);
            return (
              <article
                key={restaurant.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-background shadow-subtle premium-transition hover:shadow-card"
              >
                <button
                  type="button"
                  className="block w-full text-left"
                  onClick={() => navigate(`/food/restaurants/${restaurant.id}`)}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-input">
                    <img
                      src={restaurant.imageUrl}
                      alt=""
                      className="h-full w-full object-cover premium-transition group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <span
                      className={cn(
                        'absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold',
                        restaurant.isOpen
                          ? 'bg-success/95 text-white'
                          : 'bg-foreground/80 text-white'
                      )}
                    >
                      {restaurant.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="truncate font-display text-lg font-bold text-foreground">{restaurant.name}</h3>
                    <p className="mt-0.5 truncate text-sm text-muted">{restaurant.cuisine}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        <Star size={13} className="fill-secondary text-secondary" />
                        {restaurant.rating.toFixed(1)}
                      </span>
                      <span>{restaurant.etaMinutes} min</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} />
                        {restaurant.openTime} – {restaurant.closeTime}
                      </span>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(restaurant.id);
                  }}
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-foreground shadow-subtle premium-transition hover:scale-105"
                >
                  <Heart
                    size={18}
                    className={cn(fav ? 'fill-primary text-primary' : 'text-muted')}
                    strokeWidth={2.2}
                  />
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
