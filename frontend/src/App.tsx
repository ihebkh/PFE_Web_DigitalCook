import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AppRouter from './routes/AppRouter.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;