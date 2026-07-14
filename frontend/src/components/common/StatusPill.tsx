import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface StatusPillProps {
  tone: 'success' | 'urgent' | 'danger' | 'neutral';
  children: ReactNode;
  icon?: ReactNode;
}

export function StatusPill({ tone, children, icon }: StatusPillProps) {
  const tones = {
    success: 'border-success/30 bg-success/10 text-success',
    urgent: 'border-urgent/30 bg-urgent/15 text-urgent',
    danger: 'border-danger/30 bg-danger/10 text-danger',
    neutral: 'border-border bg-surface2 text-muted'
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold',
        tones[tone]
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export interface VegMarkProps {
  isVeg: boolean;
}

export function VegMark({ isVeg }: VegMarkProps) {
  return (
    <span
      className={cn(
        'grid h-5 w-5 shrink-0 place-items-center rounded-[4px] border',
        isVeg ? 'border-success text-success' : 'border-danger text-danger'
      )}
      aria-label={isVeg ? 'Vegetarian' : 'Non vegetarian'}
    >
      <span className={cn('h-2 w-2 rounded-full', isVeg ? 'bg-success' : 'bg-danger')} />
    </span>
  );
}
