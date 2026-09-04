import { useEffect, useRef, type ReactNode } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { loadJSON } from '../lib/persist';
import { useAppDispatch, useAppSelector } from '../store';
import { bootstrapAuth, selectAuthStatus, selectAuthUser } from '../store/slices/authSlice';
import { fetchCart } from '../store/slices/cartSlice';
import { loadCatalog } from '../store/slices/catalogSlice';
import { hydrateProfile, updateProfile, type ProfileState } from '../store/slices/profileSlice';
import { hydrateWishlist } from '../store/slices/wishlistSlice';
import {
  hydrateUi,
  selectSelectedCampusId,
  setSelectedCampusId,
  type CatalogMode,
  type ThemeMode,
} from '../store/slices/uiSlice';
import { ScreenLoader } from './ui';

export function AppBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectAuthUser);
  const campusId = useAppSelector(selectSelectedCampusId);
  const lastCatalogKeyRef = useRef<string | null>(null);
  const profileSyncedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [ui, profile, wishlist] = await Promise.all([
        loadJSON<{ catalogMode?: CatalogMode; selectedCampusId?: string; theme?: ThemeMode }>('gcs-ui', {}),
        loadJSON<Partial<ProfileState>>('gcs-profile', {}),
        loadJSON<{ foodIds: string[]; restaurantIds: string[] }>('gcs-wishlist', {
          foodIds: [],
          restaurantIds: [],
        }),
      ]);
      dispatch(hydrateUi(ui));
      dispatch(hydrateProfile(profile));
      dispatch(hydrateWishlist(wishlist));
      void dispatch(bootstrapAuth());
    })();
  }, [dispatch]);

  useEffect(() => {
    if (authStatus !== 'ready') return;
    void SplashScreen.hideAsync();
  }, [authStatus]);

  // Sync profile + cart once per logged-in user.
  useEffect(() => {
    if (authStatus !== 'ready' || !user) {
      profileSyncedForUserRef.current = null;
      return;
    }
    if (profileSyncedForUserRef.current === user.id) return;
    profileSyncedForUserRef.current = user.id;

    if (user.campus_id) dispatch(setSelectedCampusId(user.campus_id));
    dispatch(
      updateProfile({
        name: user.name ?? 'Student',
        email: user.email ?? '',
        phone: user.phone ?? '',
        campusId: user.campus_id ?? campusId,
      })
    );
    void dispatch(fetchCart());
  }, [authStatus, user, campusId, dispatch]);

  // Load catalog once per resolved campus key after auth is ready.
  useEffect(() => {
    if (authStatus !== 'ready') return;

    const preferred = user?.campus_id || campusId || undefined;
    const key = preferred || '__default__';
    if (lastCatalogKeyRef.current === key) return;
    lastCatalogKeyRef.current = key;

    void dispatch(loadCatalog(preferred || undefined)).then((action) => {
      if (!loadCatalog.fulfilled.match(action)) {
        lastCatalogKeyRef.current = null;
        return;
      }
      const selected = action.payload.selectedCampusId;
      if (!selected) return;
      // Align ref before dispatch so the campusId update does not re-fetch the same campus.
      lastCatalogKeyRef.current = selected;
      dispatch(setSelectedCampusId(selected));
    });
  }, [authStatus, user?.campus_id, campusId, dispatch]);

  if (authStatus !== 'ready') {
    return <ScreenLoader label="Starting GoCourier…" />;
  }

  return children;
}
