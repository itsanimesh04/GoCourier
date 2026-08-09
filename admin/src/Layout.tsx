import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const Layout = () => {
  return (
    <div className="h-screen bg-[var(--bg)] flex flex-row w-full overflow-hidden">
      <div className="w-[260px] shrink-0 h-full">
        <Sidebar />
      </div>

      <div className="flex-1 min-h-screen w-full h-full flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
