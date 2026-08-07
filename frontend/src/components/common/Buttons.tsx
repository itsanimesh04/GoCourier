import type { ReactNode } from 'react';
import { ArrowRight, Share2 } from '../icons';
import { cn } from '../../lib/utils';

export interface PrimaryButtonProps {
  children: ReactNode;
  icon?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export function PrimaryButton({
  children,
  icon = true,
  disabled,
  className,
  onClick,
  type = 'button'
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl bg-primary px-5 font-display text-base font-bold text-primary-foreground shadow-cta transition premium-scale disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none',
        className
      )}
    >
      <span className="truncate">{children}</span>
      {icon ? <ArrowRight size={20} aria-hidden /> : null}
    </button>
  );
}

export interface SecondaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: boolean;
}

export function SecondaryButton({
  children,
  onClick,
  className,
  icon = false
}: SecondaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-2xl border border-primary/30 bg-card px-5 font-display text-base font-bold text-primary transition premium-scale',
        className
      )}
    >
      <span className="truncate">{children}</span>
      {icon ? <ArrowRight size={19} aria-hidden /> : null}
    </button>
  );
}

export function ShareButton() {
  return (
    <button
      type="button"
      className="grid min-h-[44px] min-w-[44px] place-items-center rounded-full text-foreground transition hover:bg-muted/10"
      aria-label="Share"
    >
      <Share2 size={20} />
    </button>
  );
}
