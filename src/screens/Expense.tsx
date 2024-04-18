import React, { useState, useEffect, useMemo } from 'react'
import { Badge, HStack, ScrollView, Skeleton, Text, VStack } from 'native-base'
import { useNavigation, useRoute } from '@react-navigation/native'
import { api } from '../lib/axios'
import { Alert, RefreshControl, TouchableOpacity } from 'react-native'
import AppBar from '../components/AppBar'
import { IconButton } from '@react-native-material/core'
import Icon from '@expo/vector-icons/MaterialCommunityIcons'
import { GroupMemberType, GroupProps } from './Groups'
import MarkAsPaid from '../components/MarkAsPaid'
import { useAuth } from '../hooks/useAuth'
import { ExpenseProps, PayingProps } from './Expenses'
import MenuActionSheet, { MenuItems } from '../components/MenuActionSheet'
import TotalValue from '../components/TotalValue'
import dayjs from 'dayjs'
import MembersList, { MemberProps } from '../components/MembersList'
import { convertFloatToMoney, getExpenseForm } from '../helpers/expenseHelper'
import ExpenseStatusMessage, {
  ExpenseStatusMessageSetup
} from '../components/ExpenseStatusMessage'
import PayerSplitProgress from '../components/PayerSplitProgress'
import MarkAsPaidFab from '../components/MarkAsPaidFab'
import DeleteExpense from '../components/DeleteExpense'
import DuplicateExpense from '../components/DuplicateExpense'
import EditExpenseTitle from '../components/EditExpenseTitle'
import { getPercentage } from '../helpers/moneyHelper'
import OverLoader from '../components/OverLoader'
import { ExpenseForm } from './ExpenseName'

export interface ExpenseDetails {
  group?: GroupProps
  expense?: ExpenseProps
  expenseId?: string
}

interface ExpenseStatusMessageSetupPayer extends ExpenseStatusMessageSetup {
  email: string
}

