import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { apiErrorMessage } from '../apis/clientApi';
import CampusPicker from '../components/CampusPicker';
import Field from '../components/Field';
import orderService from '../services/order.service';
import { useAppDispatch, useAppSelector } from '../store';
import {
  clearCartLocal,
  clearLastPlaced,
  fetchCart,
  selectCartItems,
  selectCartSubtotal,
  selectDeliveryFee,
  selectLastPlacedOrderId,
  setLastPlacedOrderId,
} from '../store/slices/cartSlice';
import { selectAuthUser } from '../store/slices/authSlice';
import { selectSelectedCampusId, setSelectedCampusId } from '../store/slices/uiSlice';
import { RAZORPAY_THEME } from '../theme/tokens';
import { usePalette } from '../theme/ThemeProvider';

let RazorpayCheckout: {
  open: (options: Record<string, unknown>) => Promise<unknown>;
} | null = null;
try {
  RazorpayCheckout = require('react-native-razorpay').default;
} catch {
  RazorpayCheckout = null;
}

export default function CheckoutScreen() {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const fee = useAppSelector(selectDeliveryFee);
  const lastId = useAppSelector(selectLastPlacedOrderId);
  const selectedCampusId = useAppSelector(selectSelectedCampusId);
  const user = useAppSelector(selectAuthUser);
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const [dropPoint, setDropPoint] = useState(user?.drop_point ?? '');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDropPoint(user?.drop_point ?? '');
  }, [user?.drop_point]);

  const pay = async () => {
    if (!dropPoint.trim()) {
      setError('Enter a drop point');
      return;
    }
    setPaying(true);
    setError(null);
    try {
      const created = await orderService.create(dropPoint.trim());
      const orderId = created.data.data.order_id as string;
      const sessionRes = await orderService.pay(orderId);
      const session = sessionRes.data.data as {
        key_id: string;
        gateway_order_id: string;
        amount_subunits: number;
        currency: string;
      };

      if (!RazorpayCheckout) {
        throw new Error('Razorpay requires a development or production build (not Expo Go).');
      }

      await RazorpayCheckout.open({
        key: session.key_id,
        amount: session.amount_subunits,
        currency: session.currency,
        order_id: session.gateway_order_id,
        name: 'GoCourier',
        description: 'Campus batch order',
        prefill: {
          name: user?.name ?? undefined,
          email: user?.email ?? undefined,
          contact: user?.phone ?? undefined,
        },
        theme: { color: RAZORPAY_THEME },
      });

      dispatch(setLastPlacedOrderId(orderId));
      dispatch(clearCartLocal());
    } catch (err) {
      setError(apiErrorMessage(err));
      await dispatch(fetchCart());
    } finally {
      setPaying(false);
    }
  };

  if (lastId) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-6">
        <Text className="text-center font-display text-2xl font-bold tracking-tight text-fg">
          Payment initiated
        </Text>
        <Text className="mt-3 font-display text-lg font-semibold text-primary">
          {lastId.slice(-8).toUpperCase()}
        </Text>
        <Text className="mt-2 text-center font-sans text-sm text-muted">
          We will confirm the order once Razorpay reports a captured payment.
        </Text>
        <View className="mt-8 flex-row flex-wrap justify-center gap-3">
          <Pressable
            onPress={() => {
              dispatch(clearLastPlaced());
              router.push('/profile');
            }}
            className="rounded-xl bg-primary px-6 py-3"
          >
            <Text className="font-sans text-sm font-semibold text-on-primary">View Orders</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              dispatch(clearLastPlaced());
              router.push('/');
            }}
            className="rounded-xl border border-border px-6 py-3"
          >
            <Text className="font-sans text-sm font-semibold text-fg">Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return <Redirect href="/cart" />;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="px-4 py-5 pb-10" keyboardShouldPersistTaps="handled">
        <Text className="mb-5 font-display text-2xl font-bold text-fg">Checkout</Text>
        {error ? <Text className="mb-4 font-sans text-sm text-red-400">{error}</Text> : null}

        <View className="rounded-2xl border border-border bg-surface p-4">
          <Text className="mb-3 font-display text-base font-semibold text-fg">Delivery</Text>
          <Text className="mb-1 font-sans text-xs text-muted">Campus</Text>
          <CampusPicker variant="panel" />
          {selectedCampusId ? (
            <Pressable onPress={() => dispatch(setSelectedCampusId(selectedCampusId))} />
          ) : null}
          <View className="mt-4">
            <Field
              label="Drop point"
              value={dropPoint}
              onChangeText={setDropPoint}
              placeholder="Hostel Block C lobby"
              autoCapitalize="sentences"
            />
          </View>
          <Text className="mt-3 font-sans text-xs text-muted">
            Pay securely with Razorpay. Orders deliver with tonight&apos;s hostel batch.
          </Text>
        </View>

        <View className="mt-5 rounded-2xl border border-border bg-surface p-4">
          <Text className="mb-4 font-display text-base font-bold text-fg">Order summary</Text>
          {items.map((item) => (
            <View key={item.cartKey} className="mb-2 flex-row justify-between">
              <Text className="flex-1 font-sans text-sm text-muted">
                {item.name} × {item.quantity}
              </Text>
              <Text className="font-display text-sm text-fg">
                ₹{lineUnit(item.unitPrice, item.selectedAddons) * item.quantity}
              </Text>
            </View>
          ))}
          <View className="mt-3 border-t border-border pt-3">
            <View className="flex-row justify-between">
              <Text className="font-sans text-sm text-muted">Subtotal</Text>
              <Text className="font-display text-sm text-fg">₹{subtotal}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="font-sans text-sm text-muted">Fee</Text>
              <Text className="font-display text-sm text-fg">₹{fee}</Text>
            </View>
            <View className="mt-2 flex-row justify-between">
              <Text className="font-display text-base font-semibold text-fg">Total</Text>
              <Text className="font-display text-base font-semibold text-fg">₹{subtotal + fee}</Text>
            </View>
          </View>
          <Pressable
            disabled={paying}
            onPress={() => void pay()}
            className="mt-4 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 disabled:opacity-60"
          >
            {paying ? <ActivityIndicator color={colors.onPrimary} /> : null}
            <Text className="text-center font-display text-sm font-semibold text-on-primary">
              {paying ? 'Opening Razorpay…' : 'Place order'}
            </Text>
          </Pressable>
          <Text className="mt-3 text-center font-sans text-xs text-muted">
            By placing an order you agree to our Terms and Privacy Policy.
          </Text>
          <View className="mt-2 flex-row flex-wrap justify-center gap-3">
            <Pressable onPress={() => void Linking.openURL('https://gocourierservice.com/terms')}>
              <Text className="font-sans text-xs text-primary">Terms</Text>
            </Pressable>
            <Pressable onPress={() => void Linking.openURL('https://gocourierservice.com/privacy')}>
              <Text className="font-sans text-xs text-primary">Privacy</Text>
            </Pressable>
            <Pressable onPress={() => void Linking.openURL('https://gocourierservice.com/refund-policy')}>
              <Text className="font-sans text-xs text-primary">Refunds</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={paying} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/55 px-8">
          <View className="w-full items-center rounded-2xl bg-surface px-6 py-8">
            <ActivityIndicator color={colors.primary} size="large" />
            <Text className="mt-4 font-display text-base font-semibold text-fg">Opening Razorpay…</Text>
            <Text className="mt-1 text-center font-sans text-sm text-muted">Please wait — do not go back.</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function lineUnit(unitPrice: number, addons: { price: number }[]) {
  return unitPrice + addons.reduce((sum, a) => sum + a.price, 0);
}
