import { useEffect, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
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

const StickyCampusBatch = () => {
  const location = useLocation();
  const campusId = useAppSelector(selectSelectedCampusId);
  const campuses = useAppSelector(selectCampuses);
  const campus = getCampusById(campuses, campusId);
  const { textClass, bgClass, pingClass } = useTimerAccent();
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const hero = document.getElementById('home-hero');
    if (!hero) {
      setVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    if (!visible) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [visible]);

  if (!visible || !campus) return null;

  const cutoff = getNextCutoffDate(campus.cutoffTime, new Date(now));
  const remaining = cutoff.getTime() - now;
  const locked = remaining <= 0;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 ${pingClass}`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${bgClass}`} />
          </span>
          <p className="truncate font-display text-xs font-semibold uppercase tracking-wide text-fg">
            Tonight&apos;s batch
          </p>
        </div>
        <button
          type="button"
          aria-label={minimized ? 'Expand batch timer' : 'Minimize batch timer'}
          onClick={() => setMinimized((v) => !v)}
          className="rounded-lg p-1 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          {minimized ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </button>
      </div>

      {!minimized ? (
        <div className="px-3 py-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-sans text-[10px] uppercase tracking-wide text-muted">
                Cutoff in
              </p>
              <p className={`font-display text-2xl font-bold tracking-tight ${textClass}`}>
                {locked ? 'CLOSED' : formatCountdown(remaining)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-sans text-[10px] uppercase tracking-wide text-muted">
                Drop
              </p>
              <p className="font-display text-sm font-semibold text-fg">
                {formatClockLabel(campus.deliveryTime)}
              </p>
            </div>
          </div>
          <div className={`mt-3 h-1 rounded-full ${bgClass}`} />
        </div>
      ) : (
        <div className="flex items-center justify-between px-3 py-2">
          <p className={`font-display text-lg font-bold ${textClass}`}>
            {locked ? 'CLOSED' : formatCountdown(remaining)}
          </p>
          <p className="font-sans text-[10px] text-muted">
            Locks {formatClockLabel(campus.cutoffTime)}
          </p>
        </div>
      )}
    </div>
  );
};

export default StickyCampusBatch;
