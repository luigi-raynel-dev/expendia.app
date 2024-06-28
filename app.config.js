export default {
  name: 'Expendia',
  slug: 'expendia',
  scheme: 'expendia',
  version: '0.2.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#A34FD8'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#A34FD8'
    },
    package: 'com.devluigiraynel.expendia',
    googleServicesFile: process.env.GOOGLE_SERVICES,
    versionCode: 5
  },
  plugins: [
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
    '@react-native-firebase/auth',
    '@react-native-firebase/crashlytics'
  ],
  extra: {
    eas: {
      projectId: '0b4ad4b3-7e6b-4a48-b753-9d8d28ae1b4d'
    }
  },
  owner: 'devluigiraynel'
}
