import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, MapPin } from '../icons';

export interface ScreenHeaderProps {
  title?: string;
  right?: ReactNode;
  onBack?: () => void;
}

export function ScreenHeader({ title, right, onBack }: ScreenHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="mb-5 flex min-h-tap items-center justify-between gap-3">
      <button
        type="button"
        className="flex min-h-tap items-center gap-1 rounded-button text-sm font-medium text-text transition hover:text-brand"
        onClick={onBack ?? (() => navigate(-1))}
      >
        <ArrowLeft size={20} aria-hidden />
        <span>Back</span>
      </button>
      {title ? (
        <div className="min-w-0 flex-1 truncate text-center font-display text-base font-bold">
          {title}
        </div>
      ) : (
        <span />
      )}
      <div className="flex min-w-[44px] justify-end text-sm font-semibold text-brand">{right}</div>
    </header>
  );
}

export interface CampusLocationProps {
  label: string;
  onClick?: () => void;
}

export function CampusLocation({ label, onClick }: CampusLocationProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-tap items-center gap-1.5 rounded-button bg-surface2/80 px-3 py-1.5 font-display text-sm font-bold text-brand transition hover:bg-surface2 active:scale-[0.98]"
    >
      <MapPin size={16} />
      <span>{label}</span>
      <ChevronDown size={15} className="text-muted" />
    </button>
  );
}
