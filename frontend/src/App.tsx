import React from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import AppRouter from './routes/AppRouter.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/authContext.jsx';
import { ThemeProvider } from './context/themeContext';

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
    <MuiThemeProvider theme={theme}>
      <ThemeProvider>
        <CssBaseline />
        <AuthProvider>
          <AppRouter />
          <ToastContainer />
        </AuthProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;
