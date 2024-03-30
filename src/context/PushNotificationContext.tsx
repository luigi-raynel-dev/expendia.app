import { createContext, ReactNode, useEffect, useState } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/axios'
import { Alert } from 'react-native'

export type DataPushNotification = {
  notificationTopic?:
    | 'NEW_GROUP'
    | 'NEW_EXPENSE'
    | 'FULLY_PAID'
    | 'USER_PAID'
    | 'EXPENSE_EXPIRATION'
  groupId?: string
  expenseId?: string
}
export interface PushNotificationContextDataProps {
  token?: string
  setData: (data?: DataPushNotification) => void
  data?: DataPushNotification
}

interface PushNotificationProviderProps {
  children: ReactNode
}

export const PushNotificationContext = createContext(
  {} as PushNotificationContextDataProps
)

export function PushNotificationContextProvider({
  children
}: PushNotificationProviderProps) {
  const { user } = useAuth()
  const [token, setToken] = useState()
  const [data, setData] = useState<DataPushNotification>()

  const getDevicePushToken = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus === 'granted') {
        const responseToken = await Notifications.getDevicePushTokenAsync()
        setToken(responseToken.data)
      }
    }
  }

  const sendPushToken = async () => {
    try {
      const response = await api.post('/pushToken', { token })
      console.log(response.data)
    } catch (error) {
      console.error('Notification Error: ', error)
    }
  }

  useEffect(() => {
    if (user?.id) getDevicePushToken()
  }, [user?.id])

  useEffect(() => {
    if (token) sendPushToken()
  }, [token])

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      notification => {
        const {
          request: {
            content: { data, body }
          }
        } = notification
        Alert.alert('Data', JSON.stringify(data))
        setData(data)
      }
    )

    return () => subscription.remove()
  }, [])

  return (
    <PushNotificationContext.Provider
      value={{
        token,
        data,
        setData
      }}
    >
      {children}
    </PushNotificationContext.Provider>
  )
}
