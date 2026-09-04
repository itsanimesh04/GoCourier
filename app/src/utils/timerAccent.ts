import { useAppSelector } from '../store';
import { selectCatalogMode } from '../store/slices/uiSlice';
import { EXTRAS_LIME, FOOD_RED } from '../theme/tokens';

const FOOD_ACCENT = FOOD_RED;

/** Timer accent is inverted vs catalog primary: food tab → neon, extras tab → red. */
export function useTimerAccent() {
  const catalogMode = useAppSelector(selectCatalogMode);
  const isFood = catalogMode === 'food';
  const accentColor = isFood ? EXTRAS_LIME : FOOD_ACCENT;

  return {
    accentColor,
    textClass: isFood ? 'text-primary-extras' : 'text-[#ff0040]',
    bgClass: isFood ? 'bg-primary-extras' : 'bg-[#ff0040]',
  };
}
