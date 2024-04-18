import {
  Actionsheet,
  VStack,
  Center,
  Text,
  Alert as AlertBox,
  useToast,
  HStack,
  IconButton,
  CloseIcon,
  Switch
} from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert, TouchableOpacity } from 'react-native'
import DateField from './DateField'
import SubmitButton from './SubmitButton'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { api } from '../lib/axios'
import dayjs from 'dayjs'
import { MemberSelect } from './MemberSelect'
import { Pressable } from '@react-native-material/core'
import { ArrowsLeftRight } from 'phosphor-react-native'
import { ExpenseProps } from '../screens/Expenses'
import { MemberProps } from './MembersList'
import { useAuth } from '../hooks/useAuth'

export type PaymentType = {
  paid: boolean
  paidAt?: string | null
  paying: MemberProps
}

interface Props {
  isOpen?: boolean
  onClose?: (payment?: PaymentType) => void
  expenses: ExpenseProps[]
  isAdmin?: boolean
  member: MemberProps
  members: MemberProps[]
  unmark?: boolean
}

export interface MarkAsPaidForm {
  paid: boolean
  paidAt: string
  email: string
}

export default function MarkAsPaid({
  isOpen,
  onClose,
  expenses,
  member,
  members,
  unmark,
  isAdmin
}: Props) {
  const toast = useToast()
  const [isUnmark, setIsUnmark] = useState<boolean | undefined>(unmark)
  const { user } = useAuth()

  async function submit(
    values: MarkAsPaidForm,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    try {
      const payload = {
        ...values,
        paid: !isUnmark,
        paidAt:
          values.paidAt && !isUnmark ? dayjs(values.paidAt).format() : null
      }
      setSubmitting(true)
      const promises = expenses.map(expense => {
        if (
          expense.Paying.find(({ paying }) => paying.email === values.email)
        ) {
          api.patch(`/expenses/${expense.id}`, payload)
        }
      })
      Promise.all(promises)
        .then(() => {
          toast.show({
            title: isUnmark ? 'Pagamento desmarcado!' : 'Pago com sucesso!'
          })
          const paying = members.find(({ email }) => email === values.email)!
          if (onClose)
            onClose({
              ...payload,
              paying
            })
        })
        .catch(error => {
          Alert.alert('Ops!', 'Algo deu errado. Tente novamente mais tarde!')
          console.error('Error:', error.message)
          if (onClose) onClose()
        })
    } catch (error) {
      Alert.alert('Ops!', 'Algo deu errado. Tente novamente mais tarde!')
      if (onClose) onClose()
      console.error(error)
    }
  }

  useEffect(() => {
    setIsUnmark(unmark)
  }, [unmark])

  return (
    <Formik
      enableReinitialize
      initialValues={
        {
          paid: !unmark,
          paidAt: unmark ? undefined : dayjs().format(),
          email: member.email
        } as MarkAsPaidForm
      }
      validationSchema={Yup.object({
        paid: Yup.boolean().required(),
        paidAt: Yup.string().required(),
        email: Yup.string().required()
      })}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(true)
        submit(values, setSubmitting)
      }}
    >
      {({
        handleChange,
        setFieldValue,
        handleSubmit,
        values,
        isSubmitting
      }) => (
        <Center>
          <Actionsheet isOpen={isOpen} onClose={onClose} hideDragIndicator>
            <Actionsheet.Content bgColor="gray.900">
              {!isAdmin && member.id !== user.id ? (
                <VStack space={6} w="full" p={4} alignItems="center">
                  <Text color="white" fontSize="xl">
                    Ops!
                  </Text>
                  <AlertBox w="100%" status="error">
                    <VStack space={2} flexShrink={1} w="100%">
                      <HStack
                        flexShrink={1}
                        space={2}
                        justifyContent="space-between"
                      >
                        <HStack space={2} flexShrink={1}>
                          <AlertBox.Icon mt="1" />
                          <Text fontSize="md" color="coolGray.800">
                            Você não pode pagar por despesas da qual não faz
                            parte.
                          </Text>
                        </HStack>
                        <IconButton
                          variant="unstyled"
                          _focus={{
                            borderWidth: 0
                          }}
                          icon={<CloseIcon size="3" />}
                          _icon={{
                            color: 'coolGray.600'
                          }}
                        />
                      </HStack>
                    </VStack>
                  </AlertBox>
                </VStack>
              ) : (
                <VStack space={6} w="full" p={4} alignItems="center">
                  <MemberSelect
                    memberSelected={
                      members.find(({ email }) => email === values.email) || {
                        email: values.email
                      }
                    }
                    members={members}
                    onChange={member => setFieldValue('email', member.email)}
                    disabled={!isAdmin}
                  />
                  <HStack
                    space={2}
                    alignItems="center"
                    justifyContent="flex-start"
                    width="full"
                  >
                    <Switch
                      isChecked={!isUnmark}
                      onChange={() => setIsUnmark(!isUnmark)}
                      colorScheme="success"
                      size="lg"
                    />
                    <TouchableOpacity onPress={() => setIsUnmark(!isUnmark)}>
                      <Text color="white" fontSize="lg">
                        Marcar como pago
                      </Text>
                    </TouchableOpacity>
                  </HStack>
                  {!isUnmark && (
                    <VStack space={3} w="full">
                      <Text color="gray.400" fontSize="md">
                        Quando foi pago?
                      </Text>
                      <DateField
                        onChangeText={handleChange('paidAt')}
                        value={values.paidAt}
                      />
                    </VStack>
                  )}
                  <SubmitButton
                    buttonProps={{
                      width: 'full'
                    }}
                    title={
                      isSubmitting
                        ? 'Carregando...'
                        : isUnmark
                        ? 'Desmarcar pagamento'
                        : 'Confirmar pagamento'
                    }
                    isSubmitting={isSubmitting}
                    handleSubmit={handleSubmit}
                  />
                </VStack>
              )}
            </Actionsheet.Content>
          </Actionsheet>
        </Center>
      )}
    </Formik>
  )
}
