import React, { useCallback, useState, useEffect, useMemo } from 'react'
import { HStack, ScrollView, Skeleton, Text, VStack } from 'native-base'
import {
  useFocusEffect,
  useNavigation,
  useRoute
} from '@react-navigation/native'
import { api } from '../lib/axios'
import { Alert, RefreshControl, TouchableOpacity } from 'react-native'
import AppBar from '../components/AppBar'
import { IconButton } from '@react-native-material/core'
import Icon from '@expo/vector-icons/MaterialCommunityIcons'
import PlusFab from '../components/PlusFab'
import { GroupProps } from './Groups'
import DateController, {
  MonthlyProps,
  present
} from '../components/DateController'
import { CardExpense, CardSkeleton } from '../components/CardExpense'
import MarkAsPaid from '../components/MarkAsPaid'
import { useAuth } from '../hooks/useAuth'
import EmptyMessage from '../components/EmptyMessage'
import MarkAsPaidFab from '../components/MarkAsPaidFab'
import ExpenseDashboard from '../components/ExpenseDashboard'
import DeleteExpense from '../components/DeleteExpense'
import DuplicateExpense from '../components/DuplicateExpense'
import { getExpenseForm } from '../helpers/expenseHelper'
import EditGroupTitle from '../components/EditGroupTitle'
import { MemberProps } from '../components/MembersList'

export interface GroupRoute {
  group?: GroupProps
  groupId?: string
}

export interface ExpenseProps {
  id: string
  title: string
  group_id: string
  cost: number
  dueDate: string
  createdAt: string
  updatedAt: string
  Paying: PayingProps[]
}

export interface PayingProps {
  user_id: string
  cost: number
  paid: boolean
  paidAt?: string | null
  createdAt: string
  updatedAt: string
  paying: MemberProps
}

