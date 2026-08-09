import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiLogOut,
  FiSettings,
  FiMapPin,
  FiShoppingBag,
  FiImage,
  FiGrid,
  FiClipboard,
  FiCreditCard,
} from "react-icons/fi";
import { RiMoneyRupeeCircleLine, RiRestaurant2Line } from "react-icons/ri";
import LogoutModal from "./LogoutModal";
import { useState } from "react";

const sidebarLinks = [
  { title: "Dashboard", path: "/", icon: <FiHome size={18} /> },
  { title: "Campuses", path: "/campuses", icon: <FiMapPin size={18} /> },
  { title: "Restaurants", path: "/restaurants", icon: <RiRestaurant2Line size={18} /> },
  { title: "Menu Items", path: "/menu-items", icon: <FiShoppingBag size={18} /> },
  { title: "Categories", path: "/categories", icon: <FiGrid size={18} /> },
  { title: "Banners", path: "/banners", icon: <FiImage size={18} /> },
  { title: "Orders", path: "/orders", icon: <FiClipboard size={18} /> },
  { title: "Users", path: "/users", icon: <FiUsers size={18} /> },
  { title: "Payments", path: "/payments", icon: <FiCreditCard size={18} /> },
  { title: "Revenue", path: "/revenue", icon: <RiMoneyRupeeCircleLine size={18} /> },
  { title: "Settings", path: "/settings", icon: <FiSettings size={18} /> },
];

const Sidebar = () => {
  const location = useLocation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <>
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />

      <div className="w-full h-screen bg-(--bg-elevated) border-r border-(--border) flex flex-col z-50">
        <div className="px-5 py-4 border-b border-(--border)">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-(--primary) flex items-center justify-center text-white font-bold text-sm">
              GC
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-(--text) tracking-tight">
                GoCourier Admin
              </span>
              <span className="text-[10px] text-(--text-muted) -mt-0.5">
                Operations console
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-5 overflow-y-auto">
          <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider px-3 mb-3">
            Manage
          </p>
          <nav>
            <ul className="space-y-1">
              {sidebarLinks.map((link) => {
                const isActive =
                  link.path === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(link.path);
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-(--primary-soft) text-(--primary)"
                          : "text-(--text-muted) hover:bg-white/5 hover:text-(--text)"
                      }`}
                    >
                      <span>{link.icon}</span>
                      <span className="font-medium text-sm">{link.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="px-3 pb-4 border-t border-(--border) pt-3">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-(--text-muted) hover:bg-white/5 hover:text-(--text) rounded-lg transition-all"
          >
            <FiLogOut size={18} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
