import { Redirect, usePathname } from 'expo-router';
import { useAppSelector } from '../store';
import { selectAuthStatus, selectAuthUser } from '../store/slices/authSlice';
import { ScreenLoader } from './ui';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAppSelector(selectAuthUser);
  const status = useAppSelector(selectAuthStatus);
  const pathname = usePathname();

  if (status !== 'ready') {
    return <ScreenLoader />;
  }

  if (!user) {
    return <Redirect href={{ pathname: '/login', params: { from: pathname } }} />;
  }

  return children;
}
