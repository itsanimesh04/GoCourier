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
        'inline-flex items-center gap-1.5 text-xs font-bebas uppercase tracking-wide',
        className
      )}
    >
      <span
        className={cn(
          'inline-flex h-4 w-4 items-center justify-center border-2',
          isVeg ? 'border-green-600' : 'border-red-600'
        )}
        aria-hidden
      >
        <span
          className={cn('h-2 w-2 rounded-full', isVeg ? 'bg-green-600' : 'bg-red-600')}
        />
      </span>
      {showLabel && <span className="text-gray-700">{isVeg ? 'Veg' : 'Non-Veg'}</span>}
    </span>
  );
};

export default VegBadge;
