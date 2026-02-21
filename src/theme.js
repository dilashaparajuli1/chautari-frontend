import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: "'Cormorant Garamond', serif",
    body: "'Outfit', sans-serif",
    devanagari: "'Noto Serif Devanagari', serif",
  },
  colors: {
    brand: {
      50: '#FDFCFB',
      100: '#E8F0E9',
      500: '#5F7A61', // Forest Green
      600: '#4A614C',
      900: '#2D3A30',
    },
  },
});

export default theme;