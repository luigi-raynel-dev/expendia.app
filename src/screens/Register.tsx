import React, { useState } from 'react'
import { Alert, LogBox, TouchableOpacity } from 'react-native'
import {
  Box,
  Center,
  HStack,
  Pressable,
  Switch,
  Text,
  VStack,
  useToast
} from 'native-base'
import BackButton from '../components/BackButton'
import { Formik } from 'formik'
import * as Yup from 'yup'
import TextField from '../components/TextField'
import { api } from '../lib/axios'
import { useRoute } from '@react-navigation/native'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../hooks/useAuth'
import { FormSignUp } from './SignUp'
import SubmitButton from '../components/SubmitButton'
import TermSheet from '../components/TermSheet'

LogBox.ignoreLogs([
  'We can not support a function callback. See Github Issues for details https://github.com/adobe/react-spectrum/issues/2320'
])

export interface FormProfile {
  firstname: string
  lastname: string
  hasPassword?: boolean
}

interface FormRegister extends FormProfile, FormSignUp {
  acceptPrivacyPolicy: boolean
  acceptTermsOfUse: boolean
}

export default function Register() {
  const route = useRoute()
  const { email, password, confirmPassword } = route.params as FormSignUp
  const { setUser } = useAuth()
  const toast = useToast()
  const [openPrivacyPolicy, setOpenPrivacyPolicy] = useState(false)
  const [openTermsOfUse, setOpenTermsOfUse] = useState(false)

  async function submit(
    values: FormRegister,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    try {
      setSubmitting(true)
      const response = await api.post('/sign-up', values)
      if (response.data.status && response.data.token) {
        await AsyncStorage.setItem('accessToken', response.data.token)
        setUser(response.data.user)
        toast.show({
          title: 'Conta criada com sucesso!'
        })
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
          password,
          confirmPassword,
          firstname: '',
          lastname: '',
          acceptPrivacyPolicy: false,
          acceptTermsOfUse: false
        } as FormRegister
      }
      validationSchema={Yup.object({
        email: Yup.string().required(),
        password: Yup.string().required(),
        confirmPassword: Yup.string().required(),
        firstname: Yup.string().required('Digite seu primeiro nome.'),
        lastname: Yup.string().required('Digite seu sobrenome.'),
        acceptPrivacyPolicy: Yup.boolean().isTrue(
          'Para criar sua conta é necessário estar de acordo com nossa política de privacidade.'
        ),
        acceptTermsOfUse: Yup.boolean().isTrue(
          'Para criar sua conta é necessário estar de acordo com nossos termos de uso.'
        )
      })}
      onSubmit={(values, { setSubmitting }) => submit(values, setSubmitting)}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        isSubmitting,
        submitCount,
        setFieldValue
      }) => (
        <VStack flex={1} space={2} px={4} py={8} justifyContent="space-between">
          <VStack>
            <Box my={3}>
              <BackButton />
            </Box>
            <Text my={4} fontSize={28} color="white">
              Como podemos te chamar?
            </Text>
            <VStack space={6}>
              <TextField
                error={
                  submitCount > 0 && errors.firstname
                    ? errors.firstname
                    : undefined
                }
                onChangeText={handleChange('firstname')}
                onBlur={handleBlur('firstname')}
                value={values.firstname || ''}
                placeholder="Digite seu primeiro nome..."
              />
              <TextField
                error={
                  submitCount > 0 && errors.lastname
                    ? errors.lastname
                    : undefined
                }
                onChangeText={handleChange('lastname')}
                onBlur={handleBlur('lastname')}
                value={values.lastname || ''}
                placeholder="Digite seu sobrenome..."
              />
              <Center>
                <VStack space={1} my={2}>
                  <HStack space={1} alignItems="center">
                    <Switch
                      isChecked={values.acceptPrivacyPolicy}
                      onChange={() => {
                        setFieldValue(
                          'acceptPrivacyPolicy',
                          !values.acceptPrivacyPolicy
                        )
                      }}
                      colorScheme="success"
                    />
                    <TouchableOpacity
                      onPress={() => setOpenPrivacyPolicy(true)}
                    >
                      <Text color="white" fontSize="md">
                        Li e concordo com a{' '}
                        <Text color="white" bold underline fontSize="md">
                          política de privacidade.
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  </HStack>
                  <HStack space={1} alignItems="center">
                    <Switch
                      defaultIsChecked={values.acceptTermsOfUse}
                      onChange={() => {
                        setFieldValue(
                          'acceptTermsOfUse',
                          !values.acceptTermsOfUse
                        )
                      }}
                      colorScheme="success"
                    />
                    <TouchableOpacity onPress={() => setOpenTermsOfUse(true)}>
                      <Text color="white" fontSize="md">
                        Li e concordo com os{' '}
                        <Text color="white" bold underline fontSize="md">
                          termos de uso.
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  </HStack>
                  {submitCount > 0 && errors.acceptPrivacyPolicy && (
                    <Text color="red.500" fontSize="sm">
                      {errors.acceptPrivacyPolicy}
                    </Text>
                  )}
                  {submitCount > 0 && errors.acceptTermsOfUse && (
                    <Text color="red.500" fontSize="sm">
                      {errors.acceptTermsOfUse}
                    </Text>
                  )}
                </VStack>
              </Center>
            </VStack>
          </VStack>
          <TermSheet
            slug="privacy-policy"
            isOpen={openPrivacyPolicy}
            onClose={() => setOpenPrivacyPolicy(false)}
          />
          <TermSheet
            slug="terms-of-use"
            isOpen={openTermsOfUse}
            onClose={() => setOpenTermsOfUse(false)}
          />
          <SubmitButton
            title="Criar conta"
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
          />
        </VStack>
      )}
    </Formik>
  )
}
