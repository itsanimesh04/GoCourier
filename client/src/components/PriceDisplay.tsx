import { cn } from '../utils/utils';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};

const PriceDisplay = ({ price, originalPrice, className, size = 'md' }: PriceDisplayProps) => {
  const showDiscount = originalPrice != null && originalPrice > price;

  return (
    <div className={cn('flex items-baseline gap-2 font-display font-semibold text-fg', sizeClass[size], className)}>
      <span>₹ {price}</span>
      {showDiscount && (
        <span className="text-xs font-normal text-muted line-through decoration-muted">
          ₹ {originalPrice}
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;
