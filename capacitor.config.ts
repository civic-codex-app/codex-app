import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.getpoli.poli',
  appName: 'Poli',
  webDir: 'public',
  server: {
    url: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://getpoli.app',
    allowNavigation: ['getpoli.app', '*.getpoli.app', 'localhost'],
  },
  ios: {
    contentInset: 'never',
    scheme: 'poli',
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
