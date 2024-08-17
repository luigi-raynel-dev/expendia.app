import React from 'react'
import { Alert } from 'react-native'
import { Box, Center, Text, VStack } from 'native-base'
import BackButton from '../components/BackButton'
import { Formik } from 'formik'
import * as Yup from 'yup'
import TextField from '../components/TextField'
import { api } from '../lib/axios'
import { useNavigation, useRoute } from '@react-navigation/native'
import { FormEmail } from './Email'
import SubmitButton from '../components/SubmitButton'

export default function PasswordRecovery() {
  const { navigate } = useNavigation()
  const route = useRoute()
  const { email } = route.params as FormEmail

  async function submit(
    values: FormEmail,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    try {
      setSubmitting(true)
      const response = await api.post('/password-recovery', values)
      if (response.data.status) navigate('ValidateCode', values)
      else Alert.alert('Ops!', 'Algo deu errado. Tente novamente mais tarde!')
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Formik
      initialValues={
        {
          email
        } as FormEmail
      }
      validationSchema={Yup.object({
        email: Yup.string()
          .email('Formato de e-mail inválido.')
          .required('O e-mail é obrigatório.')
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
              Confirme seu e-mail para receber o código
            </Text>
            <VStack>
              <TextField
                error={errors.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email || ''}
                placeholder="Confirme seu e-mail..."
                onEndEditing={() => handleSubmit()}
              />
            </VStack>
            <Center>
              <Text color="gray.200" fontSize="md">
                Um código de redefinição de senha será enviado para o seu
                endereço de e-mail. Com esse código, você poderá redefinir sua
                senha.
              </Text>
            </Center>
          </VStack>
          <SubmitButton
            title="Confirmar e-mail"
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
          />
        </VStack>
      )}
    </Formik>
  )
}
