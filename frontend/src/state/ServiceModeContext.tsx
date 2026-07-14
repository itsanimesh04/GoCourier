import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  isServiceMode,
  modeFromPath,
  SERVICE_MODES,
  SERVICE_MODE_STORAGE_KEY,
  type ServiceMode,
  type ServiceModeConfig
} from '../lib/serviceMode';

interface ServiceModeContextValue {
  mode: ServiceMode;
  config: ServiceModeConfig;
  initialized: boolean;
  setMode: (mode: ServiceMode) => void;
}

const ServiceModeContext = createContext<ServiceModeContextValue | null>(null);

function savedMode(): ServiceMode {
  if (typeof window === 'undefined') return 'food';
  try {
    const value = window.localStorage.getItem(SERVICE_MODE_STORAGE_KEY);
    return isServiceMode(value) ? value : 'food';
  } catch {
    return 'food';
  }
}

export function ServiceModeProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const routeMode = modeFromPath(location.pathname);
  const [mode, setModeState] = useState<ServiceMode>(() => routeMode ?? savedMode());

  useLayoutEffect(() => {
    document.documentElement.dataset.serviceMode = mode;
  }, [mode]);

  useEffect(() => {
    if (routeMode && routeMode !== mode) setModeState(routeMode);
  }, [mode, routeMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SERVICE_MODE_STORAGE_KEY, mode);
    } catch {
      // Storage may be unavailable in private or hardened browser contexts.
    }
  }, [mode]);

  const setMode = useCallback(
    (nextMode: ServiceMode) => {
      setModeState(nextMode);
      navigate(SERVICE_MODES[nextMode].homeRoute);
    },
    [navigate]
  );

  const value = useMemo(
    () => ({ mode, config: SERVICE_MODES[mode], initialized: true, setMode }),
    [mode, setMode]
  );

  return <ServiceModeContext.Provider value={value}>{children}</ServiceModeContext.Provider>;
}

export function useServiceMode() {
  const context = useContext(ServiceModeContext);
  if (!context) throw new Error('useServiceMode must be used inside ServiceModeProvider');
  return context;
}
