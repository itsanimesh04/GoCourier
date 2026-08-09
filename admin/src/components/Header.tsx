import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/campuses": "Campuses",
  "/restaurants": "Restaurants",
  "/menu-items": "Menu Items",
  "/categories": "Categories",
  "/banners": "Banners",
  "/orders": "Orders",
  "/users": "Users",
  "/payments": "Payments",
  "/revenue": "Revenue",
  "/settings": "Settings",
};

const Header = () => {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? "GoCourier Admin";

  return (
    <header className="h-16 bg-(--bg-elevated) border-b border-(--border) flex items-center justify-between px-8">
      <div>
        <p className="text-xs text-(--text-muted) uppercase tracking-wider">Admin</p>
        <h2 className="text-sm font-semibold text-(--text)">{title}</h2>
      </div>
      <div className="text-xs text-(--text-muted)">GoCourier · Batch delivery ops</div>
    </header>
  );
};

export default Header;
