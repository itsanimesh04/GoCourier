import React, { useEffect, useState } from 'react';
import { FiUser, FiSearch, FiShoppingBag, FiMenu, FiX, FiMoon, FiSun } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { selectCartCount } from '../store/slices/cartSlice';
import { selectAuthUser, logoutUser } from '../store/slices/authSlice';
import {
  selectHeaderSearchOpen,
  selectTheme,
  setHeaderSearchOpen,
  toggleHeaderSearch,
  toggleTheme,
} from '../store/slices/uiSlice';
import CampusPicker from './CampusPicker';
import HeaderNav from './HeaderNav';
import HeaderSearch from './HeaderSearch';
import MobileNav from './MobileNav';

export const Header: React.FC = () => {
  const cartCount = useAppSelector(selectCartCount);
  const user = useAppSelector(selectAuthUser);
  const searchOpen = useAppSelector(selectHeaderSearchOpen);
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    dispatch(setHeaderSearchOpen(false));
  }, [location.pathname, location.search, dispatch]);

  return (
    <header className="sticky top-0 z-40 w-full bg-primary font-display text-on-primary transition-colors">
      <div className="mx-auto flex items-center justify-between gap-2 px-4 py-2 sm:gap-3 sm:px-6 sm:py-2.5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="p-1 hover:opacity-80 lg:hidden"
            onClick={() => {
              setMobileOpen((v) => !v);
              dispatch(setHeaderSearchOpen(false));
            }}
          >
            {mobileOpen ? <FiX className="h-5 w-5 stroke-2" /> : <FiMenu className="h-5 w-5 stroke-2" />}
          </button>

          <Link to="/" className="flex shrink-0 flex-col justify-center select-none">
            <span className="text-base font-bold leading-none tracking-tight sm:text-lg">
              GoCourier
            </span>
          </Link>

          <CampusPicker className="hidden sm:block" />
        </div>

        {searchOpen ? (
          <div className="flex min-w-0 flex-1 justify-center px-1 sm:px-4">
            <HeaderSearch />
          </div>
        ) : (
          <HeaderNav />
        )}

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {user ? (
            <button
              type="button"
              onClick={() => void dispatch(logoutUser())}
              className="hidden rounded-lg border border-on-primary/80 px-2.5 py-1 font-sans text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-on-primary hover:text-primary sm:inline-block"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-lg border border-on-primary/80 px-2.5 py-1 font-sans text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-on-primary hover:text-primary sm:inline-block"
            >
              Login
            </Link>
          )}

          <button
            type="button"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => dispatch(toggleTheme())}
            className="p-1 transition-opacity hover:opacity-80"
          >
            {theme === 'dark' ? (
              <FiSun className="h-5 w-5 stroke-2" />
            ) : (
              <FiMoon className="h-5 w-5 stroke-2" />
            )}
          </button>

          <Link
            to="/profile"
            aria-label="Account"
            className="p-1 transition-opacity hover:opacity-80"
          >
            <FiUser className="h-5 w-5 stroke-2" />
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
            <FiSearch className="h-5 w-5 stroke-2" />
          </button>

          <Link
            to="/cart"
            aria-label="Cart"
            className="relative p-1 transition-opacity hover:opacity-80"
          >
            <FiShoppingBag className="h-5 w-5 stroke-2" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-on-primary font-sans text-[10px] font-bold text-primary">
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