export default function Expenses() {
  const { user } = useAuth()
  const { navigate } = useNavigation()
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const route = useRoute()
  const { group: groupParam, groupId } = route.params as GroupRoute
  const [group, setGroup] = useState<GroupProps | undefined>(groupParam)
  const [expenses, setExpenses] = useState<ExpenseProps[]>([])
  const [selecteds, setSelecteds] = useState<string[]>([])
  const [payers, setPayers] = useState<MemberProps[]>([])
  const [expensesDate, setExpensesDate] = useState<MonthlyProps>(present)
  const [openMarkAsPaid, setOpenMarkAsPaid] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openDuplicate, setOpenDuplicate] = useState(false)
  const [editGroupTitle, setEditGroupTitle] = useState(false)
  const me = useMemo(
    () => group?.Member.find(groupMember => groupMember.member.id === user.id),
    [group]
  )

  const getExpenses = async (loading = true) => {
    try {
      setIsLoading(loading)
      const query = `month=${expensesDate.month + 1}&year=${expensesDate.year}`
      const response = await api.get(
        `/groups/${group?.id || groupId}/expenses?${query}`
      )
      setExpenses(response.data.expenses || [])
    } catch (error) {
      Alert.alert(
        'Ops!',
        'Não foi possível buscar as despesas do grupo ' + group?.title || ''
      )
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function getGroup() {
    try {
      const response = await api.get(`/groups/${groupId || group?.id}`)
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

  useFocusEffect(
    useCallback(() => {
      if (groupId) getGroup()
    }, [groupId])
  )

  const handleRefresh = () => {
    setRefreshing(true)
    getExpenses()
    setRefreshing(false)
  }

  useFocusEffect(
    useCallback(() => {
      if (!groupId) getGroup()
      setExpenses([])
      setSelecteds([])
      setPayers([])
      getExpenses()
    }, [expensesDate])
  )

  const handleSelecteds = (expense: ExpenseProps) => {
    setSelecteds(prevState => {
      return prevState.includes(expense.id)
        ? prevState.filter(id => id !== expense.id)
        : [...prevState, expense.id]
    })
  }

  const expensesNavigation = (expense: ExpenseProps) => {
    navigate('Expense', {
      expense,
      group
    })
  }

  const editExpense = () => {
    const expense = expenses.find(({ id }) => id === selecteds[0])
    if (expense && group) {
      navigate('ExpenseName', {
        ...expense,
        cost: Number(expense.cost),
        group_id: group.id,
        group_title: group.title,
        payers: expense.Paying.map(({ cost, paying: { email } }) => {
          return {
            cost: Number(cost),
            email
          }
        })
      })
    }
  }

  const getPayers = () => {
    const expensePayers: MemberProps[] = []
    selecteds.map(selected => {
      const selectedExpense = expenses.find(({ id }) => id === selected)
      if (selectedExpense) {
        selectedExpense.Paying.map(({ paying }) => {
          if (!expensePayers.find(({ email }) => email === paying.email)) {
            expensePayers.push(paying)
          }
        })
      }
    })
    setPayers([...expensePayers])
  }

  useEffect(() => {
    getPayers()
  }, [selecteds])

  return (
    <>
      {editGroupTitle && group ? (
        <EditGroupTitle
          group={group}
          setGroup={setGroup}
          onClose={() => setEditGroupTitle(false)}
        />
      ) : (
        <AppBar
          title={
            !me?.isAdmin && selecteds.length === 0 ? (
              group ? (
                group.title
              ) : (
                <Skeleton
                  rounded="md"
                  h={5}
                  w={48}
                  startColor="#fff"
                  endColor="#999"
                  opacity={0.4}
                />
              )
            ) : undefined
          }
          center={
            selecteds.length > 0 ? (
              ''
            ) : !me?.isAdmin ? undefined : (
              <TouchableOpacity
                onPress={() => setEditGroupTitle(true)}
                style={{ width: '50%' }}
              >
                <HStack textAlign="center" justifyContent="center">
                  <Text fontSize="lg" color="white">
                    {group ? (
                      group.title
                    ) : (
                      <Skeleton
                        rounded="md"
                        h={5}
                        w={48}
                        startColor="#fff"
                        endColor="#999"
                        opacity={0.4}
                      />
                    )}
                  </Text>
                </HStack>
              </TouchableOpacity>
            )
          }
          onPress={() =>
            selecteds.length > 0 ? setSelecteds([]) : navigate('Groups')
          }
          left="back"
          right={
            selecteds.length > 0 ? (
              <HStack space={1}>
                {selecteds.length === 1 && (
                  <IconButton
                    onPress={editExpense}
                    icon={({ size }) => (
                      <Icon name="pencil" color="white" size={size} />
                    )}
                  />
                )}
                <IconButton
                  onPress={() => setOpenDelete(true)}
                  icon={({ size }) => (
                    <Icon name="delete" color="white" size={size} />
                  )}
                />
                <IconButton
                  onPress={() => setOpenDuplicate(true)}
                  icon={({ size }) => (
                    <Icon name="content-copy" color="white" size={size} />
                  )}
                />
              </HStack>
            ) : (
              group && (
                <IconButton
                  onPress={() => navigate('Group', group)}
                  icon={({ size }) => (
                    <Icon name="cog" color="white" size={size} />
                  )}
                />
              )
            )
          }
          bottom={
            <ExpenseDashboard
              expenses={
                selecteds.length === 0
                  ? expenses
                  : expenses.filter(expense => selecteds.includes(expense.id))
              }
            />
          }
        />
      )}
      <DateController date={expensesDate} onChange={setExpensesDate} />
      <ScrollView
        h="full"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <VStack px={4} pb={20} pt={3} space={5}>
          <VStack space={3}>
            {!isLoading ? (
              expenses.length > 0 ? (
                expenses.map(expense => (
                  <CardExpense
                    key={expense.id}
                    expense={expense}
                    handlePress={
                      selecteds.length > 0
                        ? handleSelecteds
                        : expensesNavigation
                    }
                    handleLongPress={handleSelecteds}
                    selected={selecteds.includes(expense.id)}
                  />
                ))
              ) : (
                <EmptyMessage message="Ops! Ainda não foi criada nenhuma despesa nesse mês..." />
              )
            ) : (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            )}
          </VStack>
        </VStack>
      </ScrollView>
      {group && (
        <DuplicateExpense
          expenses={selecteds.map(selectedId => {
            const expense = expenses.find(({ id }) => id === selectedId)
            return getExpenseForm(expense!, group)
          })}
          isOpen={openDuplicate}
          onClose={() => {
            setOpenDuplicate(false)
            setSelecteds([])
          }}
        />
      )}
      <DeleteExpense
        expenses={selecteds}
        isOpen={openDelete}
        onClose={() => {
          setOpenDelete(false)
          getExpenses(false)
          setSelecteds([])
        }}
      />
      {openMarkAsPaid ? (
        <MarkAsPaid
          isAdmin={me?.isAdmin || false}
          member={
            payers.find(({ email }) => email === user.email) ? user : payers[0]
          }
          members={payers}
          isOpen={true}
          onClose={payment => {
            setOpenMarkAsPaid(false)
            if (payment) {
              setExpenses(prevState => {
                prevState.map((expense, expenseIndex) => {
                  if (selecteds.includes(expense.id)) {
                    const payerIndex = expense.Paying.findIndex(
                      ({ paying }) => paying.email === payment.paying.email
                    )
                    if (payerIndex > -1) {
                      prevState[expenseIndex].Paying[payerIndex].paid =
                        payment.paid
                      prevState[expenseIndex].Paying[payerIndex].paidAt =
                        payment.paidAt
                    }
                  }
                })

                return [...prevState]
              })
              setTimeout(() => getExpenses(false), 2000)
            }
            setSelecteds([])
          }}
          expenses={selecteds.map(selectedId => {
            return expenses.find(({ id }) => id === selectedId)!
          })}
        />
      ) : selecteds.length > 0 ? (
        <MarkAsPaidFab onPress={() => setOpenMarkAsPaid(true)} />
      ) : (
        group && (
          <PlusFab
            onPress={() =>
              navigate('ExpenseName', {
                group_id: group.id,
                group_title: group.title,
                cost: 0,
                dueDate: '',
                title: '',
                payers: []
              })
            }
          />
        )
      )}
    </>
  )
}
