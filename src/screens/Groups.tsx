import React, { useCallback, useState } from 'react'
import { Image, ScrollView, Text, VStack } from 'native-base'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { api } from '../lib/axios'
import { Alert, RefreshControl } from 'react-native'
import * as Item from '../components/CardGroup'
import AppBar from '../components/AppBar'
import PlusFab from '../components/PlusFab'
import EmptyMessage from '../components/EmptyMessage'
import { useAuth } from '../hooks/useAuth'
import ConfirmEmail from './ConfirmEmail'
import { MemberProps } from '../components/MembersList'
import { usePushNotification } from '../hooks/usePushNotification'
import OverLoader from '../components/OverLoader'

export type GroupMemberType = {
  createdAt: string
  isAdmin?: boolean | null
  member: MemberProps
}

export interface GroupProps {
  id: string
  title: string
  user_id: string
  Member: GroupMemberType[]
}

export default function Groups() {
  const { data } = usePushNotification()
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const [groups, setGroups] = useState<GroupProps[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isOverLoading, setIsOverLoading] = useState(true)

  async function getGroups() {
    try {
      setIsLoading(true)
      const response = await api.get('/groups')
      setGroups(response.data.groups || [])
    } catch (error) {
      console.error(error)
      Alert.alert(
        'Ops!',
        'Não foi possível buscar os seus grupos, verifique a sua conexão com a internet e tente novamente mais tarde.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    getGroups()
    setRefreshing(false)
  }

  useFocusEffect(
    useCallback(() => {
      setGroups([])
      getGroups()
    }, [])
  )

  useFocusEffect(
    useCallback(() => {
      if (!user.email) navigate('Home')
    }, [user])
  )

  useFocusEffect(
    useCallback(() => {
      setIsOverLoading(false)
      if (data?.groupId) setIsOverLoading(true)
    }, [data])
  )

  return !user.confirmedEmail ? (
    <ConfirmEmail />
  ) : (
    <>
      <AppBar title="Meus grupos" left="menu" />
      <ScrollView
        h="full"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <OverLoader isLoading={isOverLoading} />
        <VStack px={4} py={8} pb={20}>
          <VStack space={3}>
            {!isLoading ? (
              groups.length > 0 ? (
                groups.map(group => (
                  <Item.CardGroup
                    key={group.id}
                    group={group}
                    handlePress={item => navigate('Expenses', item)}
                  />
                ))
              ) : (
                <VStack
                  justifyContent="center"
                  alignItems="center"
                  textAlign="center"
                  space={6}
                >
                  <Text color="white" textAlign="center" fontSize="3xl">
                    Bem vindo ao
                  </Text>
                  <Image
                    source={require('../assets/logo.png')}
                    alt="Expendia Logo"
                    width="3/4"
                    height={50}
                  />
                  <EmptyMessage message="Crie um novo grupo ou peça para adicionarem seu e-mail em um grupo existente." />
                </VStack>
              )
            ) : (
              <>
                <Item.CardSkeleton />
                <Item.CardSkeleton />
                <Item.CardSkeleton />
              </>
            )}
          </VStack>
        </VStack>
      </ScrollView>
      <PlusFab onPress={() => navigate('GroupName')} />
    </>
  )
}
