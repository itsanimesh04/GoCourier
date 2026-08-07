import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from '../../../components/icons';
import { foodCategories } from '../../../data/homepageData';

export function SearchAndCategories() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/food?q=${encodeURIComponent(q)}` : '/food');
  };

  return (
    <section className="w-full border-b border-border bg-background py-10 sm:py-14">
      <div className="content-rail">
        <form onSubmit={submit} className="relative mx-auto max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search restaurants, dishes, cuisines…"
            className="w-full rounded-full border border-border bg-card py-4 pl-12 pr-28 text-base text-foreground shadow-subtle placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Search food"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Search
          </button>
        </form>

        <div className="mt-10 flex gap-5 overflow-x-auto no-scrollbar pb-2 sm:justify-center sm:flex-wrap sm:overflow-visible">
          {foodCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => navigate(`/food?q=${encodeURIComponent(cat.name)}`)}
              className="group flex w-[76px] shrink-0 flex-col items-center gap-2 sm:w-[88px]"
            >
              <span className="h-16 w-16 overflow-hidden rounded-full border border-border bg-card shadow-subtle ring-0 premium-transition group-hover:ring-2 group-hover:ring-primary/30 sm:h-[72px] sm:w-[72px]">
                <img src={cat.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
              </span>
              <span className="text-center text-xs font-semibold text-foreground sm:text-sm">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
