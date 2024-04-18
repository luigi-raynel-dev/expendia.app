import React, { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import { Box, Center, Pressable, Text, VStack, useToast } from 'native-base'
import BackButton from '../components/BackButton'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { api } from '../lib/axios'
import { useNavigation } from '@react-navigation/native'
import SubmitButton from '../components/SubmitButton'
import { useAuth } from '../hooks/useAuth'
import { CodeField } from '../components/CodeField'

interface FormConfirmEmail {
  code: string
}

export default function ConfirmEmail() {
  const { navigate } = useNavigation()
  const toast = useToast()
  const { user, setUser } = useAuth()
  const [timeToResendCode, setTimeToResendCode] = useState(60)
  const [isLoading, setIsLoading] = useState(false)

  async function confirmEmail(
    values: FormConfirmEmail,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    try {
      setSubmitting(true)
      const response = await api.post('/confirm-email', values)
      if (response.data.status) {
        toast.show({
          title: 'E-mail confirmado com sucesso!'
        })
        setUser({
          ...user,
          confirmedEmail: true
        })
      } else if (
        response.data.hasOwnProperty('error') &&
        response.data.error === 'INVALID_CODE'
      ) {
        Alert.alert(
          'Ops!',
          'O código está inválido ou expirado! Tente novamente ou solicite um novo código.'
        )
      } else Alert.alert('Ops!', 'Algo deu errado. Tente novamente mais tarde!')
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  async function resendCode() {
    try {
      setIsLoading(true)
      setTimeToResendCode(60)
      const response = await api.post('/resend-email-confirmation')
      if (response.data.status)
        toast.show({
          title: 'Novo código enviado ao seu e-mail!'
        })
      else Alert.alert('Ops!', 'Algo deu errado. Tente novamente mais tarde!')
    } catch (error) {
      console.error(error)
      Alert.alert('Ops!', 'Algo deu errado. Tente novamente mais tarde!')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setInterval(
      () => setTimeToResendCode(time => (time > 0 ? time - 1 : 0)),
      1000
    )
  }, [])

  return (
    <Formik
      initialValues={
        {
          code: ''
        } as FormConfirmEmail
      }
      validationSchema={Yup.object({
        code: Yup.string().required('Digite o código.')
      })}
      onSubmit={(values, { setSubmitting }) =>
        confirmEmail(values, setSubmitting)
      }
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        isSubmitting
      }) => (
        <VStack flex={1} space={2} px={4} py={8} justifyContent="space-between">
          <VStack>
            <Box my={3}>
              <BackButton onPress={() => navigate('Configurations')} />
            </Box>
            <Text my={4} fontSize={28} color="white">
              Confirme seu e-mail com o código que enviamos para ele
            </Text>
            <VStack space={8}>
              <Text color="white" fontSize="md">
                Precisamos conferir se o e-mail que cadastrou está correto, por
                isso enviamos um código numérico para você nos confirmar no
                campo abaixo.
              </Text>
              <CodeField
                error={errors.code}
                onChangeText={handleChange('code')}
                onBlur={handleBlur('code')}
                value={values.code || ''}
                onSubmit={() => handleSubmit()}
              />
              <Center>
                {isLoading ? (
                  <Text color="white" fontSize="md">
                    Enviando novo código...
                  </Text>
                ) : (
                  <Pressable
                    onPress={() => timeToResendCode === 0 && resendCode()}
                  >
                    <Text
                      color={timeToResendCode > 0 ? 'gray.300' : 'white'}
                      underline={timeToResendCode === 0}
                      fontSize="md"
                    >
                      Reenviar outro código
                      {timeToResendCode > 0 && ` em ${timeToResendCode}s`}
                    </Text>
                  </Pressable>
                )}
              </Center>
            </VStack>
          </VStack>
          <SubmitButton
            title="Confirmar email"
            isSubmitting={isSubmitting || isLoading}
            handleSubmit={handleSubmit}
          />
        </VStack>
      )}
    </Formik>
  )
}
