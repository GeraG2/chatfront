import React, { createContext, useState, useMemo, useContext } from 'react';
import { createTheme, ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';

// Contexto para el cambio de color
const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Detectar preferencia del sistema
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#2563eb', // Un azul más moderno (Tailwind blue-600)
          },
          secondary: {
            main: '#ec4899', // Un rosa moderno para acentos
          },
          background: {
            default: mode === 'light' ? '#f8fafc' : '#0f172a', // Slate-50 vs Slate-900
            paper: mode === 'light' ? '#ffffff' : '#1e293b',
          },
        },
        shape: {
          borderRadius: 12, // Bordes más redondeados = más moderno
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none', // Quitar mayúsculas forzadas
                fontWeight: 600,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none', // Quitar gradientes por defecto en modo oscuro
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline normaliza los estilos y aplica el color de fondo */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};