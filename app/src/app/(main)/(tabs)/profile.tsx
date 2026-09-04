import { RequireAuth } from '../../../components/RequireAuth';
import ProfileScreen from '../../../screens/ProfileScreen';

export default function ProfileRoute() {
  return (
    <RequireAuth>
      <ProfileScreen />
    </RequireAuth>
  );
}
