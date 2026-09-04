import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import Field from '../components/Field';
import CampusPicker from '../components/CampusPicker';
import orderService from '../services/order.service';
import { useAppDispatch, useAppSelector } from '../store';
import { logoutUser, selectAuthUser, setUserCampus } from '../store/slices/authSlice';
import { selectOrders, setOrders } from '../store/slices/cartSlice';
import {
  selectAppConfig,
  selectCampuses,
  selectMenuItems,
  selectRestaurants,
} from '../store/slices/catalogSlice';
import {
  AVATAR_PRESETS,
  getAvatarUrl,
  selectProfile,
  setAvatarId,
  updateProfile,
  type AvatarId,
} from '../store/slices/profileSlice';
import { selectSelectedCampusId, setSelectedCampusId } from '../store/slices/uiSlice';
import { selectFoodWishlist, selectRestaurantWishlist } from '../store/slices/wishlistSlice';
import { DEFAULT_FAQ } from '../data/homepageData';
import type { Order } from '../utils/types';
import { cn } from '../utils/utils';
import { usePalette } from '../theme/ThemeProvider';

export default function ProfileScreen() {
  const profile = useAppSelector(selectProfile);
  const campuses = useAppSelector(selectCampuses);
  const user = useAppSelector(selectAuthUser);
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const config = useAppSelector(selectAppConfig);
  const campus = campuses.find((c) => c.id === profile.campusId);
  const [editing, setEditing] = useState(false);
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const foodIds = useAppSelector(selectFoodWishlist);
  const restaurantIds = useAppSelector(selectRestaurantWishlist);
  const menuItems = useAppSelector(selectMenuItems);
  const restaurants = useAppSelector(selectRestaurants);
  const orders = useAppSelector(selectOrders);
  const selectedCampusId = useAppSelector(selectSelectedCampusId);
  const faq = config?.faq && config.faq.length > 0 ? config.faq : DEFAULT_FAQ;

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  useEffect(() => {
    setOrdersLoading(true);
    void orderService
      .list()
      .then((res) => {
        const rows = (res.data.data.orders ?? []) as {
          id: string;
          order_status: Order['orderStatus'];
          payment_status: Order['paymentStatus'];
          drop_point: string | null;
          total_amount: string;
          placed_at: string | null;
          restaurant?: { id?: string | null; name?: string | null };
          campus?: { id?: string };
        }[];
        dispatch(
          setOrders(
            rows.map((row) => ({
              id: row.id,
              displayId: row.id.slice(-8).toUpperCase(),
              restaurantId: row.restaurant?.id ?? '',
              restaurantName: row.restaurant?.name ?? 'Campus extras',
              campusId: row.campus?.id ?? '',
              dropPoint: row.drop_point ?? '',
              orderStatus: row.order_status,
              paymentStatus: row.payment_status,
              subtotal: 0,
              fee: 0,
              totalAmount: Number(row.total_amount),
              eta: '',
              placedAt: row.placed_at ? new Date(row.placed_at).toLocaleString('en-IN') : '—',
              items: [],
            }))
          )
        );
      })
      .catch(() => dispatch(setOrders([])))
      .finally(() => setOrdersLoading(false));
  }, [dispatch]);
  const save = () => {
    dispatch(
      updateProfile({
        name: draft.name.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        campusId: draft.campusId || selectedCampusId,
      })
    );
    const campusId = draft.campusId || selectedCampusId;
    dispatch(setSelectedCampusId(campusId));
    if (campusId) void dispatch(setUserCampus(campusId));
    setEditing(false);
  };

  const foods = foodIds.map((id) => menuItems.find((m) => m.id === id)).filter(Boolean);
  const restos = restaurantIds.map((id) => restaurants.find((r) => r.id === id)).filter(Boolean);

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerClassName="px-4 py-5 pb-12">
      <Text className="mb-5 font-display text-2xl font-bold text-fg">Profile</Text>

      <View className="rounded-2xl border border-border bg-surface p-4">
        <View className="mb-5 flex-row items-start gap-4">
          <Pressable onPress={() => setPickingAvatar((v) => !v)}>
            <Image
              source={{ uri: getAvatarUrl(profile.avatarId) }}
              className="h-20 w-20 rounded-2xl border border-border bg-surface-2"
            />
          </Pressable>
          <View className="min-w-0 flex-1">
            <Text className="font-display text-xl font-bold text-fg">{profile.name}</Text>
            <Text className="font-sans text-sm text-muted">{profile.email}</Text>
            {campus ? (
              <Text className="mt-2 self-start rounded-lg bg-primary/15 px-2 py-0.5 font-sans text-xs font-medium text-primary">
                {campus.name}
              </Text>
            ) : null}
            {!editing ? (
              <Pressable onPress={() => setEditing(true)} className="mt-3">
                <Text className="font-sans text-sm font-semibold text-primary">Edit information</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {pickingAvatar ? (
          <View className="mb-5 rounded-xl border border-border bg-surface-2 p-3">
            <Text className="mb-2 font-sans text-xs uppercase text-muted">Choose avatar</Text>
            <View className="flex-row flex-wrap gap-2">
              {AVATAR_PRESETS.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => {
                    dispatch(setAvatarId(a.id as AvatarId));
                    setPickingAvatar(false);
                  }}
                  className={cn(
                    'overflow-hidden rounded-xl border-2',
                    profile.avatarId === a.id ? 'border-primary' : 'border-transparent'
                  )}
                >
                  <Image source={{ uri: a.url }} className="h-16 w-16 bg-surface" />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {editing ? (
          <View className="gap-3">
            <Text className="font-display text-lg font-semibold text-fg">Edit account</Text>
            <Field label="Name" value={draft.name} onChangeText={(name) => setDraft((d) => ({ ...d, name }))} autoCapitalize="words" />
            <Field
              label="Email"
              value={draft.email}
              onChangeText={(email) => setDraft((d) => ({ ...d, email }))}
              keyboardType="email-address"
            />
            <Field
              label="Phone"
              value={draft.phone}
              onChangeText={(phone) => setDraft((d) => ({ ...d, phone }))}
              keyboardType="phone-pad"
            />
            <Text className="font-sans text-xs uppercase text-muted">Campus</Text>
            <CampusPicker variant="panel" />
            <View className="flex-row gap-2 pt-1">
              <Pressable onPress={save} className="flex-1 rounded-xl bg-primary py-2">
                <Text className="text-center font-sans text-sm font-semibold text-on-primary">Save</Text>
              </Pressable>
              <Pressable onPress={() => setEditing(false)} className="rounded-xl border border-border px-4 py-2">
                <Text className="font-sans text-sm text-muted">Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="gap-3">
            <Text className="font-display text-lg font-semibold text-fg">Account</Text>
            <View>
              <Text className="font-sans text-xs uppercase text-muted">Phone</Text>
              <Text className="font-sans text-sm text-fg">{profile.phone || '—'}</Text>
            </View>
            <View>
              <Text className="font-sans text-xs uppercase text-muted">Campus</Text>
              <Text className="font-sans text-sm text-fg">{campus ? `${campus.name}, ${campus.city}` : '—'}</Text>
            </View>
            <View>
              <Text className="font-sans text-xs uppercase text-muted">Role</Text>
              <Text className="font-sans text-sm text-fg">Student</Text>
            </View>
          </View>
        )}

        {user ? (
          <Pressable
            onPress={() => {
              void dispatch(logoutUser());
              router.replace('/');
            }}
            className="mt-5 rounded-xl border border-border py-2.5"
          >
            <Text className="text-center font-sans text-sm font-semibold text-fg">Logout</Text>
          </Pressable>
        ) : null}
      </View>

      <View className="mt-5 rounded-2xl border border-border bg-surface p-4">
        <Text className="mb-3 font-display text-lg font-bold text-fg">Wishlist</Text>
        {foods.length === 0 && restos.length === 0 ? (
          <Text className="font-sans text-sm text-muted">No saved dishes or restaurants yet.</Text>
        ) : (
          <View className="gap-2">
            {foods.map((item) =>
              item ? (
                <Pressable key={item.id} onPress={() => router.push(`/food/foods/${item.id}`)}>
                  <Text className="font-sans text-sm text-primary">{item.name}</Text>
                </Pressable>
              ) : null
            )}
            {restos.map((item) =>
              item ? (
                <Pressable key={item.id} onPress={() => router.push(`/food/restaurants/${item.id}`)}>
                  <Text className="font-sans text-sm text-primary">{item.name}</Text>
                </Pressable>
              ) : null
            )}
          </View>
        )}
      </View>

      <View className="mt-5 rounded-2xl border border-border bg-surface p-5">
        <Text className="mb-4 font-display text-lg font-bold text-fg">Past Orders</Text>
        {ordersLoading ? (
          <View className="items-center py-6">
            <ActivityIndicator color={colors.primary} />
            <Text className="mt-2 font-sans text-sm text-muted">Loading orders…</Text>
          </View>
        ) : orders.length === 0 ? (
          <Text className="font-sans text-sm text-muted">No orders yet.</Text>
        ) : (
          <View className="gap-4">
            {orders.map((order) => (
              <View key={order.id} className="rounded-xl border border-border p-4">
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="font-display text-sm font-semibold text-fg">{order.displayId}</Text>
                    <Text className="font-sans text-sm text-muted">{order.restaurantName}</Text>
                  </View>
                  <Text className="rounded-lg bg-surface-2 px-2 py-0.5 font-sans text-xs uppercase text-muted">
                    {order.orderStatus.replace(/_/g, ' ')} · {order.paymentStatus}
                  </Text>
                </View>
                <View className="mt-3 flex-row justify-between">
                  <Text className="font-display text-sm font-semibold text-fg">{order.placedAt}</Text>
                  <Text className="font-display text-sm font-semibold text-fg">₹ {order.totalAmount}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className="mt-5 rounded-2xl border border-border bg-surface p-4">
        <Text className="mb-2 font-display text-lg font-bold text-fg">Support</Text>
        <Pressable onPress={() => void Linking.openURL('https://wa.me/919606081463')}>
          <Text className="font-sans text-sm text-primary">WhatsApp +91 9606081463</Text>
        </Pressable>
        <Pressable
          className="mt-2"
          onPress={() => void Linking.openURL('https://gocourierservice.com/contact')}
        >
          <Text className="font-sans text-sm text-primary">Contact us</Text>
        </Pressable>
        <View className="mt-4 flex-row flex-wrap gap-x-4 gap-y-2">
          <Pressable onPress={() => void Linking.openURL('https://gocourierservice.com/privacy')}>
            <Text className="font-sans text-xs text-muted">Privacy</Text>
          </Pressable>
          <Pressable onPress={() => void Linking.openURL('https://gocourierservice.com/terms')}>
            <Text className="font-sans text-xs text-muted">Terms</Text>
          </Pressable>
          <Pressable
            onPress={() => void Linking.openURL('https://gocourierservice.com/refund-policy')}
          >
            <Text className="font-sans text-xs text-muted">Refunds</Text>
          </Pressable>
          <Pressable
            onPress={() => void Linking.openURL('https://gocourierservice.com/shipping-policy')}
          >
            <Text className="font-sans text-xs text-muted">Delivery</Text>
          </Pressable>
        </View>
        <Text className="mt-3 font-sans text-xs text-muted">© 2026 GoCourier</Text>
      </View>

      <View className="mt-5 rounded-2xl border border-border bg-surface p-4">
        <Text className="mb-1 font-display text-lg font-bold text-fg">FAQ</Text>
        <Text className="mb-3 font-sans text-xs text-muted">Quick answers about campus delivery.</Text>
        {faq.map((item, index) => {
          const id = index + 1;
          const open = openFaq === id;
          return (
            <View key={id} className="border-t border-border">
              <Pressable
                onPress={() => setOpenFaq(open ? null : id)}
                className="flex-row items-center justify-between py-3.5"
              >
                <Text className="flex-1 pr-3 font-sans text-sm font-semibold text-fg">{item.question}</Text>
                {open ? (
                  <ChevronUp size={18} color={colors.primary} />
                ) : (
                  <ChevronDown size={18} color={colors.muted} />
                )}
              </Pressable>
              {open ? (
                <Text className="pb-3.5 font-sans text-sm leading-relaxed text-muted">{item.answer}</Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
