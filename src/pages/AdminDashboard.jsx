import { useMemo, useEffect, useState } from 'react';
import {
  Container,
  Heading,
  SimpleGrid,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  Progress,
  HStack,
  Button,
  VStack,
  Spinner,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { CHAKRA_DATA } from '../chakraData';
import { api } from '../api';

/**
 * Admin dashboard: fetches all entries from API.
 * @param {{ name?: string; email?: string } | null} props.user - Current user (for display only)
 */
export default function AdminDashboard({ user }) {
  const [entries, setEntries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    Promise.all([
      api.admin
        .getEntries()
        .then((data) => setEntries(data))
        .catch(() => {
          setEntries([]);
          toast({
            status: 'error',
            title: 'Could not load entries',
            isClosable: true,
          });
        }),
      api.admin
        .getUsers()
        .then((data) => setUsers(data))
        .catch(() => {
          setUsers([]);
          toast({
            status: 'error',
            title: 'Could not load users',
            isClosable: true,
          });
        }),
    ]).finally(() => setLoading(false));
  }, []);
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const reflectionsToday = useMemo(
    () => entries.filter((e) => new Date(e.createdAt).getTime() >= todayStart).length,
    [entries, todayStart]
  );

  const recentEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 25),
    [entries]
  );

  const chakraName = (id) => CHAKRA_DATA.find((c) => c.id === id)?.name ?? '—';

  const chakraCounts = useMemo(() => {
    const counts = {};
    CHAKRA_DATA.forEach((c) => { counts[c.id] = 0; });
    entries.forEach((e) => {
      if (e.chakraId) counts[e.chakraId] = (counts[e.chakraId] || 0) + 1;
    });
    return counts;
  }, [entries]);

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayStart = d.getTime();
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const dayEnd = next.getTime();
      const count = entries.filter((e) => {
        const t = new Date(e.createdAt).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;
      days.push({ label: d.toLocaleDateString(undefined, { weekday: 'short' }), date: d, count });
    }
    return days;
  }, [entries]);

  const maxChakra = Math.max(1, ...Object.values(chakraCounts));
  const maxDay = Math.max(1, ...last7Days.map((d) => d.count));

  const handleDeleteEntry = async (id) => {
    const ok = window.confirm('Delete this reflection permanently?');
    if (!ok) return;
    try {
      await api.admin.deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast({ status: 'success', title: 'Entry deleted' });
    } catch {
      toast({ status: 'error', title: 'Failed to delete entry' });
    }
  };

  const handleChangeUserRole = async (id, nextRole) => {
    try {
      const updated = await api.admin.updateUser(id, { role: nextRole });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast({
        status: 'success',
        title: `Role updated to ${nextRole}`,
      });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to update role';
      toast({ status: 'error', title: msg });
    }
  };

  const handleDeleteUser = async (id) => {
    const ok = window.confirm(
      'Delete this user and all of their reflections? This cannot be undone.'
    );
    if (!ok) return;
    try {
      await api.admin.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setEntries((prev) => prev.filter((e) => e.userId !== id));
      toast({ status: 'success', title: 'User deleted' });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to delete user';
      toast({ status: 'error', title: msg });
    }
  };

  const handleEditUser = async (userRecord) => {
    const newName = window.prompt('Update name', userRecord.name || '');
    if (newName === null) return;
    const trimmed = newName.trim();
    if (!trimmed) {
      toast({ status: 'error', title: 'Name cannot be empty' });
      return;
    }

    const newEmail = window.prompt('Update email', userRecord.email || '');
    if (newEmail === null) return;
    const emailTrimmed = newEmail.trim();
    if (!emailTrimmed) {
      toast({ status: 'error', title: 'Email cannot be empty' });
      return;
    }

    try {
      const updated = await api.admin.updateUser(userRecord.id, {
        name: trimmed,
        email: emailTrimmed,
      });
      setUsers((prev) => prev.map((u) => (u.id === userRecord.id ? updated : u)));
      toast({ status: 'success', title: 'User updated' });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to update user';
      toast({ status: 'error', title: msg });
    }
  };

  const handleEditEntry = async (entry) => {
    const newBody = window.prompt('Update reflection text', entry.body || '');
    if (newBody === null) return;
    const bodyTrimmed = newBody.trim();
    if (!bodyTrimmed) {
      toast({ status: 'error', title: 'Reflection cannot be empty' });
      return;
    }

    try {
      const updated = await api.admin.updateEntry(entry.id, { body: bodyTrimmed });
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? updated : e)));
      toast({ status: 'success', title: 'Reflection updated' });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to update reflection';
      toast({ status: 'error', title: msg });
    }
  };

  const handleExportJSON = () => {
    const data = JSON.stringify(entries, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chautari-reflections-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = 'Date,Chakra,Reflection\n';
    const rows = [...entries]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((e) => {
        const date = new Date(e.createdAt).toISOString();
        const chakra = chakraName(e.chakraId);
        const body = (e.body || '').replace(/"/g, '""').replace(/\n/g, ' ');
        return `"${date}","${chakra}","${body}"`;
      });
    const csv = headers + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chautari-reflections-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={20}>
        <HStack justify="center" py={20}>
          <Spinner size="lg" colorScheme="brand" />
        </HStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={20}>
      <Heading mb={10}>System Oversight</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mb={10}>
        <Box className="glass-card" p={8}>
          <Stat>
            <StatLabel>Total Reflections</StatLabel>
            <StatNumber>{entries.length}</StatNumber>
          </Stat>
        </Box>
        <Box className="glass-card" p={8}>
          <Stat>
            <StatLabel>Reflections Today</StatLabel>
            <StatNumber>{reflectionsToday}</StatNumber>
          </Stat>
        </Box>
        <Box className="glass-card" p={8}>
          <Stat>
            <StatLabel>Server Status</StatLabel>
            <StatNumber color="green.500">Optimal</StatNumber>
          </Stat>
        </Box>
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={10}>
        <Box className="glass-card" p={8}>
          <Heading size="md" mb={4}>
            Chakra distribution
          </Heading>
          <Text fontSize="sm" color="gray.500" mb={4}>
            Reflections per energy center (all time)
          </Text>
          <VStack align="stretch" spacing={3}>
            {CHAKRA_DATA.map((c) => {
              const count = chakraCounts[c.id] || 0;
              return (
                <Box key={c.id}>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm" fontWeight="500">
                      {c.name}
                    </Text>
                    <Badge colorScheme="green" variant="subtle">
                      {count}
                    </Badge>
                  </HStack>
                  <Progress
                    value={maxChakra ? (count / maxChakra) * 100 : 0}
                    size="sm"
                    borderRadius="full"
                    colorScheme="green"
                    bg="gray.100"
                    sx={{ '& > div': { bg: c.color } }}
                  />
                </Box>
              );
            })}
          </VStack>
        </Box>
        <Box className="glass-card" p={8}>
          <Heading size="md" mb={4}>
            Activity (last 7 days)
          </Heading>
          <Text fontSize="sm" color="gray.500" mb={4}>
            Reflections per day
          </Text>
          <HStack spacing={2} align="flex-end" h="120px">
            {last7Days.map((d) => (
              <VStack key={d.label} flex={1} spacing={1}>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  {d.label}
                </Text>
                <Box
                  flex={1}
                  w="100%"
                  minH="40px"
                  display="flex"
                  alignItems="flex-end"
                  justifyContent="center"
                >
                  <Box
                    w="100%"
                    maxW="24px"
                    h={`${maxDay ? (d.count / maxDay) * 80 + 10 : 10}%`}
                    minH={d.count ? '8px' : '4px'}
                    bg="brand.400"
                    borderRadius="md"
                    title={`${d.count} reflection(s)`}
                  />
                </Box>
                <Text fontSize="xs" fontWeight="600">
                  {d.count}
                </Text>
              </VStack>
            ))}
          </HStack>
        </Box>
      </SimpleGrid>

      <Box className="glass-card" p={8}>
        <HStack justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
          <Heading size="md">Recent Activity</Heading>
          <HStack>
            <Button size="sm" variant="outline" borderRadius="full" onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button size="sm" variant="outline" borderRadius="full" onClick={handleExportJSON}>
              Export JSON
            </Button>
          </HStack>
        </HStack>
        {recentEntries.length === 0 ? (
          <Text color="gray.500" fontSize="sm">
            No reflections in the system yet.
          </Text>
        ) : (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Chakra</Th>
                <Th>Reflection</Th>
                <Th>Seeker</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recentEntries.map((e) => (
                <Tr key={e.id}>
                  <Td whiteSpace="nowrap">
                    {new Date(e.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Td>
                  <Td>
                    <Badge colorScheme="green" variant="subtle">
                      {chakraName(e.chakraId)}
                    </Badge>
                  </Td>
                  <Td maxW="300px">
                    <Text noOfLines={1} title={e.body}>
                      {e.body || '—'}
                    </Text>
                  </Td>
                  <Td fontSize="xs" color="gray.500">
                    {e.userName || e.userEmail || 'Seeker'}
                  </Td>
                  <Td textAlign="right">
                    <HStack spacing={2} justify="flex-end">
                      <Button
                        size="xs"
                        variant="outline"
                        borderRadius="full"
                        onClick={() => handleEditEntry(e)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="red"
                        borderRadius="full"
                        onClick={() => handleDeleteEntry(e.id)}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      <Box className="glass-card" p={8} mt={10}>
        <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
          <Heading size="md">Seekers</Heading>
          <Text fontSize="sm" color="gray.500">
            All registered users
          </Text>
        </HStack>
        {users.length === 0 ? (
          <Text color="gray.500" fontSize="sm">
            No users found yet.
          </Text>
        ) : (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Member since</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((u) => (
                <Tr key={u.id}>
                  <Td>{u.name}</Td>
                  <Td>{u.email}</Td>
                  <Td>
                    <Badge colorScheme={u.role === 'admin' ? 'purple' : 'green'}>{u.role}</Badge>
                  </Td>
                  <Td>
                    {u.memberSince
                      ? new Date(u.memberSince).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </Td>
                  <Td textAlign="right">
                    <HStack spacing={2} justify="flex-end">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleEditUser(u)}
                      >
                        Edit
                      </Button>
                      {u.role === 'user' ? (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleChangeUserRole(u.id, 'admin')}
                        >
                          Make admin
                        </Button>
                      ) : (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleChangeUserRole(u.id, 'user')}
                        >
                          Make user
                        </Button>
                      )}
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="red"
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </Container>
  );
}