import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import { selectCatalogMode, selectTheme } from '../store/slices/uiSlice';

const FOOD_THEME_PATHS = ['/cart', '/checkout'];

/** Keeps `html[data-catalog]` and `html[data-theme]` in sync with Redux. */
const CatalogThemeSync = () => {
  const catalogMode = useAppSelector(selectCatalogMode);
  const theme = useAppSelector(selectTheme);
  const { pathname } = useLocation();

  useEffect(() => {
    const forceFoodTheme = FOOD_THEME_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );
    document.documentElement.dataset.catalog = forceFoodTheme ? 'food' : catalogMode;
  }, [catalogMode, pathname]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return null;
};

export default CatalogThemeSync;
