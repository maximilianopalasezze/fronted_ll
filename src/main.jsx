import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { HashRouter } from 'react-router-dom';
import { InventarioProvider } from './context/InventarioContext';
import { theme } from './theme';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <InventarioProvider>
          <App />
        </InventarioProvider>
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
);
