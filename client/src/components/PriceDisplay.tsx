import { cn } from '../utils/utils';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
};

const PriceDisplay = ({ price, originalPrice, className, size = 'md' }: PriceDisplayProps) => {
  const showDiscount = originalPrice != null && originalPrice > price;

  return (
    <div className={cn('flex items-baseline gap-2 font-bebas text-tertiary', sizeClass[size], className)}>
      <span>₹ {price}</span>
      {showDiscount && (
        <span className="text-base text-gray-400 line-through decoration-gray-400">
          ₹ {originalPrice}
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;
