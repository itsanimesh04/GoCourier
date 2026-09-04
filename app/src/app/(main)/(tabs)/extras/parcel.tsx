import { RequireAuth } from '../../../../components/RequireAuth';
import ParcelRequestScreen from '../../../../screens/ParcelRequestScreen';

export default function ParcelRoute() {
  return (
    <RequireAuth>
      <ParcelRequestScreen />
    </RequireAuth>
  );
}
