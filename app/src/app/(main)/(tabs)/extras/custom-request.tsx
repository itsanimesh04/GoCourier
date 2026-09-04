import { RequireAuth } from '../../../../components/RequireAuth';
import CustomRequestScreen from '../../../../screens/CustomRequestScreen';

export default function CustomRequestRoute() {
  return (
    <RequireAuth>
      <CustomRequestScreen />
    </RequireAuth>
  );
}
