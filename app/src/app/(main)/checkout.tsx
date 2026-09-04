import { RequireAuth } from '../../components/RequireAuth';
import CheckoutScreen from '../../screens/CheckoutScreen';

export default function CheckoutRoute() {
  return (
    <RequireAuth>
      <CheckoutScreen />
    </RequireAuth>
  );
}
