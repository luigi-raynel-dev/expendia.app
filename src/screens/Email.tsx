import React from 'react'
import { Alert } from 'react-native'
import { Box, Text, VStack, useToast } from 'native-base'
import BackButton from '../components/BackButton'
import { Formik } from 'formik'
import * as Yup from 'yup'
import TextField from '../components/TextField'
import { api } from '../lib/axios'
import { useNavigation, useRoute } from '@react-navigation/native'
import SubmitButton from '../components/SubmitButton'
import { useAuth } from '../hooks/useAuth'

export interface FormEmail {
  email: string
}

export default function Email() {
  const { setUser, user } = useAuth()
  const { navigate } = useNavigation()
  const route = useRoute()
  const toast = useToast()

  async function submit(
    values: FormEmail,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    try {
      setSubmitting(true)
      const response = !route.params
        ? await api.post('/sign-in', {
            ...values,
            password: ''
          })
        : await api.patch('/profile', values)
      if (response.data.hasOwnProperty('error')) {
        switch (response.data.error) {
          case 'INVALID_PASSWORD':
            navigate('SignIn', {
              user: values
            })
            break
          case 'USER_DOES_NOT_EXIST':
            navigate('SignUp', values)
            break
          case 'USER_AUTHENTICATED_WITH_GOOGLE':
            Alert.alert(
              'Ops! Conta Google Vinculada',
              'Usuário autenticado com o Google, volte para a tela inicial e continue com o Google ou tente continuar com outro e-mail.'
            )
            break
          case 'EMAIL_ALREADY_REGISTERED':
            Alert.alert(
              'Ops! E-mail já está sendo usado',
              'Este e-mail já está vinculado a outra conta. Utilize um diferente. '
            )
            break
          default:
            Alert.alert('Ops!', 'Algo deu errado. Tente novamente mais tarde!')
            break
        }
      } else if (response.data.status && route.params) {
        setUser({
          ...user,
          email: values.email,
          confirmedEmail: false
        })
        toast.show({
          title: 'E-mail alterado com sucesso!'
        })
        navigate('Groups')
      }
    } catch (error) {
      Alert.alert('Ops!', 'Algo deu errado. Tente novamente mais tarde!')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Formik
      initialValues={
        route.params ? (route.params as FormEmail) : ({} as FormEmail)
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
              <BackButton
                onPress={() =>
                  navigate(route.params ? 'Configurations' : 'Home')
                }
              />
            </Box>
            <Text my={4} fontSize={28} color="white">
              {route.params
                ? 'Alterar e-mail de acesso'
                : 'Comece com seu e-mail'}
            </Text>
            <VStack>
              <TextField
                error={errors.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email || ''}
                placeholder="Digite seu email favorito..."
                onEndEditing={() => handleSubmit()}
              />
            </VStack>
          </VStack>
          <SubmitButton
            title={route.params ? 'Salvar' : 'Continuar'}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
          />
        </VStack>
      )}
    </Formik>
  )
}
