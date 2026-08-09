import { cn } from '../utils/utils';

interface VegBadgeProps {
  isVeg: boolean;
  className?: string;
  showLabel?: boolean;
}

const VegBadge = ({ isVeg, className, showLabel = true }: VegBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-wide',
        className
      )}
    >
      <span
        className={cn(
          'inline-flex h-4 w-4 items-center justify-center rounded-sm border-2 bg-surface',
          isVeg ? 'border-green-500' : 'border-primary'
        )}
        aria-hidden
      >
        <span
          className={cn('h-2 w-2 rounded-full', isVeg ? 'bg-green-500' : 'bg-primary')}
        />
      </span>
      {showLabel && <span className="text-muted">{isVeg ? 'Veg' : 'Non-Veg'}</span>}
    </span>
  );
};

export default VegBadge;
