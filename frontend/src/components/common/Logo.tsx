import { Bike } from '../icons';

export interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${compact ? 'pl-6' : ''}`}>
      <div className="relative text-brand">
        <Bike size={compact ? 30 : 62} strokeWidth={2.6} />
        <span className="absolute -left-4 top-1 h-0.5 w-4 rounded-full bg-brand" />
        <span className="absolute -left-6 top-3 h-0.5 w-5 rounded-full bg-brand" />
        <span className="absolute -left-5 top-5 h-0.5 w-4 rounded-full bg-brand" />
      </div>
      {compact ? (
        <div className="font-display text-[12px] font-bold leading-[0.95]">
          <div>Go Courier</div>
          <div className="text-secondary">Service</div>
        </div>
      ) : null}
    </div>
  );
}
