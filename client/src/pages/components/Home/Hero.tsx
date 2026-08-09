import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { foodCategories } from '../../../data/homepageData';
import { BiSearch } from 'react-icons/bi';

const Hero = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/food?q=${encodeURIComponent(q)}` : '/food');
  };

  return (
    <section className="w-full py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex w-full items-center justify-center">
          <h2 className="font-bebas text-2xl text-tertiary sm:text-3xl">
            SEARCH YOUR FOOD
          </h2>
        </div>

        <form onSubmit={submit} className="relative mx-auto mb-10 max-w-2xl sm:mb-12">
          <BiSearch
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 sm:left-4"
            size={20}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search restaurants, dishes…"
            className="w-full rounded-none border border-gray-300 bg-white py-3 pl-10 pr-24 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-600 focus:outline-none sm:py-3.5 sm:pl-12 sm:pr-32"
            aria-label="Search food"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-none bg-red-600 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700 sm:px-6 sm:py-2.5 sm:text-xs"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {foodCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                navigate(`/food?q=${encodeURIComponent(cat.name)}`)
              }
              className="flex w-full flex-col items-center gap-2 bg-white text-center transition-opacity hover:opacity-80"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="w-full shrink-0 font-bebas text-sm uppercase leading-tight tracking-tight text-gray-900 sm:text-base lg:text-lg">
                {cat.name}
              </h3>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
