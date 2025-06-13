import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AppRouter from './routes/AppRouter.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/authContext.jsx';

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
      <AuthProvider>
        <AppRouter />
        <ToastContainer />
      </AuthProvider>

    </ThemeProvider>
  );
}

export default App;
