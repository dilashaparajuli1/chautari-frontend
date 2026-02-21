import React, { useMemo, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  VStack,
  Input,
  Button,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  IconButton,
  Progress,
  Text,
  Box,
  Link,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useToast } from '@chakra-ui/react';


import { api } from '../api';

/**

 *
 * @param {string} password
 * @returns {{ score: number, label: string }}
 */
const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score += 30;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 30;

  let label = 'Weak';
  if (score >= 70) label = 'Strong';
  else if (score >= 40) label = 'Medium';

  return { score, label };
};

const strengthColor = (label) => {
  if (label === 'Strong') return 'green.500';
  if (label === 'Medium') return 'orange.500';
  return 'red.400';
};

/**
 
 *
 * @param {Object} props
 * @param {boolean} props.isOpen 
 * @param {() => void} props.onClose 
 * @param {(user: { email: string; role: 'admin' | 'user' }) => void} props.onLogin
 */
export default function AuthModal({ isOpen, onClose, onLogin }) {
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email]
  );
  const { score, label } = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  const isSignUp = activeTab === 1;
  const canSubmitCredentials = emailValid && password.length >= 8 && (!isSignUp || name.trim().length >= 2);

  const handleSubmit = async () => {
    if (!canSubmitCredentials) {
      toast({
        title: 'Check your details',
        description: isSignUp
          ? 'Use a valid email, a name (2+ characters), and a stronger password.'
          : 'Use a valid email and password (at least 8 characters).',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const normalizedEmail = email.toLowerCase().trim();
      let result;
      if (isSignUp) {
        result = await api.auth.register(normalizedEmail, password, name.trim());
      } else {
        result = await api.auth.login(normalizedEmail, password);
      }
      setPassword('');
      setEmail('');
      setName('');
      onClose();
      onLogin({ user: result.user, token: result.token });

      const welcomeEmailStatus = isSignUp ? result?.email?.welcome : null;
      const emailStatusLine =
        isSignUp && welcomeEmailStatus
          ? welcomeEmailStatus === 'sent'
            ? `Welcome email sent to ${normalizedEmail}.`
            : welcomeEmailStatus === 'skipped'
              ? 'Welcome email not sent (email is not configured on the server).'
              : 'Welcome email could not be sent (check server logs).'
          : null;

      toast({
        title: isSignUp ? 'Account created' : 'Welcome back',
        description: [
          `Signed in as ${result.user.role === 'admin' ? 'Administrator' : 'User'}.`,
          emailStatusLine,
        ]
          .filter(Boolean)
          .join(' '),
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      const msg = err.response?.data?.error || (isSignUp ? 'Registration failed' : 'Sign in failed');
      toast({
        title: msg,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => (
    <VStack spacing={5} align="stretch">
      {isSignUp && (
        <FormControl>
          <FormLabel fontWeight="500" color="gray.700">
            Name
          </FormLabel>
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="lg"
            borderRadius="xl"
            borderColor="gray.200"
            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
            _placeholder={{ color: 'gray.400' }}
          />
        </FormControl>
      )}
      <FormControl isInvalid={email.length > 0 && !emailValid}>
        <FormLabel fontWeight="500" color="gray.700">
          Email
        </FormLabel>
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          size="lg"
          borderRadius="xl"
          borderColor="gray.200"
          _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
          _placeholder={{ color: 'gray.400' }}
          _invalid={{ borderColor: 'red.400', _focus: { borderColor: 'red.500' } }}
        />
      </FormControl>
      <FormControl>
        <FormLabel fontWeight="500" color="gray.700">
          Password
        </FormLabel>
        <InputGroup size="lg">
          <Input
            type={show ? 'text' : 'password'}
            placeholder={isSignUp ? 'At least 8 characters, mix of letters & numbers' : 'Password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            borderRadius="xl"
            borderColor="gray.200"
            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
            _placeholder={{ color: 'gray.400' }}
            pr="3rem"
          />
          <InputRightElement width="3rem" top="50%" transform="translateY(-50%)">
            <IconButton
              size="sm"
              icon={show ? <ViewOffIcon /> : <ViewIcon />}
              onClick={() => setShow((prev) => !prev)}
              variant="ghost"
              colorScheme="gray"
              aria-label="Toggle password visibility"
              borderRadius="lg"
            />
          </InputRightElement>
        </InputGroup>
        {password && (
          <Box mt={2}>
            <Progress
              value={score}
              size="sm"
              borderRadius="full"
              colorScheme={label === 'Strong' ? 'green' : label === 'Medium' ? 'orange' : 'red'}
              bg="gray.100"
            />
            <Text fontSize="sm" color={strengthColor(label)} mt={1} fontWeight="500">
              Strength: {label}
            </Text>
          </Box>
        )}
      </FormControl>
      {!isSignUp && (
        <Box w="100%" textAlign="right">
          <Link
            fontSize="sm"
            color="gray.500"
            _hover={{ color: 'brand.500' }}
            onClick={() => {
              toast({
                title: 'Reset password',
                description: 'Contact support@chautari.com to reset your password.',
                status: 'info',
                duration: 4000,
                isClosable: true,
              });
            }}
          >
            Forgot password?
          </Link>
        </Box>
      )}
      <Button
        w="100%"
        size="lg"
        colorScheme="brand"
        onClick={handleSubmit}
        isLoading={isLoading}
        isDisabled={!canSubmitCredentials}
        borderRadius="xl"
        fontWeight="600"
        py={6}
        _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
        _active={{ transform: 'translateY(0)' }}
        transition="all 0.2s"
      >
        {isSignUp ? 'Create account' : 'Sign in'}
      </Button>
      {!isSignUp && (
        <Link
          fontSize="sm"
          color="gray.500"
          _hover={{ color: 'brand.500' }}
          onClick={() => {
            setEmail('admin@chautari.com');
            setPassword('Admin@123');
          }}
        >
          Admin? Sign in as administrator
        </Link>
      )}
    </VStack>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay backdropFilter="blur(12px)" bg="blackAlpha.300" />
      <ModalContent
        borderRadius="2xl"
        overflow="hidden"
        className="glass-card"
        boxShadow="0 24px 60px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(148, 163, 184, 0.12), 0 0 50px rgba(88, 129, 102, 0.2)"
      >
        <ModalCloseButton
          top={4}
          right={4}
          borderRadius="full"
          _hover={{ bg: 'blackAlpha.100' }}
          zIndex={2}
        />
        <ModalHeader pt={8} pb={2} textAlign="center">
          <Text fontFamily="heading" fontSize="2xl" fontWeight="600" color="brand.900">
            Welcome
          </Text>
          <Text fontSize="sm" color="gray.500" fontWeight="400" mt={1}>
            Sign in to your account or create a new one
          </Text>
        </ModalHeader>
        <ModalBody pb={8} pt={2}>
          <Tabs
            isFitted
            variant="unstyled"
            onChange={(idx) => setActiveTab(idx)}
            index={activeTab}
          >
            <TabList
              gap={2}
              p={1}
              bg="gray.50"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <Tab
                py={3}
                px={6}
                borderRadius="lg"
                fontWeight="500"
                color="gray.600"
                _hover={{ color: 'brand.600' }}
                _selected={{
                  bg: 'white',
                  color: 'brand.600',
                  fontWeight: 600,
                  boxShadow: 'sm',
                  borderWidth: '1px',
                  borderColor: 'gray.200',
                }}
                transition="all 0.2s"
              >
                Sign in
              </Tab>
              <Tab
                py={3}
                px={6}
                borderRadius="lg"
                fontWeight="500"
                color="gray.600"
                _hover={{ color: 'brand.600' }}
                _selected={{
                  bg: 'white',
                  color: 'brand.600',
                  fontWeight: 600,
                  boxShadow: 'sm',
                  borderWidth: '1px',
                  borderColor: 'gray.200',
                }}
                transition="all 0.2s"
              >
                Sign up
              </Tab>
            </TabList>
            <TabPanels pt={6}>
              <TabPanel px={0}>{renderForm()}</TabPanel>
              <TabPanel px={0}>{renderForm()}</TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
