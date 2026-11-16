import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7DD3FC', light: '#BAE6FD', dark: '#38BDF8', contrastText: '#082238' },
    secondary: { main: '#E8CB91' },
    background: { default: '#0D1727', paper: '#17263A' },
    text: { primary: '#EDF5FF', secondary: '#AABED0' },
    divider: '#30455D',
    error: { main: '#FF8A85' },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
    h3: { fontWeight: 900 },
    h4: { fontWeight: 900 },
    h6: { fontWeight: 800 },
    button: { textTransform: 'none', fontWeight: 800 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiCard: { styleOverrides: { root: { border: '1px solid #30455D' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});