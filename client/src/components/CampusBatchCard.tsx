import { useEffect, useState } from 'react';
import { useAppSelector } from '../store';
import { selectCampuses } from '../store/slices/catalogSlice';
import { selectSelectedCampusId } from '../store/slices/uiSlice';
import {
  formatClockLabel,
  formatCountdown,
  getCampusById,
  getNextCutoffDate,
} from '../utils/campusTime';
import { useTimerAccent } from '../utils/timerAccent';

const CampusBatchCard = () => {
  const campusId = useAppSelector(selectSelectedCampusId);
  const campuses = useAppSelector(selectCampuses);
  const campus = getCampusById(campuses, campusId);
  const { textClass, bgClass, pingClass } = useTimerAccent();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!campus) return null;

  const cutoff = getNextCutoffDate(campus.cutoffTime, new Date(now));
  const remaining = cutoff.getTime() - now;
  const locked = remaining <= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-3.5 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${pingClass}`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${bgClass}`} />
          </span>
          <h3 className="font-display text-xs font-semibold uppercase tracking-wide text-fg sm:text-sm">
            Tonight&apos;s campus batch
          </h3>
        </div>
        <p className="shrink-0 font-sans text-[11px] text-muted">
          Locks @ {formatClockLabel(campus.cutoffTime)}
        </p>
      </div>

      <div className="my-3 h-px bg-border" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="font-sans text-[11px] text-muted">Order cutoff in</p>
          <p className={`mt-0.5 font-display text-2xl font-bold tracking-tight sm:text-3xl ${textClass}`}>
            {locked ? 'CLOSED' : formatCountdown(remaining)}
          </p>
        </div>
        <div>
          <p className="font-sans text-[11px] text-muted">Delivery schedule</p>
          <p className="mt-0.5 font-display text-sm font-semibold text-fg">
            Hostel drop @ {formatClockLabel(campus.deliveryTime)}
          </p>
          <p className="mt-0.5 font-sans text-[11px] text-muted">{campus.name}</p>
        </div>
      </div>

      <div className={`mt-3.5 h-1 rounded-full ${bgClass}`} />
    </div>
  );
};

export default CampusBatchCard;
