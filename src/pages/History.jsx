import { useState, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Container,
  SimpleGrid,
  Box,
  Heading,
  Text,
  HStack,
  Badge,
  VStack,
  Button,
  Textarea,
  useToast
} from '@chakra-ui/react';
import { CHAKRA_DATA } from '../chakraData';

/**

 *
 * @param {Object} props
 * @param {Array<{ id: string; body: string; chakraId: string | null; createdAt: string }>} props.entries
 * @param {(id: string, payload: { body: string; chakraId: string | null }) => void} props.onUpdateEntry
 * @param {(id: string) => void} props.onDeleteEntry
 */
export default function History({ entries, onUpdateEntry, onDeleteEntry }) {
  const toast = useToast();
  const [editingId, setEditingId] = useState(null);
  const [editBody, setEditBody] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const cancelDeleteRef = useRef(null);

  const sorted = [...entries].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditBody(entry.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBody('');
  };

  const saveEdit = () => {
    if (!editingId) return;
    const trimmed = editBody.trim();
    if (!trimmed) {
      toast({ title: 'Entry cannot be empty', status: 'warning', duration: 2000, isClosable: true });
      return;
    }
    onUpdateEntry(editingId, { body: trimmed });
    toast({ title: 'Reflection updated', status: 'success', duration: 1500, isClosable: true });
    setEditingId(null);
    setEditBody('');
  };

  const confirmDelete = (id) => setDeleteTargetId(id);
  const doDelete = () => {
    if (deleteTargetId) {
      if (editingId === deleteTargetId) {
        setEditingId(null);
        setEditBody('');
      }
      onDeleteEntry?.(deleteTargetId);
      toast({ title: 'Reflection deleted', status: 'info', duration: 1500, isClosable: true });
      setDeleteTargetId(null);
    }
  };

  return (
    <Container maxW="container.xl" py={20}>
      <Heading mb={10}>Your Reflection Timeline</Heading>
      {sorted.length === 0 ? (
        <Text color="gray.500" fontSize="sm">
          Your timeline will appear here once you begin journaling.
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {sorted.map((e) => {
            const chakra =
              CHAKRA_DATA.find((c) => c.id === e.chakraId) || null;
            const date = new Date(e.createdAt);
            const isEditing = editingId === e.id;

            return (
              <Box key={e.id} className="glass-card" p={6}>
                <HStack mb={4} justify="space-between">
                  <VStack align="start" spacing={0}>
                    {chakra && (
                      <Badge colorScheme="green" borderRadius="full">
                        {chakra.name}
                      </Badge>
                    )}
                    <Text fontSize="xs" color="gray.500">
                      {date.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </VStack>
                  {!isEditing ? (
                    <HStack spacing={2}>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="brand"
                        borderRadius="full"
                        onClick={() => startEdit(e)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="red"
                        borderRadius="full"
                        onClick={() => confirmDelete(e.id)}
                      >
                        Delete
                      </Button>
                    </HStack>
                  ) : (
                    <HStack spacing={2}>
                      <Button size="xs" colorScheme="brand" borderRadius="full" onClick={saveEdit}>
                        Save
                      </Button>
                      <Button size="xs" variant="ghost" borderRadius="full" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </HStack>
                  )}
                </HStack>
                {isEditing ? (
                  <Textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    minH="120px"
                    fontSize="sm"
                    borderRadius="xl"
                    borderColor="brand.200"
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                  />
                ) : (
                  <Text fontSize="sm" color="gray.700">
                    {e.body}
                  </Text>
                )}
              </Box>
            );
          })}
        </SimpleGrid>
      )}

      <AlertDialog
        isOpen={!!deleteTargetId}
        leastDestructiveRef={cancelDeleteRef}
        onClose={() => setDeleteTargetId(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete reflection?
            </AlertDialogHeader>
            <AlertDialogBody>
              This reflection will be permanently deleted. This cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={() => setDeleteTargetId(null)} borderRadius="full">
                Cancel
              </Button>
              <Button colorScheme="red" onClick={doDelete} ml={3} borderRadius="full">
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
}