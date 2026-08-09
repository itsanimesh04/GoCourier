import {
  LayoutDashboard,
  MapPin,
  UtensilsCrossed,
  ShoppingBag,
  Grid3X3,
  Image,
  ClipboardList,
  Users,
  CreditCard,
  IndianRupee,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Campuses", path: "/campuses", icon: MapPin },
  { title: "Restaurants", path: "/restaurants", icon: UtensilsCrossed },
  { title: "Menu Items", path: "/menu-items", icon: ShoppingBag },
  { title: "Categories", path: "/categories", icon: Grid3X3 },
  { title: "Banners", path: "/banners", icon: Image },
  { title: "Orders", path: "/orders", icon: ClipboardList },
  { title: "Users", path: "/users", icon: Users },
  { title: "Payments", path: "/payments", icon: CreditCard },
  { title: "Revenue", path: "/revenue", icon: IndianRupee },
  { title: "Settings", path: "/settings", icon: Settings },
];

export const PAGE_TITLES: Record<string, string> = {
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
