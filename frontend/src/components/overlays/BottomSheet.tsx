import type { ReactNode } from 'react';

export interface BottomSheetProps {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
}

export function BottomSheet({ open, children, onClose: _onClose }: BottomSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-bg/72 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="animate-sheet-up min-h-[360px] w-full max-w-app rounded-t-sheet border border-border bg-card px-shell pb-7 pt-3 shadow-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-muted/70" />
        {children}
      </div>
    </div>
  );
}
