import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { LogoutDialog } from "@/components/LogoutDialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="hidden h-full w-64 shrink-0 border-r border-sidebar-border lg:block">
        <AppSidebar onLogout={() => setLogoutOpen(true)} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 sm:max-w-xs">
          <AppSidebar
            onNavigate={() => setMobileOpen(false)}
            onLogout={() => {
              setMobileOpen(false);
              setLogoutOpen(true);
            }}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </div>
  );
};

export default Layout;
