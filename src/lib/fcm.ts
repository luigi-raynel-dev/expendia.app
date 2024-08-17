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
