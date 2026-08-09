import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import authService from "./services/admin/auth.service";
import { TinyLoader } from "./components/Loaders";

const AuthLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIdentity = async () => {
      try {
        setIsLoading(true);
        await authService.checkIdentity();

        if (location.pathname === "/login") {
          navigate("/", { replace: true });
        }
      } catch {
        if (location.pathname !== "/login") {
          navigate("/login", { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdentity();
  }, [navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-(--bg)">
        <TinyLoader />
      </div>
    );
  }

  return <Outlet />;
};

export default AuthLayout;
