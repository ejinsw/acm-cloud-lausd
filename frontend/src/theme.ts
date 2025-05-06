import { createTheme } from '@mantine/core';

export const Theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'var(--font-sans)',
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'xs',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
        shadow: 'xs',
      },
    },
  },
  colors: {
    // LAUSD color scheme
    'lausd-blue': [
      '#E9F0FF',
      '#C9DBFF',
      '#A6C4FF',
      '#83ADFF',
      '#5F96FE',
      '#3C7FFE',
      '#1968FE',
      '#0051EB',
      '#0043C3',
      '#00369A',
    ],
    'lausd-gold': [
      '#FFF8E1',
      '#FFEDB3',
      '#FFE285',
      '#FFD757',
      '#FFCC29',
      '#FFC200',
      '#E6AF00',
      '#CC9C00',
      '#B38900',
      '#997500',
    ],
    'lausd-gray': [
      '#F8F9FA',
      '#E9ECEF',
      '#DEE2E6',
      '#CED4DA',
      '#ADB5BD',
      '#6C757D',
      '#495057',
      '#343A40',
      '#212529',
      '#1A1D1F',
    ],
  },
}); 