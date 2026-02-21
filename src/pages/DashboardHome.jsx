import React, { useMemo, useState, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Container,
  VStack,
  Heading,
  Text,
  Box,
  HStack,
  SimpleGrid,
  Progress,
  Badge,
  Button,
  Textarea,
  useToast
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { CHAKRA_DATA } from '../chakraData';

const MotionBox = motion(Box);

/**

 *
 * @param {Array<{ chakraId: string | null; createdAt: string }>} entries
 * @returns {Record<string, number>}
 */
const getWeeklyCounts = (entries) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const counts = {};
  for (const entry of entries) {
    if (!entry.chakraId) continue;
    const created = new Date(entry.createdAt);
    if (created < sevenDaysAgo) continue;
    counts[entry.chakraId] = (counts[entry.chakraId] || 0) + 1;
  }
  return counts;
};

/**
 
 *
 * @param {Array<{ createdAt: string }>} entries
 * @returns {{ current: number, longest: number }}
 */
const getStreaks = (entries) => {
  if (!entries.length) return { current: 0, longest: 0 };
  const days = Array.from(
    new Set(entries.map((e) => new Date(e.createdAt).toDateString()))
  ).sort((a, b) => new Date(a) - new Date(b));

  let longest = 1;
  let current = 1;
  for (let i = 1; i < days.length; i += 1) {
    const prev = new Date(days[i - 1]);
    const cur = new Date(days[i]);
    const diff = (cur - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  const today = new Date().toDateString();
  const hasToday = days.includes(today);
  const inferredCurrent = hasToday ? current : 0;

  return { current: inferredCurrent, longest };
};

/**

 *
 * @param {Object} props
 * @param {Array<{ id: string; body: string; chakraId: string | null; createdAt: string }>} props.entries
 * @param {() => void} props.onNewEntry - Navigate to the new entry flow.
 * @param {(id: string, payload: { body: string; chakraId?: string | null }) => void} props.onUpdateEntry
 * @param {(id: string) => void} props.onDeleteEntry
 */
export default function DashboardHome({ entries, onNewEntry, onUpdateEntry, onDeleteEntry }) {
  const [filterChakra, setFilterChakra] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editBody, setEditBody] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const cancelDeleteRef = useRef(null);
  const totalEntries = entries.length;
  const weeklyCounts = useMemo(() => getWeeklyCounts(entries), [entries]);
  const streaks = useMemo(() => getStreaks(entries), [entries]);

  const mostActiveChakra = useMemo(() => {
    const pairs = Object.entries(weeklyCounts);
    if (!pairs.length) return null;
    const [topId] = pairs.sort((a, b) => b[1] - a[1])[0];
    return CHAKRA_DATA.find((c) => c.id === topId) || null;
  }, [weeklyCounts]);

  const maxWeekly = Math.max(1, ...Object.values(weeklyCounts));

  const toast = useToast();

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

  const confirmDelete = (id) => {
    setDeleteTargetId(id);
  };

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

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) =>
        filterChakra === 'all' ? true : entry.chakraId === filterChakra
      ),
    [entries, filterChakra]
  );

  return (
    <Container maxW="container.xl" py={20}>
      <VStack spacing={10} align="stretch">
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="lg">Breathe easy</Heading>
            <Text mt={2} color="gray.600">
              Set your load down. Let’s just breathe and see how you are.
            </Text>
          </Box>
          <Button colorScheme="brand" borderRadius="full" onClick={onNewEntry}>
            New Reflection
          </Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <MotionBox
            className="glass-card"
            p={6}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Text fontSize="sm" color="gray.500">
              Total Reflections
            </Text>
            <Heading mt={2}>{totalEntries}</Heading>
          </MotionBox>
          <MotionBox
            className="glass-card"
            p={6}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Text fontSize="sm" color="gray.500">
              Current Streak
            </Text>
            <Heading mt={2}>{streaks.current} days</Heading>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Longest streak: {streaks.longest} days
            </Text>
          </MotionBox>
          <MotionBox
            className="glass-card"
            p={6}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Text fontSize="sm" color="gray.500">
              Most Active Chakra (7 days)
            </Text>
            <Heading mt={2}>
              {mostActiveChakra ? mostActiveChakra.name : '—'}
            </Heading>
          </MotionBox>
        </SimpleGrid>

        <Box className="glass-card" p={8}>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Weekly Energy Map</Heading>
            <Text fontSize="xs" color="gray.500">
              Last 7 days
            </Text>
          </HStack>
          <SimpleGrid columns={{ base: 2, sm: 3, md: 7 }} spacing={4}>
            {CHAKRA_DATA.map((chakra) => {
              const count = weeklyCounts[chakra.id] || 0;
              const pct = (count / maxWeekly) * 100;
              return (
                <VStack key={chakra.id} align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Text fontSize="xs" fontWeight="medium">
                      {chakra.name}
                    </Text>
                    <Badge colorScheme="green" variant="subtle">
                      {count}
                    </Badge>
                  </HStack>
                  <Progress
                    borderRadius="full"
                    value={pct}
                    size="sm"
                    sx={{
                      '& > div': {
                        background: `linear-gradient(90deg, ${chakra.color}, #A7F3D0)`
                      }
                    }}
                  />
                </VStack>
              );
            })}
          </SimpleGrid>
        </Box>

        <Box className="glass-card" p={8}>
          <HStack justify="space-between" mb={4} align="center">
            <Heading size="md">Your Reflections</Heading>
            <HStack spacing={2} flexWrap="wrap">
              <Button
                size="xs"
                variant={filterChakra === 'all' ? 'solid' : 'outline'}
                borderRadius="full"
                onClick={() => setFilterChakra('all')}
              >
                All
              </Button>
              {CHAKRA_DATA.map((chakra) => (
                <Button
                  key={chakra.id}
                  size="xs"
                  variant={filterChakra === chakra.id ? 'solid' : 'outline'}
                  borderRadius="full"
                  onClick={() => setFilterChakra(chakra.id)}
                >
                  {chakra.name}
                </Button>
              ))}
            </HStack>
          </HStack>
          {filteredEntries.length === 0 ? (
            <Box
              borderRadius="2xl"
              border="1px dashed"
              borderColor="gray.200"
              p={6}
              textAlign="center"
            >
              <Text fontSize="sm" color="gray.500">
                No reflections yet in this view.
              </Text>
              <Button
                mt={4}
                size="sm"
                borderRadius="full"
                colorScheme="brand"
                onClick={onNewEntry}
              >
                Start a new reflection
              </Button>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {filteredEntries.map((entry) => {
                const chakra =
                  CHAKRA_DATA.find((c) => c.id === entry.chakraId) || null;
                const created = new Date(entry.createdAt);
                const isEditing = editingId === entry.id;
                return (
                  <Box
                    key={entry.id}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={isEditing ? 'brand.200' : 'gray.100'}
                    bg="white"
                    p={4}
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="xs" color="gray.500">
                        {created.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Text>
                      <HStack spacing={1}>
                        {chakra && (
                          <Badge
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            bg={`${chakra.color}22`}
                            color="gray.700"
                          >
                            {chakra.name}
                          </Badge>
                        )}
                        {!isEditing ? (
                          <HStack spacing={1}>
                            <Button
                              size="xs"
                              variant="outline"
                              colorScheme="brand"
                              borderRadius="full"
                              onClick={() => startEdit(entry)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              colorScheme="red"
                              borderRadius="full"
                              onClick={() => confirmDelete(entry.id)}
                            >
                              Delete
                            </Button>
                          </HStack>
                        ) : (
                          <>
                            <Button size="xs" colorScheme="brand" borderRadius="full" onClick={saveEdit}>
                              Save
                            </Button>
                            <Button size="xs" variant="ghost" borderRadius="full" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </>
                        )}
                      </HStack>
                    </HStack>
                    {isEditing ? (
                      <Textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        fontSize="sm"
                        minH="80px"
                        borderRadius="xl"
                        borderColor="brand.200"
                        _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                      />
                    ) : (
                      <Textarea
                        value={entry.body}
                        isReadOnly
                        variant="unstyled"
                        fontSize="sm"
                        minH="80px"
                        px={0}
                        py={0}
                      />
                    )}
                  </Box>
                );
              })}
            </SimpleGrid>
          )}
        </Box>

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
      </VStack>
    </Container>
  );
}