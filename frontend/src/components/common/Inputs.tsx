import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: ReactNode;
  helper?: string;
  error?: string;
  inputMode?: 'text' | 'numeric' | 'tel';
  autoFocus?: boolean;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  icon,
  helper,
  error,
  inputMode,
  autoFocus
}: TextInputProps) {
  return (
    <label className="block">
      <div
        className={cn(
          'surface-gradient flex min-h-[54px] items-center gap-3 rounded-input border px-4 transition premium-transition',
          error ? 'border-danger shadow-[0_0_22px_rgba(239,68,68,0.18)]' : 'border-border focus-within:border-primary'
        )}
      >
        {icon ? <span className={error ? 'text-danger' : 'text-muted'}>{icon}</span> : null}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          autoFocus={autoFocus}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none focus:outline-none focus:ring-0 focus-visible:outline-none placeholder:text-muted"
        />
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-danger">{error}</p> : null}
      {helper && !error ? <p className="mt-2 text-xs text-muted">{helper}</p> : null}
    </label>
  );
}
