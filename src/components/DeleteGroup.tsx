import {
  AlertDialog,
  Button,
  HStack,
  Text,
  VStack,
  useToast
} from 'native-base'
import React, { useRef } from 'react'
import { api } from '../lib/axios'
import { Alert } from 'react-native'
import { GroupProps } from '../screens/Groups'
import { useAuth } from '../hooks/useAuth'

interface Props {
  isOpen?: boolean
  onClose?: (deleted?: boolean) => void
  group: GroupProps
}

export default function DeleteGroup({ onClose, isOpen, group }: Props) {
  const cancelRef = useRef(null)
  const toast = useToast()
  const { user } = useAuth()

  async function submit() {
    try {
      const response = await api.delete(`/groups/${group.id}`)
      if (response.data.status) {
        toast.show({
          title: 'Grupo excluído!'
        })
      } else {
        Alert.alert('Ops!', 'Algo deu errado. Tente novamente mais tarde!')
      }
    } catch (error) {
      Alert.alert('Ops!', 'Algo deu errado. Tente novamente mais tarde!')
      console.error(error)
    } finally {
      if (onClose) onClose(false)
    }
  }

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      isOpen={isOpen}
      onClose={onClose}
    >
      <AlertDialog.Content>
        <AlertDialog.CloseButton />
        <AlertDialog.Body bgColor="gray.900">
          <VStack space={4}>
            <HStack>
              <Text color="white" fontSize="lg">
                Excluir grupo
              </Text>
            </HStack>
            <Text color="white">
              Tem certeza que deseja excluir o grupo, membros e todas as
              despesas?
            </Text>
            <Button.Group w="full" justifyContent="flex-end" space={2}>
              <Button
                variant="unstyled"
                color="white"
                onPress={() => (onClose ? onClose(undefined) : {})}
                ref={cancelRef}
              >
                <Text color="white">Cancelar</Text>
              </Button>
              <Button colorScheme="danger" onPress={submit}>
                Excluir
              </Button>
            </Button.Group>
          </VStack>
        </AlertDialog.Body>
      </AlertDialog.Content>
    </AlertDialog>
  )
}
