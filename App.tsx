import { NativeBaseProvider } from 'native-base'
import { StatusBar, Alert } from 'react-native'
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
import {
  addNotificationResponseReceivedListener,
  addNotificationReceivedListener
} from 'expo-notifications'
import { openURL } from 'expo-linking'
import { useEffect } from 'react'
import { setStringAsync } from 'expo-clipboard'

export default function App() {
  const [fonstLoaded] = useFonts({
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_700Bold
  })

  useEffect(() => {
    const foregroundSubscription = addNotificationResponseReceivedListener(
      response => {
        Alert.alert(
          'addNotificationReceivedListener',
          JSON.stringify(response),
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Copy',
              onPress: async () =>
                await setStringAsync(JSON.stringify(response))
            }
          ],
          { cancelable: false }
        )
        const notification = response.notification
        const data = notification.request.content.data
        const deepLink = (data.deepLink || '') as string

        if (deepLink) openURL(deepLink)
      }
    )

    const backgroundSubscription = addNotificationReceivedListener(response => {
      Alert.alert(
        'addNotificationReceivedListener',
        JSON.stringify(response),
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Copy',
            onPress: async () => await setStringAsync(JSON.stringify(response))
          }
        ],
        { cancelable: false }
      )
      const notification = response.request.content.data
      const data = notification.request.content.data
      const deepLink = (data.deepLink || '') as string

      if (deepLink) openURL(deepLink)
    })

    return () => {
      foregroundSubscription.remove()
      backgroundSubscription.remove()
    }
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
