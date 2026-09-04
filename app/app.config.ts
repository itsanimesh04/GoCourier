import type { ConfigContext, ExpoConfig } from 'expo/config';

const isProduction = process.env.EAS_BUILD_PROFILE === 'production';

export default ({ config }: ConfigContext): ExpoConfig =>
  ({
    ...config,
    name: 'GoCourier',
    slug: 'gocourier',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'gocourier',
    userInterfaceStyle: 'automatic',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.gocourierservice.app',
      infoPlist: {
        NSCameraUsageDescription:
          'GoCourier needs camera access so you can photograph items for custom campus requests.',
        NSPhotoLibraryUsageDescription:
          'GoCourier needs photo library access so you can attach screenshots to custom requests.',
        NSPhotoLibraryAddUsageDescription: 'GoCourier may save images you attach to custom requests.',
        NSAppTransportSecurity: {
          NSAllowsLocalNetworking: true,
        },
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#0a0a0b',
        foregroundImage: './assets/images/adaptive-icon.png',
      },
      package: 'com.gocourierservice.app',
      permissions: ['CAMERA', 'READ_MEDIA_IMAGES', 'READ_EXTERNAL_STORAGE', 'INTERNET'],
      predictiveBackGestureEnabled: false,
      ...(!isProduction ? { usesCleartextTraffic: true } : {}),
    } as ExpoConfig['android'],
    androidNavigationBar: {
      backgroundColor: '#0a0a0b',
      barStyle: 'light-content',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      'expo-font',
      [
        'expo-image-picker',
        {
          photosPermission: 'GoCourier needs photo access so you can attach screenshots to custom requests.',
          cameraPermission:
            'GoCourier needs camera access so you can photograph items for custom campus requests.',
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          resizeMode: 'contain',
          backgroundColor: '#0a0a0b',
        },
      ],
      [
        'expo-navigation-bar',
        {
          enforceContrast: false,
          style: 'light',
        },
      ],
      'expo-system-ui',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
  }) as ExpoConfig;
