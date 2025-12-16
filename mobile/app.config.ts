import type { ExpoConfig, ConfigContext } from 'expo/config';

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const APP_NAME = process.env.LANDA_APP_NAME ?? config.name ?? 'Landa';
  const SLUG = process.env.LANDA_APP_SLUG ?? config.slug ?? 'landa';
  const VERSION = process.env.LANDA_APP_VERSION ?? config.version ?? '1.0.0';

  // 上线前请替换为你们自己的唯一标识（App Store / Google Play 必需）
  const IOS_BUNDLE_ID = process.env.LANDA_IOS_BUNDLE_ID ?? 'com.example.landa';
  const ANDROID_PACKAGE = process.env.LANDA_ANDROID_PACKAGE ?? 'com.example.landa';

  // 可选：EAS 项目 ID（创建 EAS 项目后填入）
  const EAS_PROJECT_ID = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

  return {
    ...config,
    name: APP_NAME,
    slug: SLUG,
    version: VERSION,
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      ...config.ios,
      supportsTablet: true,
      bundleIdentifier: IOS_BUNDLE_ID,
    },
    android: {
      ...config.android,
      package: ANDROID_PACKAGE,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      ...config.web,
      favicon: './assets/favicon.png',
    },
    extra: {
      ...config.extra,
      // 运行时读取：Constants.expoConfig?.extra
      EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
      EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV ?? 'production',
      eas: EAS_PROJECT_ID ? { projectId: EAS_PROJECT_ID } : undefined,
    },
  };
};


