import { api } from './axios'

export type NotificationPayloadType = {
  id: string
  notificationTokenId: string
  notificationId: string
  topic: string | null
  groupId: string | null
  expenseId: string | null
  title: string
  body: string
  url: string | null
  createdAt: Date
}

export type NotificationFromFCMResponse = {
  notification?: NotificationPayloadType
}

export const getNotificationFromFCM = async (notificationId: string) => {
  try {
    const response = await api.post<NotificationFromFCMResponse>(
      'getNotificationFromFCM',
      { notificationId }
    )

    return response.data?.notification || null
  } catch (error) {
    console.error(error)
    return null
  }
}
