import React, { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import { Box, Center, Pressable, Text, VStack } from 'native-base'
import BackButton from '../components/BackButton'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { api } from '../lib/axios'
import { useNavigation, useRoute } from '@react-navigation/native'
import SubmitButton from '../components/SubmitButton'
import { CodeField } from '../components/CodeField'

interface FormDeleteAccount {
  code: string
}

export default function DeleteAccount() {
  const { navigate } = useNavigation()
  const [timeToResendCode, setTimeToResendCode] = useState(60)

  async function submit(
    values: FormDeleteAccount,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    try {
      setSubmitting(true)
      const response = await api.post('/delete-account', values)
      if (response.data.status) {
        Alert.alert(
          'Conta excluída com sucesso!',
          'Sua conta foi excluída com sucesso e sua sessão será interrompida. Esperamos te ver novamente em breve. Caso precise de algum suporte entre em contato conosco.'
        )
        navigate('Logout')
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
        } as FormDeleteAccount
      }
      validationSchema={Yup.object({
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
                    timeToResendCode === 0 && navigate('RequestAccountDeletion')
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
            title="CONFIRMAR EXCLUSÃO DA CONTA"
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
            buttonProps={{
              bg: 'red.500',
              _pressed: {
                bg: 'red.700'
              }
            }}
          />
        </VStack>
      )}
    </Formik>
  )
}
