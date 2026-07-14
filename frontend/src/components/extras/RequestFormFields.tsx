import type { ReactNode } from 'react';

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span>{children}{hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}</label>;
}

export const inputClass = 'min-h-[52px] w-full rounded-input border border-border bg-card px-4 text-sm text-text outline-none transition placeholder:text-muted focus:border-brand';
export const textareaClass = `${inputClass} min-h-[120px] resize-y py-3 leading-6`;
