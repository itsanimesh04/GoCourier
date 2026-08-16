import { useEffect, type ReactNode } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { bootstrapAuth, selectAuthStatus, selectAuthUser } from '../store/slices/authSlice';
import { loadCatalog } from '../store/slices/catalogSlice';
import { fetchCart } from '../store/slices/cartSlice';
import { updateProfile } from '../store/slices/profileSlice';
import { selectSelectedCampusId, setSelectedCampusId } from '../store/slices/uiSlice';

export const AppBootstrap = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectAuthUser);
  const campusId = useAppSelector(selectSelectedCampusId);

  useEffect(() => {
    void dispatch(bootstrapAuth());
  }, [dispatch]);

  useEffect(() => {
    if (authStatus !== 'ready') return;
    const preferred = user?.campus_id || campusId || undefined;
    void dispatch(loadCatalog(preferred)).then((action) => {
      if (loadCatalog.fulfilled.match(action) && action.payload.selectedCampusId) {
        if (!campusId) dispatch(setSelectedCampusId(action.payload.selectedCampusId));
      }
    });
    if (user) {
      dispatch(
        updateProfile({
          name: user.name ?? 'Student',
          email: user.email ?? '',
          phone: user.phone ?? '',
          campusId: user.campus_id ?? campusId,
        })
      );
      if (user.campus_id) dispatch(setSelectedCampusId(user.campus_id));
      void dispatch(fetchCart());
    }
  }, [authStatus, user, dispatch]);

  useEffect(() => {
    if (authStatus !== 'ready' || !campusId) return;
    void dispatch(loadCatalog(campusId));
  }, [campusId, authStatus, dispatch]);

  return children;
};

export const RequireAuth = () => {
  const user = useAppSelector(selectAuthUser);
  const status = useAppSelector(selectAuthStatus);
  const location = useLocation();

  if (status !== 'ready') {
    return <div className="px-4 py-20 text-center font-sans text-sm text-muted">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};
