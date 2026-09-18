import { useEffect, useRef, type ReactNode } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { loadJSON } from '../lib/persist';
import { useAppDispatch, useAppSelector } from '../store';
import { bootstrapAuth, selectAuthStatus, selectAuthUser, setUserCampus } from '../store/slices/authSlice';
import { fetchCart, hydrateCart, syncGuestCartToServer } from '../store/slices/cartSlice';
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
import type { CartLineItem } from '../utils/types';

export function AppBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectAuthUser);
  const campusId = useAppSelector(selectSelectedCampusId);
  const lastCatalogKeyRef = useRef<string | null>(null);
  const profileSyncedForUserRef = useRef<string | null>(null);
  // Track campusId in a ref so the catalog-load effect doesn't re-fire on every change.
  const campusIdRef = useRef(campusId);
  campusIdRef.current = campusId;

  useEffect(() => {
    void (async () => {
      const [ui, profile, wishlist, cartItems] = await Promise.all([
        loadJSON<{ catalogMode?: CatalogMode; selectedCampusId?: string; theme?: ThemeMode }>('gcs-ui', {}),
        loadJSON<Partial<ProfileState>>('gcs-profile', {}),
        loadJSON<{ foodIds: string[]; restaurantIds: string[] }>('gcs-wishlist', {
          foodIds: [],
          restaurantIds: [],
        }),
        loadJSON<CartLineItem[]>('gcs-cart', []),
      ]);
      dispatch(hydrateUi(ui));
      dispatch(hydrateProfile(profile));
      dispatch(hydrateWishlist(wishlist));
      if (cartItems && cartItems.length > 0) {
        dispatch(hydrateCart(cartItems));
      }
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

    const currentCampus = campusIdRef.current;
    if (user.campus_id) {
      dispatch(setSelectedCampusId(user.campus_id));
    } else if (currentCampus) {
      void dispatch(setUserCampus(currentCampus));
    }
    dispatch(
      updateProfile({
        name: user.name ?? 'Student',
        email: user.email ?? '',
        phone: user.phone ?? '',
        campusId: user.campus_id ?? currentCampus,
      })
    );
    void dispatch(syncGuestCartToServer());
  }, [authStatus, user, dispatch]);

  // Load catalog exactly once after auth is ready, and again only if user identity changes.
  // campusId is read from the ref to avoid re-triggering this effect on campus selection.
  useEffect(() => {
    if (authStatus !== 'ready') return;

    const preferred = user?.campus_id || campusIdRef.current || undefined;
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
      campusIdRef.current = selected;
      dispatch(setSelectedCampusId(selected));
      if (user && !user.campus_id) {
        void dispatch(setUserCampus(selected));
      }
    });
  }, [authStatus, user, dispatch]);

  return <>{children}</>;
}
