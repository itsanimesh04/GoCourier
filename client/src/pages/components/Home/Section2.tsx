import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { foodCategories } from "../../../data/homepageData";
import { BiSearch } from "react-icons/bi";

const Section2 = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/food?q=${encodeURIComponent(q)}` : "/food");
  };

  return (
    <section className="w-full border-b border-gray-200 bg-white py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="w-full flex justify-center items-center mb-8">
            <h2 className="text-3xl font-bebas text-tertiary "> SEARCH YOUR FOOD</h2>
        </div>
        
        {/* Search Bar - Boxy Style */}
        <form onSubmit={submit} className="relative mx-auto max-w-2xl mb-12">
          <BiSearch
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search restaurants, dishes, cuisines…"
            className="w-full border border-gray-300 bg-white py-3.5 pl-12 pr-32 text-sm text-gray-900 rounded-none placeholder:text-gray-400 focus:border-red-600 focus:outline-none"
            aria-label="Search food"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-red-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-none hover:bg-red-700 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Categories Grid - Matching the reference layout */}
        <div className="flex flex-wrap gap-2 justify-center">
          {foodCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() =>
                navigate(`/food?q=${encodeURIComponent(cat.name)}`)
              }
              className=" h-fit text-left  border-gray-200 bg-white hover:border-gray-400 transition-all flex flex-1 flex-col space-y-3 items-center rounded-none"
            >
                <div className="w-32.5 h-25">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="h-full w-full object-cover"
                />
                </div>

                  <h3 className="text-lg font-bebas uppercase tracking-tight text-gray-900 leading-tight">
                    {cat.name}
                  </h3>
                

               
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Section2;