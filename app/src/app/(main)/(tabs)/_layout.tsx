import { Tabs } from 'expo-router';
import { Home, ShoppingBag, Store, Truck, User } from 'lucide-react-native';
import { Platform } from 'react-native';
import { usePalette } from '../../../theme/ThemeProvider';
import { useAppDispatch, useAppSelector } from '../../../store';
import { selectCartCount } from '../../../store/slices/cartSlice';
import { setCatalogMode } from '../../../store/slices/uiSlice';
import { haptic } from '../../../utils/haptics';

export default function TabsLayout() {
  const colors = usePalette();
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 82 : 62,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 24 : 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans_700Bold',
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
        listeners={{
          tabPress: () => {
            haptic.selection();
          },
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: 'Food',
          tabBarIcon: ({ color, size }) => <Store size={size} color={color} />,
        }}
        listeners={{
          tabPress: () => {
            haptic.selection();
          },
        }}
      />
      <Tabs.Screen
        name="extras"
        options={{
          title: 'Extras',
          tabBarIcon: ({ color, size }) => <Truck size={size} color={color} />,
        }}
        listeners={{
          tabPress: () => {
            haptic.selection();
          },
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: cartCount > 0 ? (cartCount > 9 ? '9+' : cartCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: colors.onPrimary,
            fontSize: 9,
            fontFamily: 'PlusJakartaSans_700Bold',
          },
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
        listeners={{
          tabPress: () => {
            haptic.selection();
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
        listeners={{
          tabPress: () => {
            haptic.selection();
          },
        }}
      />
    </Tabs>
  );
}
