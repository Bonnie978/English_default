import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: ${theme.colors.background};
    color: ${theme.colors.text.primary};
    line-height: 1.5;
    font-size: 16px;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.md};
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
  }
`; 