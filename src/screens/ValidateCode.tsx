import React, { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import { Box, Center, Pressable, Text, VStack } from 'native-base'
import BackButton from '../components/BackButton'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { api } from '../lib/axios'
import { useNavigation, useRoute } from '@react-navigation/native'
import { FormEmail } from './Email'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SubmitButton from '../components/SubmitButton'
import { CodeField } from '../components/CodeField'

export interface FormValidateCode extends FormEmail {
  code: string
}

export default function ValidateCode() {
  const { navigate } = useNavigation()
  const route = useRoute()
  const { email } = route.params as FormEmail
  const [timeToResendCode, setTimeToResendCode] = useState(60)

  async function submit(
    values: FormValidateCode,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    try {
      setSubmitting(true)
      const response = await api.post('/validate-code', values)
      if (response.data.status && response.data.token) {
        await AsyncStorage.setItem('accessToken', response.data.token)
        navigate('Password', {
          isRecovery: true,
          user: response.data.user
        })
      } else if (
        response.data.hasOwnProperty('status') &&
        response.data.status === false
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
          email,
          code: ''
        } as FormValidateCode
      }
      validationSchema={Yup.object({
        email: Yup.string()
          .email('Formato de e-mail inválido.')
          .required('O e-mail é obrigatório.'),
        code: Yup.string().required('Digite o código.')
      })}
      onSubmit={(values, { setSubmitting }) => submit(values, setSubmitting)}
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
              <BackButton />
            </Box>
            <Text my={4} fontSize={28} color="white">
              Confirme o código que recebeu
            </Text>
            <VStack space={8}>
              <CodeField
                error={errors.code}
                onChangeText={handleChange('code')}
                onBlur={handleBlur('code')}
                value={values.code || ''}
                onSubmit={() => handleSubmit()}
              />
              <Center>
                <Pressable
                  onPress={() =>
                    timeToResendCode === 0 &&
                    navigate('PasswordRecovery', { email })
                  }
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
              </Center>
            </VStack>
          </VStack>
          <SubmitButton
            title="Confirmar código"
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
          />
        </VStack>
      )}
    </Formik>
  )
}
