import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.codex.app',
  appName: 'Codex',
  webDir: 'public',
  server: {
    // Update this to your production URL once deployed
    url: 'http://localhost:3000',
    allowNavigation: ['localhost'],
  },
  ios: {
    contentInset: 'never',
    scheme: 'codex',
    backgroundColor: '#050505',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
    },
  },
}

export default config
