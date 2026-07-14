import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface AppShellProps {
  children: ReactNode;
  bottomNav?: ReactNode;
  floatingCart?: ReactNode;
  className?: string;
}

export function AppShell({ children, bottomNav, floatingCart, className }: AppShellProps) {
  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="mx-auto relative flex min-h-screen w-full max-w-6xl flex-col bg-bg shadow-2xl">
        <div
          className={cn(
            'safe-top flex-1 px-4 sm:px-6 md:px-8',
            bottomNav ? 'pb-36 md:pb-28' : 'safe-bottom pb-8',
            className
          )}
        >
          {children}
        </div>
        {floatingCart ? (
          <div className="fixed bottom-[72px] left-4 right-4 z-50 md:left-auto md:right-8 md:bottom-24 md:w-[380px]">
            {floatingCart}
          </div>
        ) : null}
        {bottomNav}
      </div>
    </main>
  );
}
