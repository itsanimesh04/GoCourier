import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
  selectCatalogMode,
  setCatalogMode,
  type CatalogMode,
} from '../store/slices/uiSlice';
import { cn } from '../utils/utils';

interface CatalogModeTabsProps {
  className?: string;
  /** When true, switching tabs navigates to listing routes. */
  navigateOnChange?: boolean;
}

const tabs: { id: CatalogMode; label: string }[] = [
  { id: 'food', label: 'Food' },
  { id: 'extras', label: 'Extras' },
];

const CatalogModeTabs = ({
  className,
  navigateOnChange = false,
}: CatalogModeTabsProps) => {
  const mode = useAppSelector(selectCatalogMode);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const select = (next: CatalogMode) => {
    dispatch(setCatalogMode(next));
    if (navigateOnChange) {
      navigate(next === 'extras' ? '/extras' : '/food');
    }
  };

  return (
    <div
      className={cn(
        'inline-flex rounded-xl border border-border bg-surface p-0.5',
        className
      )}
      role="tablist"
      aria-label="Catalog mode"
    >
      {tabs.map((tab) => {
        const active = mode === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => select(tab.id)}
            className={cn(
              'rounded-lg px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-wide transition-colors sm:px-5 sm:text-sm',
              active
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-muted hover:text-fg'
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default CatalogModeTabs;
