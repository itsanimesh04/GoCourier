import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import authService from "./services/admin/auth.service";
import { TinyLoader } from "./components/Loaders";

const AuthLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathnameRef = useRef(location.pathname);

  pathnameRef.current = location.pathname;

  useEffect(() => {
    let cancelled = false;

    const resolveAuth = async (showLoader: boolean) => {
      if (showLoader) setIsBootstrapping(true);

      try {
        await authService.checkIdentity();
        if (cancelled) return;
        setIsAuthenticated(true);
        if (pathnameRef.current === "/login") {
          navigate("/", { replace: true });
        }
      } catch {
        if (cancelled) return;
        setIsAuthenticated(false);
        if (pathnameRef.current !== "/login") {
          navigate("/login", { replace: true });
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    };

    void resolveAuth(true);

    const onFocus = () => {
      void resolveAuth(false);
    };

    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [navigate]);

  useEffect(() => {
    if (isBootstrapping) return;

    if (isAuthenticated && location.pathname === "/login") {
      navigate("/", { replace: true });
    } else if (!isAuthenticated && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isBootstrapping, location.pathname, navigate]);

  if (isBootstrapping) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <TinyLoader />
      </div>
    );
  }

  return <Outlet />;
};

export default AuthLayout;
