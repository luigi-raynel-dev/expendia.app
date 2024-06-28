import { NativeBaseProvider } from 'native-base'
import { Alert, StatusBar } from 'react-native'
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
import messaging from '@react-native-firebase/messaging'
import * as Clipboard from 'expo-clipboard'

export default function App() {
  const [fonstLoaded] = useFonts({
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_700Bold
  })

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    Alert.alert(
      'Mensagem recebida em background:',
      JSON.stringify(remoteMessage),
      [
        {
          text: 'Copiar',
          onPress: async () => {
            await Clipboard.setStringAsync(JSON.stringify(remoteMessage))
          }
        },
        { text: 'Fechar', onPress: () => console.log('Fechar Pressionado') }
      ]
    )
  })

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
