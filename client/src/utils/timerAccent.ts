import { useAppSelector } from '../store';
import { selectCatalogMode } from '../store/slices/uiSlice';

const FOOD_RED = '#ff0040';

/** Timer accent is inverted vs catalog primary: food tab → neon, extras tab → red. */
export function useTimerAccent() {
  const catalogMode = useAppSelector(selectCatalogMode);
  const isFood = catalogMode === 'food';

  return {
    textClass: isFood ? 'text-[var(--color-primary-extras)]' : 'text-[#ff0040]',
    bgClass: isFood ? 'bg-[var(--color-primary-extras)]' : 'bg-[#ff0040]',
    pingClass: isFood ? 'bg-[var(--color-primary-extras)]' : 'bg-[#ff0040]',
    accentColor: isFood ? 'var(--color-primary-extras)' : FOOD_RED,
  };
}
