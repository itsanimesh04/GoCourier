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
        'inline-flex min-h-[56px] w-full items-center justify-center gap-3 rounded-button bg-brand px-5 font-display text-base font-bold text-brandContrast shadow-cta transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none',
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
        'inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-button border border-brand bg-transparent px-5 font-display text-base font-bold text-brand transition active:scale-[0.99]',
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
      className="grid min-h-tap min-w-tap place-items-center rounded-full text-text transition hover:bg-surface2"
      aria-label="Share"
    >
      <Share2 size={20} />
    </button>
  );
}
