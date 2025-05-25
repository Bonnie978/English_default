import React from 'react';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import { LearningProvider } from './contexts/LearningContext';
import AppRouter from './routes';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider>
        <LearningProvider>
          <AppRouter />
        </LearningProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
