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

interface Props {
  isOpen?: boolean
  onClose?: (deleted?: boolean) => void
  expenses: string[]
}

export default function DeleteExpense({ onClose, isOpen, expenses }: Props) {
  const cancelRef = useRef(null)
  const toast = useToast()

  async function submit() {
    try {
      const promises = expenses.map(expense =>
        api.delete(`/expenses/${expense}`)
      )
      Promise.all(promises)
        .then(() => {
          toast.show({
            title: 'Excluído com sucesso!'
          })
          if (onClose) onClose(true)
        })
        .catch(error => {
          Alert.alert('Ops!', 'Algo deu errado. Tente novamente mais tarde!')
          console.error('Error:', error.message)
          if (onClose) onClose(false)
        })
    } catch (error) {
      Alert.alert('Ops!', 'Algo deu errado. Tente novamente mais tarde!')
      if (onClose) onClose(false)
      console.error(error)
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
                {`Excluir ${expenses.length > 1 ? 'despesas' : 'despesa'}`}
              </Text>
            </HStack>
            <Text color="white">
              {`Tem certeza que deseja excluir ${
                expenses.length > 1 ? 'essas despesas' : 'essa despesa'
              }?`}
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
