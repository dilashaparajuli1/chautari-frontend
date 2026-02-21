import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  VStack,
  Button,
  Divider,
  DrawerCloseButton,
  Text,
  Box
} from '@chakra-ui/react';
import { EditIcon, TimeIcon, LockIcon, StarIcon, SettingsIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const USER_NAV_ITEMS = [
  { heading: 'The Core', subheading: 'Dashboard', path: '/dashboard', icon: StarIcon },
  { heading: 'New Growth', subheading: 'New Entry', path: '/new-entry', icon: EditIcon },
  { heading: 'Inner Rings', subheading: 'History', path: '/history', icon: TimeIcon },
  { heading: 'The Spirit', subheading: 'Profile', path: '/profile', icon: null },
];

export default function Sidebar({ isOpen, onClose, userRole, onLogout }) {
  const navigate = useNavigate();

  const go = (path) => {
    navigate(path);
    onClose();
  };

  const navButton = (item) => {
    const Icon = item.icon;
    return (
      <Button
        key={item.path}
        variant="ghost"
        size="md"
        justifyContent="start"
        leftIcon={Icon ? <Icon color="brand.600" boxSize={4} /> : undefined}
        onClick={() => go(item.path)}
        py={3}
        px={4}
        _hover={{ bg: 'gray.50' }}
        _active={{ bg: 'gray.100' }}
        color="gray.800"
        fontWeight="normal"
        fontFamily="body"
      >
        <Box textAlign="left" w="100%">
          <Text fontFamily="heading" fontSize="sm" color="brand.600" fontWeight="bold" lineHeight="tight">
            {item.heading}
          </Text>
          <Text fontSize="xs" color="gray.500" fontWeight="400" mt={0.5}>
            {item.subheading}
          </Text>
        </Box>
      </Button>
    );
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay backdropFilter="blur(6px)" bg="blackAlpha.400" />
      <DrawerContent bg="white">
        <DrawerCloseButton mt={4} color="gray.600" _hover={{ bg: 'gray.100' }} />
        <DrawerHeader mt={8} fontFamily="heading" fontSize="3xl" fontWeight="800" color="brand.600">
          Roots
        </DrawerHeader>
        <DrawerBody pb={8}>
          <VStack align="stretch" spacing={1}>
            {userRole === 'user' && (
              <>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="wider" mt={2} mb={2}>
                  THE PATH
                </Text>
                {USER_NAV_ITEMS.map(navButton)}
              </>
            )}
            {userRole === 'admin' && (
              <>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="wider" mt={2} mb={2}>
                  ADMINISTRATION
                </Text>
                <Button
                  variant="ghost"
                  leftIcon={<SettingsIcon color="brand.600" boxSize={4} />}
                  justifyContent="start"
                  onClick={() => go('/admin')}
                  py={3}
                  px={4}
                  color="gray.800"
                  _hover={{ bg: 'gray.50' }}
                  fontFamily="body"
                >
                  System Oversight
                </Button>
              </>
            )}
            <Divider borderColor="gray.200" my={4} />
            <Button
              variant="outline"
              colorScheme="red"
              leftIcon={<LockIcon />}
              onClick={onLogout}
              fontFamily="body"
            >
              Logout
            </Button>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
