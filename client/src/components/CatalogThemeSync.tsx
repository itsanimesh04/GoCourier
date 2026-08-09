import { useEffect } from 'react';
import { useAppSelector } from '../store';
import { selectCatalogMode, selectTheme } from '../store/slices/uiSlice';

/** Keeps `html[data-catalog]` and `html[data-theme]` in sync with Redux. */
const CatalogThemeSync = () => {
  const catalogMode = useAppSelector(selectCatalogMode);
  const theme = useAppSelector(selectTheme);

  useEffect(() => {
    document.documentElement.dataset.catalog = catalogMode;
  }, [catalogMode]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return null;
};

export default CatalogThemeSync;
