import React, { useMemo, useState } from 'react';
import {
  Container,
  SimpleGrid,
  Box,
  Image,
  Text,
  Heading,
  Textarea,
  Button,
  VStack,
  useToast
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { CHAKRA_DATA } from '../chakraData';

const MotionBox = motion(Box);

/**
 *
 * @param {Object} props
 * @param {(entry: { body: string; chakraId: string | null }) => void} props.onSave - Persist handler.
 */
export default function NewEntry({ onSave }) {
  const [selectedId, setSelectedId] = useState(null);
  const [body, setBody] = useState('');
  const toast = useToast();

  const selected = useMemo(
    () => CHAKRA_DATA.find((c) => c.id === selectedId) || null,
    [selectedId]
  );

  const auraClass = selected ? `aura-bg-${selected.id}` : '';

  const handleSave = () => {
    if (!body.trim()) {
      toast({
        title: 'Write something first',
        status: 'warning',
        duration: 1500,
        isClosable: true
      });
      return;
    }
    onSave({
      body,
      chakraId: selected ? selected.id : null
    });
    toast({
      title: 'Reflection saved',
      status: 'success',
      duration: 1500,
      isClosable: true
    });
    setBody('');
    setSelectedId(null);
  };

  return (
    <Box className={auraClass}>
      <Container maxW="container.lg" py={20}>
        <Heading mb={4}>Which energy is speaking today?</Heading>
        <Text mb={8} color="gray.600">
          Before you find the words, just feel. Which energy on the tree feels like home right now?
        </Text>
        <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={4} mb={10}>
          {CHAKRA_DATA.map((c) => (
            <MotionBox
              key={c.id}
              p={4}
              borderRadius="2xl"
              border="2px solid"
              cursor="pointer"
              borderColor={selectedId === c.id ? 'brand.500' : 'transparent'}
              bg={selectedId === c.id ? 'white' : 'whiteAlpha.700'}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedId(c.id)}
            >
              <VStack spacing={1}>
                <Image src={c.image} alt={c.name} boxSize="50px" borderRadius="full" fallbackSrc="https://via.placeholder.com/50" />
                <Text fontWeight="bold" fontSize="sm">
                  {c.name}
                </Text>
                <Text fontSize="10px" color="gray.500">
                  {c.emotion}
                </Text>
              </VStack>
            </MotionBox>
          ))}
        </SimpleGrid>
        <VStack spacing={6} className="glass-card" p={10} align="stretch">
          <Heading size="md">
            {selected ? `Reflecting on ${selected.name}` : 'Start a new reflection'}
          </Heading>
          {selected && (
            <>
              <Text fontSize="sm" color="gray.600">
                <strong>Core balance:</strong> {selected.coreBalance}
              </Text>
              <Text fontSize="sm" color="gray.500" fontStyle="italic">
                Journal prompt: {selected.prompt}
              </Text>
            </>
          )}
          <Textarea
            placeholder="How does this center feel today?"
            minH="220px"
            fontSize="lg"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button w="100%" size="lg" colorScheme="brand" onClick={handleSave}>
            Save Reflection
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}