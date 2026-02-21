import {
  Box,
  Flex,
  HStack,
  Image,
  Heading,
  Button,
  Avatar,
  IconButton,
  Container,
  Text,
  SimpleGrid,
  Link,
  VStack
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

/**
 *
 * @param {Object} props
 * @param {boolean} props.isLoggedIn - Whether a user is authenticated.
 * @param {'admin' | 'user' | null} props.userRole - Current role.
 * @param {string | null} props.userName - Current user's display name.
 * @param {() => void} props.onAuthOpen - Opens the authentication modal.
 * @param {() => void} props.onSideOpen - Opens the profile/sidebar drawer.
 */
export const Header = ({ isLoggedIn, userRole, userName, onAuthOpen, onSideOpen }) => {
  const navigate = useNavigate();

  const firstName = userName ? userName.split(' ')[0] : null;

  return (
    <Box
      as="nav"
      h="80px"
      bg="white"
      position="fixed"
      w="100%"
      zIndex="1000"
      borderBottom="1px solid"
      borderColor="gray.50"
    >
      <Container maxW="container.xl" h="100%">
        <Flex h="100%" align="center" justify="space-between">
          <HStack spacing={4} cursor="pointer" onClick={() => navigate('/')}>
            <Image
              src="/assets/logo.png"
              boxSize="40px"
              borderRadius="full"
              objectFit="cover"
              fallbackSrc="https://via.placeholder.com/40"
            />
            <Heading size="md" fontWeight="500">
              चौतारी
            </Heading>
          </HStack>
          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              Home
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              Journal
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              Admin
            </Button>
          </HStack>
          <HStack spacing={4}>
            {!isLoggedIn ? (
              <>
                <Button
                  colorScheme="brand"
                  borderRadius="full"
                  size="sm"
                  px={6}
                  onClick={onAuthOpen}
                >
                  Get Started
                </Button>
                <IconButton
                  icon={<HamburgerIcon />}
                  variant="ghost"
                  onClick={onSideOpen}
                  borderRadius="full"
                  aria-label="Open menu"
                />
              </>
            ) : (
              <HStack>
                <Text fontSize="xs" fontWeight="bold" color="brand.500">
                  {firstName || userRole?.toUpperCase() || 'USER'}
                </Text>
                <Avatar size="sm" bg="brand.500" cursor="pointer" onClick={onSideOpen} />
              </HStack>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

/**

 */
export const Footer = () => (
  <Box bg="gray.900" color="white" py={20} mt={16}>
    <Container maxW="container.xl">
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
        <VStack align="start">
          <Heading size="md">Chautari</Heading>
          <Text color="gray.400" fontSize="sm">
            A space to set your burdens down, take a breath, and listen to your soul.
          </Text>
        </VStack>
        <VStack align="start">
          <Text fontWeight="bold">Product</Text>
          <Link color="gray.400">Features</Link>
          <Link color="gray.400">Privacy</Link>
        </VStack>
        <VStack align="start">
          <Text fontWeight="bold">Support</Text>
          <Text color="gray.400">help@chautari.com</Text>
        </VStack>
      </SimpleGrid>
    </Container>
  </Box>
);