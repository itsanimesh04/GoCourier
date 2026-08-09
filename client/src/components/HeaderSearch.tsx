import { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
  selectCatalogMode,
  setHeaderSearchOpen,
} from '../store/slices/uiSlice';

const HeaderSearch = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const catalogMode = useAppSelector(selectCatalogMode);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    const base = catalogMode === 'extras' ? '/extras' : '/food';
    navigate(q ? `${base}?q=${encodeURIComponent(q)}` : base);
    dispatch(setHeaderSearchOpen(false));
    setQuery('');
  };

  return (
    <form onSubmit={submit} className="flex w-full max-w-xl items-center gap-2 font-sans">
      <div className="flex min-w-0 flex-1 items-center rounded-lg border border-on-primary/40 bg-on-primary/10 px-2 py-1 sm:px-2.5 sm:py-1.5">
        <FiSearch className="mr-1.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={catalogMode === 'extras' ? 'Search extras…' : 'Search food…'}
          className="w-full min-w-0 bg-transparent text-xs normal-case tracking-normal text-on-primary outline-none placeholder:text-on-primary/70 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        className="hidden rounded-lg border border-on-primary px-2.5 py-1 text-xs font-semibold uppercase tracking-wide hover:bg-on-primary hover:text-primary sm:inline-block sm:px-3 sm:py-1.5 sm:text-sm"
      >
        Go
      </button>
      <button
        type="button"
        aria-label="Close search"
        onClick={() => dispatch(setHeaderSearchOpen(false))}
        className="p-1 hover:opacity-80"
      >
        <FiX className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </form>
  );
};

export default HeaderSearch;
