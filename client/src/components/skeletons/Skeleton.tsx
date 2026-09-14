import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'rounded' | 'circular';
}

export const Skeleton = ({
  className,
  variant = 'rounded',
  ...props
}: SkeletonProps) => {
  const variantClasses = {
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
    circular: 'rounded-full',
  }[variant];

  return (
    <div
      aria-hidden="true"
      className={cn(
        'skeleton-shimmer bg-surface-2/80 dark:bg-surface-2',
        variantClasses,
        className
      )}
      {...props}
    />
  );
};

export default Skeleton;
