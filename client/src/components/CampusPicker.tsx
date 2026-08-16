import { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiMapPin } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../store';
import { selectAuthUser, setUserCampus } from '../store/slices/authSlice';
import { selectCampuses } from '../store/slices/catalogSlice';
import {
  selectSelectedCampusId,
  setSelectedCampusId,
} from '../store/slices/uiSlice';
import { getCampusById } from '../utils/campusTime';
import { cn } from '../utils/utils';

interface CampusPickerProps {
  variant?: 'header' | 'panel';
  className?: string;
}

const CampusPicker = ({ variant = 'header', className }: CampusPickerProps) => {
  const dispatch = useAppDispatch();
  const campuses = useAppSelector(selectCampuses);
  const campusId = useAppSelector(selectSelectedCampusId);
  const user = useAppSelector(selectAuthUser);
  const campus = getCampusById(campuses, campusId);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const shortName = campus?.name.replace(/\s+University$/i, '') ?? 'Campus';

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex max-w-44 items-center gap-1.5 rounded-xl px-2 py-1.5 text-left transition-colors sm:max-w-56',
          variant === 'header'
            ? 'hover:bg-on-primary/15'
            : 'border border-border bg-surface-2 text-fg hover:border-primary'
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <FiMapPin className="h-4 w-4 shrink-0" />
        <span className="min-w-0 truncate font-sans text-xs font-medium sm:text-sm">
          {shortName}
        </span>
        <FiChevronDown
          className={cn('h-3.5 w-3.5 shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-50 mt-2 min-w-[16rem] overflow-hidden rounded-2xl border border-border bg-surface py-1 shadow-xl"
        >
          <li className="px-3 py-2 font-sans text-[10px] font-semibold uppercase tracking-wider text-muted">
            Change location
          </li>
          {campuses.map((c) => {
            const active = c.id === campusId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    dispatch(setSelectedCampusId(c.id));
                    if (user) void dispatch(setUserCampus(c.id));
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full flex-col px-3 py-2.5 text-left font-sans transition-colors',
                    active
                      ? 'bg-primary/15 text-fg'
                      : 'text-fg hover:bg-surface-2'
                  )}
                >
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-xs text-muted">
                    {c.city}{c.state ? `, ${c.state}` : ''}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CampusPicker;
