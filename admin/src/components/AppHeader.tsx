import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PAGE_TITLES } from "@/lib/nav";

interface AppHeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? "GoCourier Admin";

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-sidebar/60 px-4 backdrop-blur md:h-16 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Admin</p>
        <h2 className="truncate text-sm font-semibold">{title}</h2>
      </div>
      <div className="ml-auto hidden text-xs text-muted-foreground sm:block">
        GoCourier · Operations
      </div>
    </header>
  );
}
