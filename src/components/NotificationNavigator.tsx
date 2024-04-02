import { useNavigation } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import { usePushNotification } from '../hooks/usePushNotification'
import OverLoader from './OverLoader'
import { api } from '../lib/axios'
import { Alert } from 'react-native'

export const NotificationNavigator: React.FC = () => {
  const { navigate } = useNavigation()
  const { data, setData } = usePushNotification()
  const [isLoading, setLoading] = useState(false)

  async function getData() {
    try {
      if (data?.notificationTopic) {
        setLoading(true)

        let groupResponse = null
        let expenseResponse = null

        if (data.groupId)
          groupResponse = await api.get(`/groups/${data.groupId}`)

        if (data.expenseId)
          expenseResponse = await api.get(`/expenses/${data.expenseId}`)

        const [group, expense] = await Promise.all([
          groupResponse,
          expenseResponse
        ])

        if (group?.data?.group) {
          if (data.notificationTopic === 'NEW_GROUP')
            navigate('Expenses', group.data.group)
          else if (expense?.data?.expense)
            navigate('Expense', {
              group: group.data.group,
              expense: expense.data.expense
            })
          else
            Alert.alert(
              'Ops!',
              'Não foi possível obter as informações desta notificação.'
            )
        } else
          Alert.alert(
            'Ops!',
            'Não foi possível obter as informações deste grupo. Tente novamente mais tarde!'
          )
      }
    } catch (error) {
      Alert.alert(
        'Ops!',
        'Não foi possível obter as informações desta notificação.'
      )
      console.error('getData', error)
    } finally {
      setLoading(false)
      setData(undefined)
    }
  }

  useEffect(() => {
    getData()
  }, [data])

  return <OverLoader isLoading={isLoading} />
}
