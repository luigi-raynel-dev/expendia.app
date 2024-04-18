import React from 'react'
import { Alert } from 'react-native'
import { Box, Pressable, Text, VStack, useToast } from 'native-base'
import BackButton from '../components/BackButton'
import { Formik } from 'formik'
import * as Yup from 'yup'
import TextField from '../components/TextField'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Eye, EyeClosed } from 'phosphor-react-native'
import SubmitButton from '../components/SubmitButton'
import { api } from '../lib/axios'
import { UserProps } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth'

export interface FormPassword {
  password: string
  confirmPassword: string
}

export interface PasswordParams {
  isRecovery?: boolean
  user?: UserProps
}

export default function Password() {
  const route = useRoute()
  const { navigate } = useNavigation()
  const { isRecovery, user } = route.params as PasswordParams
  const [show, setShow] = React.useState(false)
  const { setUser } = useAuth()

  const toast = useToast()

  async function submit(
    values: FormPassword,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    try {
      setSubmitting(true)
      const response = await api.patch('/password', values)
      if (response.data.status) {
        if (user) {
          if (isRecovery) {
            setUser(user)
            toast.show({
              title: 'Senha redefinida com sucesso!'
            })
          } else {
            navigate('Configurations')
            toast.show({
              title: 'Senha alterada com sucesso!'
            })
          }
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
          password: '',
          confirmPassword: ''
        } as FormPassword
      }
      validationSchema={Yup.object({
        password: Yup.string()
          .required('Digite a senha.')
          .min(6, 'Digite no mínimo 6 caracteres.'),
        confirmPassword: Yup.string()
          .required('Confirme a senha.')
          .oneOf([Yup.ref('password')], 'As senhas não coincidem.')
      })}
      onSubmit={(values, { setSubmitting }) => submit(values, setSubmitting)}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
        isSubmitting
      }) => (
        <VStack flex={1} space={2} px={4} py={8} justifyContent="space-between">
          <VStack>
            <Box my={3}>
              <BackButton />
            </Box>
            <Text my={4} fontSize={28} color="white">
              {isRecovery ? 'Redefinir senha' : 'Alterar senha'}
            </Text>
            <VStack space={6}>
              <TextField
                type={show ? 'text' : 'password'}
                error={
                  touched.password && errors.password
                    ? errors.password
                    : undefined
                }
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password || ''}
                placeholder="Digite sua nova senha..."
                InputRightElement={
                  <Pressable p={2} onPress={() => setShow(!show)}>
                    {show ? <EyeClosed color="white" /> : <Eye color="white" />}
                  </Pressable>
                }
              />
              <TextField
                type={show ? 'text' : 'password'}
                error={
                  touched.confirmPassword && errors.confirmPassword
                    ? errors.confirmPassword
                    : undefined
                }
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                value={values.confirmPassword || ''}
                placeholder="Confirme sua senha..."
                InputRightElement={
                  <Pressable p={2} onPress={() => setShow(!show)}>
                    {show ? <EyeClosed color="white" /> : <Eye color="white" />}
                  </Pressable>
                }
              />
            </VStack>
          </VStack>
          <SubmitButton
            title="Confirmar"
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
          />
        </VStack>
      )}
    </Formik>
  )
}
