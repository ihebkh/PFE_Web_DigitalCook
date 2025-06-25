import React from 'react';
import AppRouter from './routes/AppRouter';
import { ThemeProvider } from './context/themeContext';

function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}

export default App; 