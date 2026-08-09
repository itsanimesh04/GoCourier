import { FiMinus, FiPlus } from 'react-icons/fi';
import { cn } from '../utils/utils';

interface QtyStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

const QtyStepper = ({ value, onChange, min = 1, max = 20, className }: QtyStepperProps) => {
  return (
    <div className={cn('inline-flex items-center border border-gray-300', className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="px-3 py-2 text-tertiary hover:bg-gray-50 disabled:opacity-40"
      >
        <FiMinus size={14} />
      </button>
      <span className="min-w-10 px-2 text-center font-bebas text-xl text-tertiary">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="px-3 py-2 text-tertiary hover:bg-gray-50 disabled:opacity-40"
      >
        <FiPlus size={14} />
      </button>
    </div>
  );
};

export default QtyStepper;
