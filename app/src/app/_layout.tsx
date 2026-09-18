import 'react-native-gesture-handler';
import '../../global.css';
import '../theme/nativewind';
import { useEffect, type ReactNode } from 'react';
import { LogBox, Platform, View } from 'react-native';
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
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { store } from '../store';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});
import { AppBootstrap } from '../components/AppBootstrap';
import { AddonCustomizeProvider } from '../components/AddonCustomizeSheet';
import { AppThemeProvider } from '../theme/ThemeProvider';
import { setUnauthorizedHandler } from '../lib/authRedirect';
import { useAppSelector } from '../store';
import { selectTheme } from '../store/slices/uiSlice';

export { ErrorBoundary } from 'expo-router';

// NativeWind's css-interop imports RN SafeAreaView at startup — ignore that known false-positive.
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(main)',
};

function ThemedStatusBar() {
  const theme = useAppSelector(selectTheme);
  const bg = theme === 'dark' ? '#0a0a0b' : '#f4f4f5';

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(bg);
    if (Platform.OS === 'android') {
      // Expo SDK 57: style is bar appearance ('light' | 'dark'), not icon color.
      NavigationBar.setStyle(theme);
    }
  }, [theme, bg]);

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {Platform.OS === 'android' ? <NavigationBar style={theme} /> : null}
    </>
  );
}

function ThemedRoot({ children }: { children: ReactNode }) {
  const theme = useAppSelector(selectTheme);
  const bg = theme === 'dark' ? '#0a0a0b' : '#f4f4f5';
  return <View style={{ flex: 1, backgroundColor: bg }}>{children}</View>;
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
  const [, error] = useFonts({
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

  // Always mount the root navigator so Expo Router's NavigationContainer exists on first paint.
  // Splash stays up via AppBootstrap until auth is ready; fonts apply when loaded.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemedRoot>
          <AppBootstrap>
            <RootNav />
          </AppBootstrap>
        </ThemedRoot>
      </Provider>
    </GestureHandlerRootView>
  );
}
