import { RequireAuth } from '../../../components/RequireAuth';
import CartScreen from '../../../screens/CartScreen';

export default function CartRoute() {
  return (
    <RequireAuth>
      <CartScreen />
    </RequireAuth>
  );
}
