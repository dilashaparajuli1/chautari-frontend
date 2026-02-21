import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  Image,
  Divider
} from '@chakra-ui/react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { CHAKRA_DATA } from '../chakraData';

const MotionBox = motion(Box);

/**
 
 *
 * @param {Object} props
 * @param {() => void} props.onAuth 
 */
export default function Landing({ onAuth }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-80, 80], [12, -12]);
  const rotateY = useTransform(x, [-80, 80], [-12, 12]);

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    x.set(dx);
    y.set(dy);
  };

  const resetTilt = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Box bg="gray.50" minH="100vh">
      <Container maxW="container.xl" pt={10} pb={20}>
        {/* Hero: heading on top, then image centered below */}
        <VStack spacing={8} align="center" textAlign="center" mb={12}>
          <Heading
            as="h1"
            fontFamily="devanagari"
            fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
            lineHeight="1.2"
            color="brand.600"
            fontWeight="600"
            maxW="4xl"
            letterSpacing="-0.02em"
          >
            जहाँ विचार विश्राम गर्छन्  
          </Heading>
          <Text
            as="p"
            fontFamily="body"
            fontSize={{ base: 'lg', md: 'xl' }}
            color="gray.600"
            fontWeight="400"
            lineHeight="1.65"
            maxW="lg"
            letterSpacing="0.01em"
          >
            Where each emotion meets its root, and every thought finds balance.
          </Text>
          <Button
            size="lg"
            colorScheme="brand"
            borderRadius="full"
            px={10}
            py={7}
            fontSize="md"
            fontWeight="600"
            letterSpacing="0.02em"
            boxShadow="0 4px 14px 0 rgba(74, 97, 76, 0.35)"
            _hover={{
              boxShadow: '0 6px 20px 0 rgba(74, 97, 76, 0.45)',
              transform: 'translateY(-1px)',
            }}
            _active={{ transform: 'translateY(0)' }}
            transition="all 0.2s ease"
            onClick={onAuth}
          >
            Begin Journey
          </Button>
        </VStack>

        <Box
          w="100%"
          overflow="hidden"
          borderRadius="3xl"
          boxShadow="2xl"
          mb={{ base: 16, md: 24 }}
        >
          <MotionBox
            className="hero-float"
            onMouseMove={handleMove}
            onMouseLeave={resetTilt}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            w="100%"
            minH={{ base: '240px', md: '320px', lg: '400px' }}
          >
            <Image
              src="/assets/chautari.png"
              fallbackSrc="https://via.placeholder.com/1200x400"
              w="100%"
              h="100%"
              minH={{ base: '240px', md: '320px', lg: '400px' }}
              objectFit="cover"
              objectPosition="center"
            />
          </MotionBox>
        </Box>

        {/* About Chautari */}
        <Box mt={{ base: 16, md: 24 }} mb={16}>
          <Box
            className="glass-card"
            p={{ base: 8, md: 12 }}
            maxW="4xl"
            mx="auto"
          >
            <Heading
              as="h2"
              fontFamily="heading"
              size="lg"
              color="brand.900"
              mb={4}
              fontWeight="600"
            >
              About Chautari
            </Heading>
            <Divider borderColor="brand.100" mb={6} />
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="gray.700"
              lineHeight="1.8"
              textAlign="left"
            >
              चौतारी is a sacred space for rest and reflection named after the traditional stone platforms found under the shade of ancient trees. We believe that a human being is like a living tree where the inner spirit represents the roots and the outer life represents the branches. Just as a tree cannot reach toward the sky without deep roots in the earth, we cannot truly care for the world around us without first tending to our own internal energy. Our chakra system helps you map these connections to ensure your inner foundation is strong enough to support your external growth. By focusing within, you discover that your personal healing is the greatest gift you can offer to the collective world. Chautari is here to remind you that you are a complete and beautiful whole and that your inner peace is the primary source of your outer power.
            </Text>
          </Box>
        </Box>

        {/* Seven Chakras*/}
        <Heading
          as="h2"
          fontFamily="heading"
          size="lg"
          color="brand.900"
          fontWeight="600"
          textAlign="center"
          mb={8}
        >
          The Seven Chakras
        </Heading>
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
          spacing={6}
          mb={20}
        >
          {CHAKRA_DATA.map((chakra) => (
            <Box
              key={chakra.id}
              className="glass-card"
              p={5}
              borderRadius="xl"
              textAlign="center"
              borderLeft="4px solid"
              borderLeftColor={chakra.color}
            >
              <Image
                src={chakra.image}
                alt={chakra.name}
                borderRadius="lg"
                boxSize="80px"
                objectFit="cover"
                mx="auto"
                mb={3}
                fallbackSrc="https://via.placeholder.com/80"
              />
              <Heading as="h3" size="sm" color="gray.800" mb={1}>
                {chakra.name}
              </Heading>
              <Text fontSize="xs" color="gray.500" fontStyle="italic" mb={2}>
                {chakra.sanskrit}
              </Text>
              <Text fontSize="sm" color="gray.600" lineHeight="tall">
                {chakra.landingDescription}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
