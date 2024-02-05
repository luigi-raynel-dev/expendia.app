import { Alert, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import {
  Badge,
  Box,
  HStack,
  ScrollView,
  Text,
  VStack,
  useToast
} from 'native-base'
import {
  useFocusEffect,
  useNavigation,
  useRoute
} from '@react-navigation/native'
import AppBar from '../components/AppBar'
import { IconButton } from '@react-native-material/core'
import Icon from '@expo/vector-icons/MaterialCommunityIcons'
import { GroupProps } from './Groups'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/axios'
import MembersList, { MemberProps } from '../components/MembersList'
import PlusFab from '../components/PlusFab'
import { SignOut, Trash, UserCircleGear, UserGear } from 'phosphor-react-native'
import UserLabels from '../components/UserLabels'
import MenuActionSheet from '../components/MenuActionSheet'
import DeleteMember from '../components/DeleteMember'
import DeleteGroup from '../components/DeleteGroup'
import EditGroupTitle from '../components/EditGroupTitle'
import OverLoader from '../components/OverLoader'

export default function Group() {
  const { user } = useAuth()
  const { navigate } = useNavigation()
  const toast = useToast()
  const [refreshing, setRefreshing] = useState(false)
  const route = useRoute()
  const { id } = route.params as GroupProps
  const [group, setGroup] = useState<GroupProps>(route.params as GroupProps)
  const [openGroupMenu, setOpenGroupMenu] = useState(false)
  const [openDeleteGroup, setOpenDeleteGroup] = useState(false)
  const [openDeleteMember, setOpenDeleteMember] = useState(false)
  const [selectedMember, setSelectedMember] = useState<MemberProps | undefined>(
    undefined
  )
  const [editGroupTitle, setEditGroupTitle] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const me = useMemo(
    () => group.Member.find(groupMember => groupMember.member.id === user.id),
    [group]
  )

  async function getGroup() {
    try {
      const response = await api.get(`/groups/${id}`)
      if (response.data.group) setGroup(response.data.group)
      else
        Alert.alert(
          'Ops!',
          'Não foi possível obter as informações deste grupo. Tente novamente mais tarde!'
        )
    } catch (error) {
      Alert.alert(
        'Ops!',
        'Não foi possível obter as informações deste grupo. Tente novamente mais tarde!'
      )
    }
  }

  async function toggleAdmin() {
    try {
      setSubmitting(true)
      const selectedId = selectedMember?.id
      setSelectedMember(undefined)
      const response = await api.patch(
        `/groups/${id}/members/${selectedId}/admin`,
        {
          member_id: null
        }
      )
      if (response.data.status) {
        setGroup(prevState => {
          const index = prevState.Member.findIndex(
            ({ member }) => selectedId === member.id
          )

          prevState.Member[index].isAdmin = !Boolean(
            prevState.Member[index].isAdmin
          )

          return { ...prevState }
        })

        toast.show({ title: 'Função alterada com sucesso!' })
      } else
        Alert.alert(
          'Ops! 1',
          'Não foi possível alterar a função deste membro. Tente novamente mais tarde!'
        )
    } catch (error) {
      console.error(error)
      Alert.alert(
        'Ops! 2',
        'Não foi possível alterar a função deste membro. Tente novamente mais tarde!'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    getGroup()
    setRefreshing(false)
  }

  useFocusEffect(
    useCallback(() => {
      getGroup()
    }, [id])
  )

  return (
    <>
      {editGroupTitle ? (
        <EditGroupTitle
          group={group}
          setGroup={setGroup}
          onClose={() => setEditGroupTitle(false)}
        />
      ) : (
        <AppBar
          title={!me?.isAdmin ? group.title : undefined}
          center={
            !me?.isAdmin ? undefined : (
              <TouchableOpacity
                onPress={() => setEditGroupTitle(true)}
                style={{ width: '50%' }}
              >
                <HStack textAlign="center" justifyContent="center">
                  <Text fontSize="lg" color="white">
                    {group.title}
                  </Text>
                </HStack>
              </TouchableOpacity>
            )
          }
          left="back"
          right={
            <IconButton
              onPress={() => setOpenGroupMenu(true)}
              icon={({ size }) => (
                <Icon name="dots-vertical" color="white" size={size} />
              )}
            />
          }
        />
      )}
      <OverLoader isLoading={isSubmitting} />
      <ScrollView
        h="full"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <VStack space={4} px={4} py={8}>
          <HStack space={2} alignItems="center">
            <Text color="white" fontSize="xl">
              Membros:
            </Text>
            <Badge rounded="2xl">{group.Member.length}</Badge>
          </HStack>
          <MembersList
            onPress={
              me?.isAdmin && group.Member.length > 1
                ? setSelectedMember
                : undefined
            }
            members={group.Member.map(({ member, isAdmin }) => {
              return {
                ...member,
                bottomComponent: (
                  <Box mt={2}>
                    <UserLabels
                      isCreator={member.id === group.user_id}
                      isAdmin={isAdmin || false}
                    />
                  </Box>
                )
              }
            })}
          />
        </VStack>
      </ScrollView>
      {me?.isAdmin && (
        <PlusFab
          icon={<UserGear color="white" size={24} />}
          onPress={() =>
            navigate('GroupMembers', {
              ...group,
              members: group.Member.filter(
                ({ member }) => member.email !== user.email
              ).map(({ member }) => member.email)
            })
          }
        />
      )}
      {selectedMember && (
        <DeleteMember
          isOpen={openDeleteMember}
          onClose={() => {
            getGroup()
            setOpenDeleteMember(false)
            setSelectedMember(undefined)
            if (selectedMember.email === user.email) {
              navigate('Groups')
            }
          }}
          group={group}
          member={selectedMember}
        />
      )}
      <DeleteGroup
        isOpen={openDeleteGroup}
        onClose={() => {
          setOpenDeleteGroup(false)
          setOpenGroupMenu(false)
          navigate('Groups')
        }}
        group={group}
      />
      <MenuActionSheet
        isOpen={selectedMember !== undefined && !openGroupMenu}
        onClose={() => setSelectedMember(undefined)}
        items={[
          {
            label: group.Member.find(
              ({ member }) => selectedMember?.email === member.email
            )?.isAdmin
              ? 'Remover função de admin'
              : 'Promover para admin',
            icon: <UserCircleGear color="white" />,
            onPress: toggleAdmin
          },
          {
            label:
              selectedMember?.email === user.email
                ? 'Sair do grupo'
                : 'Remover do grupo',
            icon: <SignOut color="white" />,
            onPress: () => setOpenDeleteMember(true)
          }
        ]}
      />
      <MenuActionSheet
        isOpen={openGroupMenu}
        onClose={() => setOpenGroupMenu(false)}
        items={useMemo(() => {
          const actions = [
            {
              label: 'Sair do grupo',
              icon: <SignOut color="white" />,
              onPress: () => {
                setSelectedMember(user)
                setOpenDeleteMember(true)
              }
            }
          ]

          if (me?.isAdmin)
            actions.push({
              label: 'Excluir grupo',
              icon: <Trash color="white" />,
              onPress: () => setOpenDeleteGroup(true)
            })

          return [...actions]
        }, [me, group])}
      />
    </>
  )
}
