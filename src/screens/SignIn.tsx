import React from 'react'
import { Alert } from 'react-native'
import { Box, Center, Pressable, Text, VStack } from 'native-base'
import BackButton from '../components/BackButton'
import { Formik } from 'formik'
import * as Yup from 'yup'
import TextField from '../components/TextField'
import { api } from '../lib/axios'
import { useNavigation, useRoute } from '@react-navigation/native'
import { FormEmail } from './Email'
import { Eye, EyeClosed } from 'phosphor-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../hooks/useAuth'
import SubmitButton from '../components/SubmitButton'
import { API_URL } from '@env'

export interface FormSignIn extends FormEmail {
  password: string
}

export interface SignInParams {
  user: FormEmail
  isConfirmPassword?: boolean
}

export default function SignIn() {
  const { navigate } = useNavigation()
  const route = useRoute()
  const {
    user: { email },
    isConfirmPassword
  } = route.params as SignInParams
  const [show, setShow] = React.useState(false)
  const { setUser } = useAuth()

  async function submit(
    values: FormSignIn,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    try {
      setSubmitting(true)
      const response = await api.post('/sign-in', values)
      if (response.data.status && response.data.token) {
        if (!isConfirmPassword) {
          await AsyncStorage.setItem('accessToken', response.data.token)
          setUser({
            ...response.data.user,
            noRedirect: true
          })
          navigate('Groups')
        } else
          navigate('Password', {
            user: response.data.user
          })
      } else if (response.data.hasOwnProperty('error')) {
        switch (response.data.error) {
          case 'INVALID_PASSWORD':
            Alert.alert(
              'Ops!',
              isConfirmPassword
                ? 'Senha inválida!'
                : 'Senha inválida! Tente novamente ou redefina sua senha.'
            )
            break
          case 'USER_DOES_NOT_EXIST':
            Alert.alert('Ops!', 'Usuário não cadastrado!')
            navigate('SignUp', { email })
            break
          default:
            Alert.alert('Ops!', 'Algo deu errado. Tente novamente mais tarde!')
            break
        }
      } else Alert.alert('Ops!', 'Algo deu errado. Tente novamente mais tarde!')
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
          email,
          password: ''
        } as FormSignIn
      }
      validationSchema={Yup.object({
        email: Yup.string()
          .email('Formato de e-mail inválido.')
          .required('O e-mail é obrigatório.'),
        password: Yup.string().required('Digite a senha.')
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
              {isConfirmPassword
                ? 'Confirme sua senha atual'
                : 'Agora sua senha'}
            </Text>
            <VStack space={8}>
              <TextField
                type={show ? 'text' : 'password'}
                error={errors.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password || ''}
                placeholder="Digite sua senha..."
                InputRightElement={
                  <Pressable p={2} onPress={() => setShow(!show)}>
                    {show ? <EyeClosed color="white" /> : <Eye color="white" />}
                  </Pressable>
                }
                onEndEditing={() => handleSubmit()}
              />
              {!isConfirmPassword && (
                <Center>
                  <Pressable
                    onPress={() => navigate('PasswordRecovery', { email })}
                  >
                    <Text color="white" underline fontSize="md">
                      Esqueci minha senha
                    </Text>
                  </Pressable>
                </Center>
              )}
            </VStack>
          </VStack>
          <SubmitButton
            title={isConfirmPassword ? 'Continuar' : 'Entrar'}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
          />
        </VStack>
      )}
    </Formik>
  )
}
