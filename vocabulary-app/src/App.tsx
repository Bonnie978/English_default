import React from 'react';
import { ThemeProvider } from 'styled-components';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { LearningProvider } from './contexts/LearningContext';
import AppRouter from './routes';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <SupabaseAuthProvider>
        <LearningProvider>
          <AppRouter />
        </LearningProvider>
      </SupabaseAuthProvider>
    </ThemeProvider>
  );
}

export default App;
