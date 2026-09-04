import 'react-native-gesture-handler';
import '../../global.css';
import '../theme/nativewind';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { NavigationBar } from 'expo-navigation-bar';
import { useFonts, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import {
  SourceSans3_400Regular,
  SourceSans3_500Medium,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
} from '@expo-google-fonts/source-sans-3';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from '../store';
import { AppBootstrap } from '../components/AppBootstrap';
import { AddonCustomizeProvider } from '../components/AddonCustomizeSheet';
import { AppThemeProvider } from '../theme/ThemeProvider';
import { setUnauthorizedHandler } from '../lib/authRedirect';
import { useAppSelector } from '../store';
import { selectTheme } from '../store/slices/uiSlice';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();
void SystemUI.setBackgroundColorAsync('#0a0a0b');
if (Platform.OS === 'android') {
  NavigationBar.setStyle('light');
}

export const unstable_settings = {
  initialRouteName: '(main)',
};

function ThemedStatusBar() {
  const theme = useAppSelector(selectTheme);
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme === 'dark' ? '#0a0a0b' : '#f4f4f5');
    if (Platform.OS === 'android') {
      NavigationBar.setStyle(theme === 'dark' ? 'light' : 'dark');
    }
  }, [theme]);
  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {Platform.OS === 'android' ? <NavigationBar style={theme === 'dark' ? 'light' : 'dark'} /> : null}
    </>
  );
}

function RootNav() {
  return (
    <AppThemeProvider>
      <AddonCustomizeProvider>
        <ThemedStatusBar />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="(main)" />
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        </Stack>
      </AddonCustomizeProvider>
    </AppThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    SourceSans3_400Regular,
    SourceSans3_500Medium,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    setUnauthorizedHandler((from) => {
      router.replace({ pathname: '/login', params: from ? { from } : undefined });
    });
  }, []);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0a0a0b' }}>
      <Provider store={store}>
        <AppBootstrap>
          <RootNav />
        </AppBootstrap>
      </Provider>
    </GestureHandlerRootView>
  );
}
