import { NativeBaseProvider } from 'native-base'
import { StatusBar } from 'react-native'
import {
  useFonts,
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_700Bold
} from '@expo-google-fonts/open-sans'
import { THEME } from './src/styles/theme'
import Loading from './src/components/Loading'
import Routes from './src/routes'
import { AuthContextProvider } from './src/context/AuthContext'
import { IntroContextProvider } from './src/context/IntroContext'
import { PushNotificationContextProvider } from './src/context/PushNotificationContext'
import { addNotificationResponseReceivedListener } from 'expo-notifications'
import { openURL } from 'expo-linking'
import { useEffect } from 'react'

export default function App() {
  const [fonstLoaded] = useFonts({
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_700Bold
  })

  useEffect(() => {
    const subscription = addNotificationResponseReceivedListener(response => {
      const notification = response.notification
      const data = notification.request.content.data
      const deepLink = (data.deepLink || '') as string

      if (deepLink) openURL(deepLink)
    })

    return () => subscription.remove()
  }, [])

  return !fonstLoaded ? (
    <Loading />
  ) : (
    <NativeBaseProvider theme={THEME}>
      <IntroContextProvider>
        <AuthContextProvider>
          <PushNotificationContextProvider>
            <StatusBar
              barStyle="light-content"
              backgroundColor="transparent"
              translucent
            />
            <Routes />
          </PushNotificationContextProvider>
        </AuthContextProvider>
      </IntroContextProvider>
    </NativeBaseProvider>
  )
}
