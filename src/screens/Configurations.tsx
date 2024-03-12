import React, { useState } from 'react'
import { Box, HStack, ScrollView, Switch, Text, VStack } from 'native-base'
import BackButton from '../components/BackButton'
import { useNavigation } from '@react-navigation/native'
import * as MenuItems from '../components/MenuItems'
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { MemberAvatar } from '../components/MemberAvatar'
import { useAuth } from '../hooks/useAuth'
import ConfirmLogout from '../components/ConfirmLogout'
import ChangeAvatar from '../components/ChangeAvatar'
import Me from '../components/Me'
import TermSheet from '../components/TermSheet'
import IntroSteps from '../components/IntroSteps'
import * as packageJson from '../../package.json'
import { usePushNotification } from '../hooks/usePushNotification'
import * as Clipboard from 'expo-clipboard'
import { TouchableOpacity } from 'react-native'
export interface GroupForm {
  title: string
  members: string[]
}

export default function Configurations() {
  const { navigate } = useNavigation()
  const { user } = useAuth()
  const { token } = usePushNotification()
  const [openConfirmLogout, setOpenConfirmLogout] = useState(false)
  const [openChangeAvatar, setOpenChangeAvatar] = useState(false)
  const [openPrivacyPolicy, setOpenPrivacyPolicy] = useState(false)
  const [openTermsOfUse, setOpenTermsOfUse] = useState(false)
  const [openIntro, setOpenIntro] = useState(false)

  return openIntro ? (
    <IntroSteps onDone={() => setOpenIntro(false)} />
  ) : (
    <ScrollView h="full">
      <VStack flex={1} space={2} px={4} py={8} justifyContent="space-between">
        <VStack space={4}>
          <Box my={3}>
            <BackButton onPress={() => navigate('Groups')} />
          </Box>
          <Me onPressOnAvatar={() => setOpenChangeAvatar(true)} />
          <TouchableOpacity
            onPress={async () => {
              await Clipboard.setStringAsync(token || '')
            }}
          >
            <HStack textAlign="center" justifyContent="center">
              <Text fontSize="xs" color="white">
                {token || 'sem token'}
              </Text>
            </HStack>
          </TouchableOpacity>
          <MenuItems.GroupItems name="Conta">
            <MenuItems.ListItem
              title="Perfil"
              subTitle="Altere seus dados de perfil no aplicativo"
              left={<Ionicons name="person" size={24} color="white" />}
              onPress={() => navigate('Profile')}
            />
            <MenuItems.ListItem
              title="Foto"
              subTitle={`${
                user.avatarUri ? 'Altere' : 'Crie'
              } sua foto de perfil no aplicativo`}
              left={<Ionicons name="person-circle" size={28} color="white" />}
              onPress={() => setOpenChangeAvatar(true)}
            />
            <MenuItems.ListItem
              title="E-mail"
              subTitle="Altere o e-mail da sua conta"
              left={<Ionicons name="mail-open" size={26} color="white" />}
              onPress={() => navigate('Email', user)}
            />
            <MenuItems.ListItem
              title="Excluir conta"
              subTitle="Excluir conta e seus dados do aplicativo"
              left={<Ionicons name="trash" size={26} color="white" />}
              onPress={() => navigate('RequestAccountDeletion')}
            />
          </MenuItems.GroupItems>
          <MenuItems.GroupItems name="Segurança">
            <MenuItems.ListItem
              title="Senha"
              subTitle={`${
                user.hasPassword ? 'Altere' : 'Crie'
              } sua senha de acesso ao aplicativo`}
              left={<Ionicons name="key-sharp" size={24} color="white" />}
              onPress={() =>
                user.hasPassword
                  ? navigate('SignIn', { user, isConfirmPassword: true })
                  : navigate('Password', { user })
              }
            />
            <MenuItems.ListItem
              title="Biometria"
              subTitle="Facilite seu acesso com o uso da biometria"
              left={<Ionicons name="finger-print" size={24} color="#999" />}
              right={
                <Switch
                  offTrackColor="violet.100"
                  onTrackColor="violet.400"
                  onThumbColor="violet.500"
                  offThumbColor="violet.400"
                  disabled={true}
                />
              }
              disabled={true}
            />
            <MenuItems.ListItem
              title="Contas sociais"
              subTitle="Gerencie as contas sociais vinculadas ao seu perfil"
              left={<MaterialIcons name="group" size={24} color="#999" />}
              disabled={true}
            />
          </MenuItems.GroupItems>
          <MenuItems.GroupItems name="Configurações">
            <MenuItems.ListItem
              title="Tema"
              subTitle="Escolha o tema que mais te agrada"
              left={
                false ? (
                  <Ionicons name="sunny" size={24} color="#999" />
                ) : (
                  <Ionicons name="moon" size={24} color="#999" />
                )
              }
              right={
                <Switch
                  offTrackColor="violet.100"
                  onTrackColor="violet.400"
                  onThumbColor="violet.500"
                  offThumbColor="violet.400"
                  disabled={true}
                />
              }
              disabled={true}
            />
            <MenuItems.ListItem
              title="Notificações"
              subTitle="Foque nas notificações mais importantes"
              left={
                <Ionicons
                  name="notifications"
                  size={24}
                  color={token ? 'white' : '#999'}
                />
              }
              disabled={token === undefined}
              onPress={async () => {
                await Clipboard.setStringAsync(token || '')
              }}
            />
          </MenuItems.GroupItems>
          <MenuItems.GroupItems name="Aplicativo">
            <MenuItems.ListItem
              title="Introdução"
              subTitle="Uma breve introdução ao aplicativo"
              left={
                <Ionicons name="information-circle" size={24} color="white" />
              }
              onPress={() => setOpenIntro(true)}
            />
            <MenuItems.ListItem
              title="Política de privacidade"
              subTitle="Como usamos os seus dados"
              left={
                <Ionicons name="shield-checkmark" size={24} color="white" />
              }
              onPress={() => setOpenPrivacyPolicy(true)}
            />
            <MenuItems.ListItem
              title="Termos de uso"
              subTitle="Como usar nosso aplicativo"
              left={<Ionicons name="document-text" size={24} color="white" />}
              onPress={() => setOpenTermsOfUse(true)}
            />
          </MenuItems.GroupItems>
          <MenuItems.GroupItems name="Sessão">
            <MenuItems.ListItem
              title="Logout"
              subTitle="Desconectar usuário"
              left={<Feather name="log-out" size={24} color="white" />}
              onPress={() => setOpenConfirmLogout(true)}
            />
          </MenuItems.GroupItems>
          <VStack w="full" alignItems="center">
            <Text color="white">Versão: {packageJson.version}</Text>
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
        <ConfirmLogout
          isOpen={openConfirmLogout}
          onClose={() => setOpenConfirmLogout(false)}
        />
        <ChangeAvatar
          isOpen={openChangeAvatar}
          onClose={() => setOpenChangeAvatar(false)}
        />
      </VStack>
    </ScrollView>
  )
}
