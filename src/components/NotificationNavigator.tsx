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

        if (group?.data?.id) {
          if (data.notificationTopic === 'NEW_GROUP')
            navigate('Expenses', group.data)
          else if (expense?.data?.id)
            navigate('Expense', {
              group: group.data,
              expense: expense.data
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
    } finally {
      setLoading(false)
      setData(undefined)
    }
  }

  useEffect(() => {
    getData()
  }, [data])

  return isLoading ? <OverLoader /> : <></>
}
