import React, { useEffect, useState } from 'react';
import { FiUser, FiSearch, FiShoppingBag, FiMenu, FiX } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { selectCartCount } from '../store/slices/cartSlice';
import {
  selectHeaderSearchOpen,
  setHeaderSearchOpen,
  toggleHeaderSearch,
} from '../store/slices/uiSlice';
import HeaderNav from './HeaderNav';
import HeaderSearch from './HeaderSearch';
import MobileNav from './MobileNav';

export const Header: React.FC = () => {
  const cartCount = useAppSelector(selectCartCount);
  const searchOpen = useAppSelector(selectHeaderSearchOpen);
  const dispatch = useAppDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    dispatch(setHeaderSearchOpen(false));
  }, [location.pathname, location.search, dispatch]);

  return (
    <header className="sticky top-0 z-40 w-full bg-primary font-bebas text-white transition-all">
      <div className="mx-auto flex items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 lg:py-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="p-1 hover:opacity-80 lg:hidden"
            onClick={() => {
              setMobileOpen((v) => !v);
              dispatch(setHeaderSearchOpen(false));
            }}
          >
            {mobileOpen ? <FiX className="h-6 w-6 stroke-2" /> : <FiMenu className="h-6 w-6 stroke-2" />}
          </button>

          <Link to="/" className="flex flex-col justify-center select-none shrink-0">
            <span className="text-lg leading-none tracking-wider sm:text-2xl">
              GoCourierService
            </span>
          </Link>
        </div>

        {searchOpen ? (
          <div className="flex min-w-0 flex-1 justify-center px-1 sm:px-4">
            <HeaderSearch />
          </div>
        ) : (
          <HeaderNav />
        )}

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link
            to="/login"
            className="hidden border border-white px-3 py-1 text-base uppercase tracking-wide transition-colors hover:bg-white hover:text-primary sm:inline-block md:text-lg"
          >
            Login
          </Link>

          <Link
            to="/profile"
            aria-label="Account"
            className="p-1 transition-opacity hover:opacity-80"
          >
            <FiUser className="h-5 w-5 stroke-2 sm:h-6 sm:w-6" />
          </Link>

          <button
            type="button"
            aria-label="Search"
            onClick={() => {
              dispatch(toggleHeaderSearch());
              setMobileOpen(false);
            }}
            className="p-1 transition-opacity hover:opacity-80"
          >
            <FiSearch className="h-5 w-5 stroke-2 sm:h-6 sm:w-6" />
          </button>

          <Link
            to="/cart"
            aria-label="Cart"
            className="relative p-1 transition-opacity hover:opacity-80"
          >
            <FiShoppingBag className="h-5 w-5 stroke-2 sm:h-6 sm:w-6" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#cc141c]">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <MobileNav open={mobileOpen && !searchOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
};

export default Header;
