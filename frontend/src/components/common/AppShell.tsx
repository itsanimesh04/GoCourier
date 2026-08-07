import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface AppShellProps {
  children: ReactNode;
  bottomNav?: ReactNode;
  floatingCart?: ReactNode;
  className?: string;
  /** Constrain inner content; page chrome stays full width */
  contentClassName?: string;
}

export function AppShell({
  children,
  bottomNav,
  floatingCart,
  className,
  contentClassName
}: AppShellProps) {
  return (
    <main className="min-h-screen w-full bg-background text-foreground">
      <div className="relative flex min-h-screen w-full flex-col bg-background">
        <div
          className={cn(
            'safe-top flex-1 w-full',
            bottomNav ? 'pb-28 md:pb-24' : 'safe-bottom pb-8',
            className
          )}
        >
          <div className={cn('w-full', contentClassName)}>{children}</div>
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
