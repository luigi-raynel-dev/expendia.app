import React from 'react'
import { Box, Pressable, Text, VStack } from 'native-base'
import BackButton from '../components/BackButton'
import { Formik } from 'formik'
import * as Yup from 'yup'
import TextField from '../components/TextField'
import { useNavigation, useRoute } from '@react-navigation/native'
import { FormEmail } from './Email'
import { Eye, EyeClosed } from 'phosphor-react-native'
import SubmitButton from '../components/SubmitButton'

export interface FormSignUp extends FormEmail {
  password: string
  confirmPassword: string
}

export default function SignUp() {
  const { navigate } = useNavigation()
  const route = useRoute()
  const { email } = route.params as FormEmail
  const [show, setShow] = React.useState(false)

  function submit(
    values: FormSignUp,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    try {
      setSubmitting(true)
      navigate('Register', values)
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
          password: '',
          confirmPassword: ''
        } as FormSignUp
      }
      validationSchema={Yup.object({
        email: Yup.string()
          .email('Formato de e-mail inválido.')
          .required('O e-mail é obrigatório.'),
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
              Agora crie sua senha
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
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
          />
        </VStack>
      )}
    </Formik>
  )
}
