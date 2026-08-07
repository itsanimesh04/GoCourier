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
    <header className="mb-6 flex min-h-[44px] items-center justify-between gap-4">
      <button
        type="button"
        className="flex min-h-[44px] items-center gap-1.5 rounded-xl text-sm font-medium text-muted transition hover:text-primary premium-transition"
        onClick={onBack ?? (() => navigate(-1))}
      >
        <ArrowLeft size={20} aria-hidden />
        <span>Back</span>
      </button>
      {title ? (
        <div className="min-w-0 flex-1 truncate text-center font-display text-base font-bold text-foreground">
          {title}
        </div>
      ) : (
        <span />
      )}
      <div className="flex min-w-[44px] justify-end text-sm font-semibold text-primary">{right}</div>
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
      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-muted/10 px-3.5 py-1.5 font-display text-sm font-bold text-primary transition hover:bg-muted/20 premium-scale"
    >
      <MapPin size={16} />
      <span>{label}</span>
      <ChevronDown size={15} className="text-muted" />
    </button>
  );
}