export default function Expense() {
  const { user } = useAuth()
  const { navigate, goBack, canGoBack } = useNavigation()
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const route = useRoute()
  const {
    group: groupParam,
    expense: expenseParam,
    expenseId
  } = route.params as ExpenseDetails
  const [group, setGroup] = useState<GroupProps>()
  const [expense, setExpense] = useState<ExpenseProps>()
  const [openMenu, setOpenMenu] = useState(false)
  const [openMarkAsPaid, setOpenMarkAsPaid] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>()
  const [statusMessages, setStatusMessages] = useState<
    ExpenseStatusMessageSetupPayer[]
  >([])
  const [openDuplicate, setOpenDuplicate] = useState(false)
  const [selectedMember, setSelectedMember] = useState<MemberProps>()
  const [userPayer, setUserPayer] = useState<PayingProps>()
  const [editExpenseTitle, setEditExpenseTitle] = useState(false)
  const [me, setMe] = useState<GroupMemberType>()
  const [unmark, setUnmark] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItems[]>([])

  const getExpense = async (loading = true) => {
    try {
      setIsLoading(loading)
      const response = await api.get(`/expenses/${expense?.id || expenseId}`)
      setExpense(response.data.expense)
    } catch (error) {
      Alert.alert(
        'Ops!',
        'Não foi possível buscar os dados atualizados da despesa.'
      )
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function getGroup(id: string) {
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

  const handleRefresh = () => {
    setRefreshing(true)
    getExpense()
    setRefreshing(false)
  }

  useEffect(() => {
    if (expenseParam) {
      setExpense(expenseParam)
      setIsLoading(false)
    }
  }, [expenseParam])

  useEffect(() => {
    if (groupParam) setGroup(groupParam)
  }, [groupParam])

  useEffect(() => {
    if (expenseId && !expense) getExpense(true)
  }, [expenseId])

  useEffect(() => {
    if (expense) {
      if (!group) getGroup(expense.group_id)
      else {
        setExpenseForm(getExpenseForm(expense, group))
        setMe(
          group.Member.find(groupMember => groupMember.member.id === user.id)
        )
      }
      setSelectedMember(
        expense.Paying.find(({ paying }) => paying.id === user.id)
          ? user
          : expense.Paying[0].paying
      )
      setUserPayer(expense.Paying.find(({ paying }) => paying.id === user.id))
    }
  }, [expense, group])

  useEffect(() => {
    if (userPayer) {
      setMenuItems(() => {
        return userPayer.paid
          ? [
              {
                icon: <Icon color="white" name="backspace-outline" size={20} />,
                label: 'Desmarcar pagamento',
                onPress: () => {
                  setSelectedMember(user)
                  setUnmark(true)
                  setOpenMarkAsPaid(true)
                }
              }
            ]
          : [
              {
                icon: (
                  <Icon color="white" name="check-circle-outline" size={20} />
                ),
                label: 'Marcar como pago',
                onPress: () => {
                  setSelectedMember(user)
                  setUnmark(false)
                  setOpenMarkAsPaid(true)
                }
              }
            ]
      })
    }
  }, [userPayer])

  const editExpense = () => {
    if (expense && expenseForm) navigate('ExpenseName', expenseForm)
  }

  const handleStatusMessages = (
    statusMessage: ExpenseStatusMessageSetup,
    email: string
  ) => {
    const newStatus = { ...statusMessage, email }
    setStatusMessages(prevState => {
      const index = prevState.findIndex(status => status.email === email)

      if (index > -1) {
        prevState[index] = newStatus
        return [...prevState]
      } else {
        return [...prevState, newStatus]
      }
    })
  }

  return (
    <>
      {editExpenseTitle && group && expense ? (
        <EditExpenseTitle
          group={group}
          expense={expense}
          setExpense={setExpense}
          onClose={() => setEditExpenseTitle(false)}
        />
      ) : (
        <AppBar
          center={
            <TouchableOpacity
              onPress={
                isLoading || !expense
                  ? undefined
                  : () => setEditExpenseTitle(true)
              }
              disabled={isLoading || !expense}
              style={{ width: '50%' }}
            >
              <HStack textAlign="center" justifyContent="center">
                <Text fontSize="lg" color="white">
                  {isLoading || !expense ? (
                    <Skeleton
                      rounded="md"
                      h={5}
                      w={48}
                      startColor="#fff"
                      endColor="#999"
                      opacity={0.4}
                    />
                  ) : (
                    expense.title
                  )}
                </Text>
              </HStack>
            </TouchableOpacity>
          }
          left="back"
          right={
            <IconButton
              onPress={() => setOpenMenu(true)}
              icon={({ size }) => (
                <Icon name="dots-vertical" color="white" size={size} />
              )}
            />
          }
          onPress={() =>
            canGoBack()
              ? goBack()
              : navigate('Expenses', {
                  group: group
                })
          }
        />
      )}
      {isLoading || !expense || !expenseForm || !group || !selectedMember ? (
        <OverLoader isLoading />
      ) : (
        <>
          <ScrollView
            h="full"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            <VStack px={4} py={4} my={8} space={8}>
              <TotalValue expense={expenseForm} />
              <HStack space={1} justifyContent="center" alignItems="center">
                <Text color="gray.200" fontSize="lg">
                  Vencimento:
                </Text>
                <Text color="white" fontSize="lg">
                  {dayjs(expense.dueDate).format('DD/MM/YYYY')}
                </Text>
              </HStack>
              <VStack space={5} pb={20}>
                <PayerSplitProgress expense={expenseForm} checkIsPaid />
                <HStack space={2} alignItems="center">
                  <Text color="white" fontSize="xl">
                    Pagantes:
                  </Text>
                  <Badge rounded="2xl">{expense.Paying.length}</Badge>
                </HStack>
                <MembersList
                  onPress={member => {
                    if (me?.isAdmin || member.id === user.id) {
                      setSelectedMember(member)
                      setOpenMarkAsPaid(true)
                    }
                  }}
                  members={expense.Paying.map(
                    ({ cost, paying, paid, paidAt }) => {
                      return {
                        ...paying,
                        hideSubtitle: true,
                        bottomComponent: (
                          <VStack space={0.5}>
                            <Text color="white">
                              {convertFloatToMoney(Number(cost))} ={' '}
                              {getPercentage(cost, expense.cost)}%
                            </Text>
                            <HStack my={1} space={1}>
                              <ExpenseStatusMessage
                                payer={paying}
                                expense={expense}
                                getStatusMessage={statusMessage =>
                                  handleStatusMessages(
                                    statusMessage,
                                    paying.email
                                  )
                                }
                              />
                              {paid && paidAt && (
                                <Text color="white">
                                  em {dayjs(paidAt).format('DD/MM/YYYY')}
                                </Text>
                              )}
                            </HStack>
                          </VStack>
                        ),
                        slots: {
                          cardBox: {
                            borderLeftColor:
                              statusMessages.find(
                                status => status.email === paying.email
                              )?.color || undefined,
                            borderLeftWidth: 4
                          },
                          content: {
                            space: 1
                          }
                        }
                      }
                    }
                  )}
                />
              </VStack>
            </VStack>
          </ScrollView>
          {userPayer && !userPayer.paid && (
            <MarkAsPaidFab
              onPress={() => {
                setUnmark(false)
                setOpenMarkAsPaid(true)
              }}
            />
          )}
          <DeleteExpense
            expenses={[expense.id]}
            isOpen={openDelete}
            onClose={() => {
              setOpenDelete(false)
              goBack()
            }}
          />
          <MarkAsPaid
            member={selectedMember}
            members={expense.Paying.map(({ paying }) => paying)}
            isAdmin={me?.isAdmin || undefined}
            isOpen={openMarkAsPaid}
            onClose={payment => {
              setOpenMarkAsPaid(false)
              if (payment) {
                setExpense(prevState => {
                  if (!prevState) return undefined
                  const payerIndex = prevState.Paying.findIndex(
                    ({ paying }) => paying.email === payment.paying.email
                  )
                  const paying = prevState.Paying[payerIndex]
                  prevState.Paying[payerIndex] = {
                    ...paying,
                    ...payment
                  }
                  return { ...prevState }
                })
                setTimeout(() => getExpense(false), 2000)
              }
            }}
            expenses={[expense]}
            unmark={unmark}
          />
          <DuplicateExpense
            expenses={expenseForm ? [expenseForm] : []}
            isOpen={openDuplicate}
            onClose={() => setOpenDuplicate(false)}
          />
          <MenuActionSheet
            isOpen={openMenu}
            onClose={() => setOpenMenu(false)}
            items={[
              ...menuItems,
              {
                icon: <Icon color="white" name="pencil" size={20} />,
                label: 'Editar',
                onPress: editExpense
              },
              {
                icon: <Icon color="white" name="delete" size={20} />,
                label: 'Excluir',
                onPress: () => setOpenDelete(true)
              },
              {
                icon: <Icon color="white" name="content-copy" size={20} />,
                label: 'Duplicar',
                onPress: () => {
                  setOpenMenu(false)
                  setOpenDuplicate(true)
                }
              }
            ]}
          />
        </>
      )}
    </>
  )
}
