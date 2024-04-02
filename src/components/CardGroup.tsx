import React, { useState, useEffect, useMemo } from 'react'
import { HStack, Skeleton, Text, VStack } from 'native-base'
import { AvatarGroup } from './MemberAvatar'
import { GroupProps } from '../screens/Groups'
import { api } from '../lib/axios'
import { Alert } from 'react-native'
import { useAuth } from '../hooks/useAuth'
import { Pressable } from '@react-native-material/core'
import { present } from './DateController'
import CardBox from './CardBox'
import { ExpenseProps } from '../screens/Expenses'
interface CardGroupProps {
  group: GroupProps
  handlePress?: (group: GroupProps) => void
}

export function CardGroup({ group, handlePress }: CardGroupProps) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<ExpenseProps[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getExpenses()
  }, [])

  const getExpenses = async () => {
    setIsLoading(true)
    try {
      const date = present
      const query = `month=${date.month + 1}&year=${date.year}`
      const response = await api.get(`/groups/${group.id}/expenses?${query}`)
      setExpenses(response.data.expenses || [])
    } catch (error) {
      Alert.alert(
        'Ops!',
        'Não foi possível buscar as despesas do grupo ' + group.title
      )
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const unpaidExpenses = useMemo(
    () =>
      expenses.filter(({ Paying }) => {
        return Paying.find(
          member => member.paid === false && member.paying.email === user.email
        )
      }),
    [expenses]
  )

  return (
    <CardBox key={group.id}>
      <Pressable
        style={{ padding: 16 }}
        onPress={handlePress ? () => handlePress(group) : undefined}
      >
        <VStack space={1}>
          <Text color="white" fontSize="2xl">
            {group.title}
          </Text>
          <HStack
            justifyContent="space-between"
            alignItems="flex-end"
            space={4}
          >
            {isLoading ? (
              <Skeleton
                rounded="md"
                h={4}
                w={'3/5'}
                startColor="#fff"
                endColor="#999"
                opacity={0.4}
              />
            ) : expenses.length > 0 ? (
              unpaidExpenses.length > 0 ? (
                <Text color="red.500" flex={1}>
                  {!isLoading && unpaidExpenses.length} despesa
                  {unpaidExpenses.length > 1 && 's'} não paga
                  {unpaidExpenses.length > 1 && 's'}
                </Text>
              ) : (
                <Text color="green.400" flex={1}>
                  Sua parte está em dia :)
                </Text>
              )
            ) : (
              <Text color="gray.500" flex={1}>
                Nenhuma despesa criada
              </Text>
            )}
            <AvatarGroup
              size="sm"
              members={group.Member.map(({ member }) => member)}
            />
          </HStack>
        </VStack>
      </Pressable>
    </CardBox>
  )
}

export function CardSkeleton() {
  return (
    <CardBox>
      <Pressable style={{ padding: 16 }} disabled>
        <VStack space={1}>
          <Skeleton
            rounded="md"
            h={6}
            w={48}
            startColor="#fff"
            endColor="#999"
            opacity={0.4}
            my={1}
          />
          <HStack
            justifyContent="space-between"
            alignItems="flex-end"
            space={4}
          >
            <Skeleton
              rounded="md"
              h={4}
              w={'3/5'}
              startColor="#fff"
              endColor="#999"
              opacity={0.4}
            />
            <Skeleton
              rounded="full"
              size={8}
              startColor="#fff"
              endColor="#999"
              opacity={0.4}
              my={1}
            />
          </HStack>
        </VStack>
      </Pressable>
    </CardBox>
  )
}
