import React, { useState, useEffect } from 'react'
import { Box, HStack, Skeleton, Text, VStack } from 'native-base'
import { AvatarGroup } from './MemberAvatar'
import { GroupProps } from '../screens/Group'
import { api } from '../lib/axios'
import { Alert } from 'react-native'
import { UserProps } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth'
import { Pressable } from '@react-native-material/core'
import { InterfaceBoxProps } from 'native-base/lib/typescript/components/primitives/Box'

interface CardGroupProps {
  group: GroupProps
  handlePress?: (group: GroupProps) => void
}

export interface ExpenseProps {
  title: string
  group_id: string
  cost: string
  dueDate: string
  createdAt: string
  updatedAt: string
  Paying: PayingProps[]
}

export interface PayingProps {
  user_id: string
  cost: string
  paid: boolean
  paidAt?: string
  createdAt: string
  updatedAt: string
  paying: UserProps
}

export function CardBox({ children, ...rest }: InterfaceBoxProps) {
  return (
    <Box bg="dark.200" rounded="xl" width="full" {...rest}>
      {children}
    </Box>
  )
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
      const date = new Date()
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      const query = `month=${month}&year=${year}`
      const response = await api.get(`/groups/${group.id}/expenses?${query}`)
      const monthlyExpenses: ExpenseProps[] = response.data.expenses || []
      const myExpenses = monthlyExpenses.filter(({ Paying }) => {
        return Paying.find(
          member => member.paid === false && member.paying.email === user.email
        )
      })
      setExpenses(myExpenses)
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

  return (
    <CardBox key={group.id}>
      <Pressable
        style={{
          padding: 16
        }}
        onPress={handlePress ? () => handlePress(group) : undefined}
      >
        <Text color="white" fontSize="2xl">
          {group.title}
        </Text>
        <HStack justifyContent="space-between" alignItems="center">
          <HStack alignItems="center">
            {isLoading ? (
              <Skeleton h={4} w={'3/5'} />
            ) : expenses.length > 0 ? (
              <Text color="red.500">
                {!isLoading && expenses.length} despesa
                {expenses.length > 1 && 's'} não paga
                {expenses.length > 1 && 's'}
              </Text>
            ) : (
              <Text color="green.400">Sua parte está em dia! :)</Text>
            )}
          </HStack>
          <AvatarGroup members={group.Member.map(({ member }) => member)} />
        </HStack>
      </Pressable>
    </CardBox>
  )
}

export function CardSkeleton({}) {
  return (
    <CardBox p={4}>
      <VStack space={4}>
        <Skeleton h={4} w={'2/5'} />
        <HStack justifyContent="space-between" alignItems="center">
          <Skeleton h={4} w={'3/5'} />
          <HStack alignItems="center" space={1}>
            <Skeleton rounded="full" h={10} w={10} />
            <Skeleton rounded="full" h={10} w={10} />
            <Skeleton rounded="full" h={10} w={10} />
          </HStack>
        </HStack>
      </VStack>
    </CardBox>
  )
}
