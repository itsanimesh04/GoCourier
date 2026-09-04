import { Tabs } from 'expo-router';
import { Home, ShoppingBag, Store, Truck, User } from 'lucide-react-native';
import { usePalette } from '../../../theme/ThemeProvider';
import { useAppDispatch, useAppSelector } from '../../../store';
import { selectCartCount } from '../../../store/slices/cartSlice';
import { setCatalogMode } from '../../../store/slices/uiSlice';

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
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 58,
          paddingTop: 4,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans_600SemiBold',
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
          tabPress: () => dispatch(setCatalogMode('food')),
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: 'Food',
          tabBarIcon: ({ color, size }) => <Store size={size} color={color} />,
        }}
        listeners={{
          tabPress: () => dispatch(setCatalogMode('food')),
        }}
      />
      <Tabs.Screen
        name="extras"
        options={{
          title: 'Extras',
          tabBarIcon: ({ color, size }) => <Truck size={size} color={color} />,
        }}
        listeners={{
          tabPress: () => dispatch(setCatalogMode('extras')),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarBadge: cartCount > 0 ? (cartCount > 9 ? '9+' : cartCount) : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary, color: colors.onPrimary },
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
