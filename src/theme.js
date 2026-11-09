import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#60A5FA', dark: '#2563EB', contrastText: '#FFFFFF' },
    secondary: { main: '#E9B764' },
    background: { default: '#0B1220', paper: '#152238' },
    text: { primary: '#F1F5F9', secondary: '#A9B8CB' },
    divider: '#2C3B50',
    success: { main: '#15845D' },
    warning: { main: '#D18C2D' },
    error: { main: '#C74848' },
  },
  typography: {
    fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif',
    h3: { fontWeight: 800, letterSpacing: '-0.045em' },
    h4: { fontWeight: 800, letterSpacing: '-0.035em' },
    h5: { fontWeight: 800, letterSpacing: '-0.028em' },
    h6: { fontWeight: 750, letterSpacing: '-0.02em' },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 10, padding: '10px 18px' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: { styleOverrides: { root: { border: '1px solid #2C3B50', boxShadow: '0 10px 35px rgba(0,0,0,0.18)' } } },
    MuiTextField: { defaultProps: { size: 'medium', variant: 'outlined' } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 11 } } },
    MuiTableCell: { styleOverrides: { head: { background: '#1C2B42', color: '#CBD5E1', fontWeight: 800, fontSize: '0.78rem' }, body: { borderBottomColor: '#29384F' } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 700 } } },
  },
});
