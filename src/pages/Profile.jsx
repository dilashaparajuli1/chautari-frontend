import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { CHAKRA_DATA } from '../chakraData';

/**

 *
 * @param {Array<{ createdAt: string; chakraId: string | null }>} entries
 */
const getProfileStats = (entries) => {
  if (!entries.length) {
    return {
      total: 0,
      daysActive: 0,
      currentStreak: 0,
      mostActiveChakra: null
    };
  }

  const daysSet = new Set(
    entries.map((e) => new Date(e.createdAt).toDateString())
  );
  const days = Array.from(daysSet).sort(
    (a, b) => new Date(a) - new Date(b)
  );

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

  const chakraCounts = entries.reduce((acc, entry) => {
    if (!entry.chakraId) return acc;
    acc[entry.chakraId] = (acc[entry.chakraId] || 0) + 1;
    return acc;
  }, {});

  const mostPair = Object.entries(chakraCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];
  const mostActiveChakra = mostPair
    ? CHAKRA_DATA.find((c) => c.id === mostPair[0]) || null
    : null;

  return {
    total: entries.length,
    daysActive: daysSet.size,
    currentStreak: longest,
    mostActiveChakra
  };
};

/**

 *
 * @param {Object} props
 * @param {{ name?: string; email?: string; memberSince?: string }} props.user
 * @param {Array<{ createdAt: string; chakraId: string | null }>} props.entries
 * @param {(updates: { name?: string; email?: string }) => void} props.onUpdateUser
 */
export default function Profile({ user, entries, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(user?.name || '');
  const [draftEmail, setDraftEmail] = useState(user?.email || '');
  const toast = useToast();

  const name = user?.name || 'Guest';
  const email = user?.email || 'your@email.com';
  const memberSince = user?.memberSince
    ? new Date(user.memberSince).toLocaleString(undefined, {
        month: 'long',
        year: 'numeric'
      })
    : '—';

  const stats = getProfileStats(entries);

  const startEdit = () => {
    setDraftName(name);
    setDraftEmail(email);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraftName(name);
    setDraftEmail(email);
    setIsEditing(false);
  };

  const saveEdit = () => {
    const trimmedName = draftName.trim();
    const trimmedEmail = draftEmail.trim();
    if (!trimmedName) {
      toast({ title: 'Name is required', status: 'warning', duration: 2000, isClosable: true });
      return;
    }
    if (!trimmedEmail) {
      toast({ title: 'Email is required', status: 'warning', duration: 2000, isClosable: true });
      return;
    }
    onUpdateUser?.({ name: trimmedName, email: trimmedEmail });
    toast({ title: 'Profile updated', status: 'success', duration: 1500, isClosable: true });
    setIsEditing(false);
  };

  return (
    <Box bg="gray.50">
      <Container maxW="container.xl" py={16}>
        <VStack align="stretch" spacing={8}>
          <Box>
            <Heading size="xl" mb={1}>
              Profile
            </Heading>
            <Text color="gray.600">
              Tend to the details of yourself and how you wish to be seen.
            </Text>
          </Box>

          <Box className="glass-card" p={{ base: 6, md: 10 }}>
            <VStack spacing={8} align="stretch">
              <VStack spacing={4} align="center">
                <Avatar size="xl" bg="brand.100" color="brand.600" />
                <VStack spacing={0}>
                  <Heading size="md">{name}</Heading>
                  <Text fontSize="sm" color="gray.500">
                    {email}
                  </Text>
                </VStack>
              </VStack>

              <Box borderTop="1px solid" borderColor="gray.100" pt={6}>
                <HStack justify="space-between" mb={4}>
                  <Heading size="sm">My Identity</Heading>
                  {!isEditing ? (
                    <Button
                      size="xs"
                      variant="outline"
                      borderRadius="full"
                      onClick={startEdit}
                    >
                      Edit
                    </Button>
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
                <Stack spacing={4}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Name
                    </Text>
                    {isEditing ? (
                      <Input
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        size="sm"
                        borderRadius="full"
                        placeholder="Your name"
                        _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                      />
                    ) : (
                      <Box
                        bg="gray.50"
                        borderRadius="full"
                        px={4}
                        py={2}
                        fontSize="sm"
                      >
                        {name}
                      </Box>
                    )}
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Email
                    </Text>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={draftEmail}
                        onChange={(e) => setDraftEmail(e.target.value)}
                        size="sm"
                        borderRadius="full"
                        placeholder="your@email.com"
                        _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                      />
                    ) : (
                      <Box
                        bg="gray.50"
                        borderRadius="full"
                        px={4}
                        py={2}
                        fontSize="sm"
                      >
                        {email}
                      </Box>
                    )}
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Member Since
                    </Text>
                    <Box
                      bg="gray.50"
                      borderRadius="full"
                      px={4}
                      py={2}
                      fontSize="sm"
                    >
                      {memberSince}
                    </Box>
                  </Box>
                </Stack>
              </Box>

              <Box borderTop="1px solid" borderColor="gray.100" pt={6}>
                <Heading size="sm" mb={4}>
                  Your Journey
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Box
                    borderRadius="2xl"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.100"
                    p={4}
                  >
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Total Entries
                    </Text>
                    <Heading size="md">{stats.total}</Heading>
                  </Box>
                  <Box
                    borderRadius="2xl"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.100"
                    p={4}
                  >
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Days Active
                    </Text>
                    <Heading size="md">
                      {stats.daysActive || '—'}
                    </Heading>
                  </Box>
                  <Box
                    borderRadius="2xl"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.100"
                    p={4}
                  >
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Current Streak
                    </Text>
                    <Heading size="md">
                      {stats.currentStreak || '—'}
                    </Heading>
                  </Box>
                </SimpleGrid>
                {stats.mostActiveChakra && (
                  <Box mt={4}>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Most Active Chakra
                    </Text>
                    <HStack spacing={2}>
                      <Badge
                        borderRadius="full"
                        px={3}
                        py={1}
                        bg={`${stats.mostActiveChakra.color}11`}
                      >
                        {stats.mostActiveChakra.name}
                      </Badge>
                      <Text fontSize="xs" color="gray.500">
                        {stats.mostActiveChakra.emotion}
                      </Text>
                    </HStack>
                  </Box>
                )}
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

