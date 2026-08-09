import { useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import CampusBatchCard from '../../../components/CampusBatchCard';
import CatalogModeTabs from '../../../components/CatalogModeTabs';
import HeroBannerRotator from '../../../components/HeroBannerRotator';
import { extrasCategories } from '../../../data/extrasCatalog';
import { foodCategories } from '../../../data/homepageData';
import { useAppSelector } from '../../../store';
import { selectCatalogMode } from '../../../store/slices/uiSlice';

const extrasCategoryMeta: Record<string, string> = {
  Stationery:
    'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&q=80',
  Snacks:
    'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80',
  Drinks:
    'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&q=80',
  'Personal Care':
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80',
  Accessories:
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
};

const Hero = () => {
  const navigate = useNavigate();
  const catalogMode = useAppSelector(selectCatalogMode);
  const [query, setQuery] = useState('');
  const isExtras = catalogMode === 'extras';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    const base = isExtras ? '/extras' : '/food';
    navigate(q ? `${base}?q=${encodeURIComponent(q)}` : base);
  };

  const categories = isExtras
    ? extrasCategories
        .filter((c) => c !== 'All')
        .map((name) => ({
          id: name,
          name,
          imageUrl: extrasCategoryMeta[name] ?? extrasCategoryMeta.Stationery,
        }))
    : foodCategories;

  return (
    <section id="home-hero" className="w-full py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-5 flex justify-center sm:mb-6">
          <CatalogModeTabs />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center lg:mx-0 lg:max-w-none lg:items-stretch lg:text-left">
            <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-tight text-fg sm:text-2xl">
              {isExtras ? 'Search extras' : 'Search your food'}
            </h2>

            <form onSubmit={submit} className="relative mb-6 w-full max-w-md sm:mb-7 lg:max-w-lg">
              <BiSearch
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                size={18}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isExtras
                    ? 'Search stationery, snacks…'
                    : 'Search restaurants, dishes…'
                }
                className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-20 font-sans text-sm text-fg placeholder:text-muted focus:border-primary focus:outline-none sm:pr-28"
                aria-label={isExtras ? 'Search extras' : 'Search food'}
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-primary px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-on-primary transition-opacity hover:opacity-90 sm:px-4"
              >
                Search
              </button>
            </form>

            <div className="grid w-full grid-cols-4 gap-2 sm:gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    navigate(
                      isExtras
                        ? `/extras?category=${encodeURIComponent(cat.name)}`
                        : `/food?q=${encodeURIComponent(cat.name)}`
                    )
                  }
                  className="flex w-full flex-col items-center gap-1.5 text-center transition-opacity hover:opacity-80"
                >
                  <div className="relative aspect-square w-full max-w-[5.5rem] overflow-hidden rounded-xl border border-border bg-surface-2 sm:max-w-none">
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="w-full shrink-0 font-display text-[10px] font-semibold uppercase leading-tight tracking-tight text-fg sm:text-xs">
                    {cat.name}
                  </h3>
                </button>
              ))}
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-xl flex-col gap-3 lg:mx-0 lg:max-w-none">
            <CampusBatchCard />
            <HeroBannerRotator />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
