import React, { useState } from 'react'
import {
  Actionsheet,
  VStack,
  Center,
  Text,
  Box,
  useToast,
  HStack,
  useTheme
} from 'native-base'
import { Alert } from 'react-native'
import { api } from '../lib/axios'
import dayjs from 'dayjs'
import { ExpenseForm } from '../screens/ExpenseName'
import { Pressable } from '@react-native-material/core'
import { Calendar, CalendarPlus, Pencil } from 'phosphor-react-native'
import { useNavigation } from '@react-navigation/native'
import Loading from './Loading'
import { THEME } from '../styles/theme'

interface Props {
  isOpen?: boolean
  onClose?: (success?: boolean) => void
  expenses: ExpenseForm[]
}

export interface MarkAsPaidForm {
  paid: boolean
  paidAt: string
  email: string
}

export default function DuplicateExpense({ isOpen, onClose, expenses }: Props) {
  const theme = useTheme()
  const { navigate } = useNavigation()
  const toast = useToast()
  const [isSubmitting, setSubmitting] = useState(false)

  const customDuplicate = () => {
    if (expenses.length === 1)
      navigate('ExpenseName', {
        ...expenses[0],
        id: undefined
      })
  }

  async function duplicateToDate(date: 'month' | 'year') {
    try {
      setSubmitting(true)
      const promises = expenses.map(expense =>
        api.post(`/groups/${expense.group_id}/expenses`, {
          ...expense,
          id: undefined,
          dueDate: dayjs(expense.dueDate).add(1, date).toISOString()
        })
      )
      Promise.all(promises)
        .then(() => {
          toast.show({
            title: 'Despesas duplicadas com sucesso!'
          })
          if (onClose) onClose(true)
        })
        .catch(error => {
          Alert.alert('Ops!', 'Algo deu errado. Tente novamente mais tarde!')
          console.error('Error:', error.message)
          if (onClose) onClose(false)
        })
    } catch (error) {
      Alert.alert('Ops!', 'Algo deu errado. Tente novamente mais tarde!')
      if (onClose) onClose(false)
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Center>
      <Actionsheet isOpen={isOpen} onClose={onClose} hideDragIndicator>
        <Actionsheet.Content bgColor="gray.900">
          <VStack space={6} w="full" p={4} alignItems="center">
            <Box textAlign="center">
              <Text color="white" fontSize="2xl">
                Duplicar {`despesa${expenses.length > 0 ? 's' : ''}`}
              </Text>
            </Box>
          </VStack>
          {!isSubmitting ? (
            <VStack w="full">
              <Pressable
                style={{
                  padding: 12,
                  width: '100%',
                  opacity: expenses.length > 1 ? 0.5 : 1
                }}
                disabled={expenses.length > 1}
                onPress={customDuplicate}
              >
                <HStack space={2} alignItems="center">
                  <Pencil color={THEME.colors.palette.light.purple} size={28} />
                  <Text color="white" fontSize="lg">
                    Personalizar
                  </Text>
                </HStack>
              </Pressable>
              <Pressable
                style={{
                  padding: 12,
                  width: '100%'
                }}
                onPress={() => duplicateToDate('month')}
              >
                <HStack space={2} alignItems="center">
                  <Calendar
                    color={THEME.colors.palette.light.purple}
                    size={28}
                  />
                  <Text color="white" fontSize="lg">
                    Duplicar para o próximo mês
                  </Text>
                </HStack>
              </Pressable>
              <Pressable
                style={{
                  padding: 12,
                  width: '100%'
                }}
                onPress={() => duplicateToDate('year')}
              >
                <HStack space={2} alignItems="center">
                  <CalendarPlus
                    color={THEME.colors.palette.light.purple}
                    size={28}
                  />
                  <Text color="white" fontSize="lg">
                    Duplicar para o próximo ano
                  </Text>
                </HStack>
              </Pressable>
            </VStack>
          ) : (
            <VStack justifyContent="center" alignItems="center" my={4}>
              <Loading />
            </VStack>
          )}
        </Actionsheet.Content>
      </Actionsheet>
    </Center>
  )
}
