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
import * as Notifications from 'expo-notifications'
import { openURL } from 'expo-linking'
import { useEffect, useState } from 'react'
import { getNotificationFromFCM } from './src/lib/fcm'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
})

export default function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [fonstLoaded] = useFonts({
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_700Bold
  })

  useEffect(() => {
    let isMounted = true

    Notifications.getLastNotificationResponseAsync().then(async response => {
      if (!isMounted || !response?.notification) {
        return
      }
      try {
        setIsLoading(true)
        const { identifier } = response.notification.request

        const notification = await getNotificationFromFCM(identifier)

        if (notification && notification.url) openURL(notification.url)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  return isLoading || !fonstLoaded ? (
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
