import type { ReactNode } from 'react';
import { ArrowRight } from '../icons';
import { PrimaryButton, SecondaryButton } from '../common/Buttons';
import { cn, formatTime } from '../../lib/utils';

export interface EmptyStateBlockProps {
  icon: ReactNode;
  heading: string;
  subtext: string;
  action?: string;
  onAction?: () => void;
}

export function EmptyStateBlock({
  icon,
  heading,
  subtext,
  action,
  onAction
}: EmptyStateBlockProps) {
  return (
    <section className="grid grid-cols-[96px_1fr] items-center gap-4 py-4">
      <div className="grid h-24 w-24 place-items-center rounded-full border border-border bg-card text-brand/80">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-bold text-text">{heading}</h3>
        <p className="mt-1 text-sm leading-5 text-muted">{subtext}</p>
        {action ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-3 inline-flex min-h-tap items-center gap-2 rounded-button border border-brand px-4 font-display text-sm font-bold text-brand"
          >
            {action}
            <ArrowRight size={16} />
          </button>
        ) : null}
      </div>
    </section>
  );
}

export interface ErrorStateBlockProps {
  icon: ReactNode;
  heading: string;
  subtext: string;
  primary: string;
  secondary: string;
  urgent?: boolean;
}

export function ErrorStateBlock({
  icon,
  heading,
  subtext,
  primary,
  secondary,
  urgent = false
}: ErrorStateBlockProps) {
  return (
    <section className="py-7 text-center">
      <div
        className={cn(
          'mx-auto grid h-20 w-20 place-items-center rounded-full border',
          urgent ? 'border-urgent text-urgent' : 'border-danger text-danger'
        )}
      >
        {icon}
      </div>
      <h3 className="mx-auto mt-5 max-w-[260px] font-display text-2xl font-bold leading-tight text-text">
        {heading}
      </h3>
      <p className="mx-auto mt-2 max-w-[260px] text-sm leading-5 text-muted">{subtext}</p>
      <div className="mt-5 space-y-3">
        <PrimaryButton icon={false}>{primary}</PrimaryButton>
        <SecondaryButton>{secondary}</SecondaryButton>
      </div>
    </section>
  );
}

export interface CountdownCardProps {
  label: string;
  secondsLeft: number;
  totalSeconds: number;
  note: string;
  compact?: boolean;
}

export function CountdownCard({
  label,
  secondsLeft,
  totalSeconds,
  note,
  compact = false
}: CountdownCardProps) {
  const expired = secondsLeft <= 0;
  const progressPercent = Math.min(100, Math.max(0, (secondsLeft / totalSeconds) * 100));

  return (
    <section className="card-gradient relative overflow-hidden rounded-card border border-border p-4 shadow-card transition-all max-w-[460px] mx-auto w-full">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-urgent shadow-[0_0_8px_#D4FF4F]" />
          <span className="font-display text-xs font-bold tracking-wider text-text uppercase">
            {expired ? 'Batch Closed' : "Tonight's Campus Batch"}
          </span>
        </div>
        <span className="rounded-full bg-surface2 px-2.5 py-0.5 font-display text-[11px] font-bold text-muted">
          {expired ? 'Next batch @ 12 PM' : 'Locks @ 9:30 PM'}
        </span>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-muted">{expired ? 'Ordering closed' : 'Order cutoff in'}</div>
          <div className="timer-nums mt-0.5 font-display text-3xl font-extrabold tracking-tight text-urgent drop-shadow-[0_0_12px_rgba(212,255,79,0.35)]">
            {formatTime(secondsLeft)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium text-muted">Delivery schedule</div>
          <div className="mt-0.5 font-display text-sm font-bold text-success">
            Hostel drop @ 9:45 PM
          </div>
        </div>
      </div>

      <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-surface2">
        <div
          className="h-full rounded-full bg-urgent transition-all duration-500 shadow-[0_0_8px_#D4FF4F]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </section>
  );
}
