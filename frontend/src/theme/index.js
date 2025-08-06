import { createTheme } from '@mui/material/styles';

// Design tokens for consistency
export const designTokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  shadows: {
    card: '0 4px 20px rgba(0, 0, 0, 0.15)',
    elevated: '0 8px 32px rgba(0, 0, 0, 0.2)',
    modal: '0 16px 64px rgba(0, 0, 0, 0.25)',
  },
};

// Dark color palette
export const colors = {
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  secondary: {
    50: '#f3e5f5',
    100: '#e1bee7',
    200: '#ce93d8',
    300: '#ba68c8',
    400: '#ab47bc',
    500: '#9c27b0',
    600: '#8e24aa',
    700: '#7b1fa2',
    800: '#6a1b9a',
    900: '#4a148c',
  },
  success: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50',
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
  warning: {
    50: '#fff8e1',
    100: '#ffecb3',
    200: '#ffe082',
    300: '#ffd54f',
    400: '#ffca28',
    500: '#ffc107',
    600: '#ffb300',
    700: '#ffa000',
    800: '#ff8f00',
    900: '#ff6f00',
  },
  error: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336',
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  dark: {
    main: '#121212',
    light: '#1e1e1e',
    medium: '#2a2a2a',
    card: '#1e1e1e',
    paper: '#252525',
    border: '#333333',
  },
};

// Enhanced dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary[500],
      light: colors.primary[400],
      dark: colors.primary[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary[500],
      light: colors.secondary[400],
      dark: colors.secondary[700],
      contrastText: '#ffffff',
    },
    error: {
      main: colors.error[500],
      light: colors.error[400],
      dark: colors.error[700],
      contrastText: '#ffffff',
    },
    warning: {
      main: colors.warning[500],
      light: colors.warning[400],
      dark: colors.warning[700],
      contrastText: '#000000',
    },
    info: {
      main: colors.primary[500],
      light: colors.primary[400],
      dark: colors.primary[700],
      contrastText: '#ffffff',
    },
    success: {
      main: colors.success[500],
      light: colors.success[400],
      dark: colors.success[700],
      contrastText: '#ffffff',
    },
    background: {
      default: colors.dark.main,
      paper: colors.dark.paper,
    },
    text: {
      primary: '#ffffff',
      secondary: colors.gray[400],
    },
    divider: colors.dark.border,
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#ffffff',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#ffffff',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#ffffff',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#ffffff',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#ffffff',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#ffffff',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: colors.gray[300],
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: colors.gray[400],
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: designTokens.borderRadius.md,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: colors.dark.light,
          },
          '&::-webkit-scrollbar-thumb': {
            background: colors.gray[700],
            borderRadius: '4px',
            '&:hover': {
              background: colors.gray[600],
            },
          },
          backgroundColor: colors.dark.main,
          color: '#ffffff',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: designTokens.borderRadius.md,
          padding: '10px 20px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: designTokens.shadows.card,
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: designTokens.shadows.elevated,
          },
        },
        outlined: {
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.lg,
          boxShadow: designTokens.shadows.card,
          border: `1px solid ${colors.dark.border}`,
          backgroundColor: colors.dark.card,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: designTokens.shadows.elevated,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.lg,
          backgroundColor: colors.dark.paper,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: designTokens.shadows.card,
        },
        elevation2: {
          boxShadow: designTokens.shadows.elevated,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: designTokens.borderRadius.md,
            backgroundColor: colors.dark.medium,
            '& fieldset': {
              borderColor: colors.dark.border,
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: colors.gray[600],
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary[500],
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: `1px solid ${colors.dark.border}`,
          backgroundColor: colors.dark.main,
          color: '#ffffff',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.md,
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: designTokens.borderRadius.lg,
          boxShadow: designTokens.shadows.modal,
          backgroundColor: colors.dark.paper,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.dark.border}`,
        },
        head: {
          backgroundColor: colors.dark.medium,
          fontWeight: 600,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.sm,
          height: 8,
          backgroundColor: colors.dark.border,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.primary[700],
          color: '#ffffff',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.md,
          '&:hover': {
            backgroundColor: colors.dark.medium,
          },
        },
      },
    },
  },
});

export default darkTheme;