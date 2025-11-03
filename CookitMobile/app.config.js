import 'dotenv/config';

export default {
  expo: {
    name: "CookIt",
    slug: "CookitMobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "cookitmobile",
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "cookitmobile"
          }
        ],
        category: ["BROWSABLE", "DEFAULT"]
      }
    ],
    userInterfaceStyle: "automatic",
    newArchEnabled: false,
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSMicrophoneUsageDescription: "요리 단계를 음성으로 제어하기 위해 마이크 권한이 필요합니다.",
        NSSpeechRecognitionUsageDescription: "음성 명령을 인식하기 위해 음성 인식 권한이 필요합니다."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      googleServicesFile: "./google-services.json",
      package: "com.cookit.mobile",
      permissions: [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "android.permission.RECORD_AUDIO"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-splash-screen",
        {
          image: "./assets/splash.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#FF6B35",
          sounds: [],
          mode: "production"
        }
      ],
      [
        "expo-build-properties",
        {
          android: {
            minSdkVersion: 23,
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0"
          }
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "9e253b46-c7c8-463e-a6e2-1826662fa9fe"
      },
      // 환경변수에서 안전하게 로드
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    }
  }
};