import { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { setHeaderSearchOpen } from '../store/slices/uiSlice';
import { useAppDispatch } from '../store';

const HeaderSearch = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/food?q=${encodeURIComponent(q)}` : '/food');
    dispatch(setHeaderSearchOpen(false));
    setQuery('');
  };

  return (
    <form onSubmit={submit} className="flex w-full max-w-2xl items-center gap-2 sm:gap-3">
      <div className="flex min-w-0 flex-1 items-center border border-white/40 bg-white/10 px-2 py-1.5 sm:px-3 sm:py-2">
        <FiSearch className="mr-2 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search food..."
          className="w-full min-w-0 bg-transparent font-sans text-sm normal-case tracking-normal text-white outline-none placeholder:text-white/70 sm:text-base"
        />
      </div>
      <button
        type="submit"
        className="hidden border border-white px-3 py-1.5 text-base uppercase tracking-wide hover:bg-white hover:text-primary sm:inline-block sm:px-4 sm:py-2 sm:text-lg"
      >
        Go
      </button>
      <button
        type="button"
        aria-label="Close search"
        onClick={() => dispatch(setHeaderSearchOpen(false))}
        className="p-1 hover:opacity-80"
      >
        <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </form>
  );
};

export default HeaderSearch;
