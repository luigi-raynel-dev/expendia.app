import { useContext } from 'react'
import {
  PushNotificationContext,
  PushNotificationContextDataProps
} from '../context/PushNotificationContext'

export function usePushNotification(): PushNotificationContextDataProps {
  const context = useContext(PushNotificationContext)

  return context
}
