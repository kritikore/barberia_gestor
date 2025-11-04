// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definimos el tipo de Tema
type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

// Creamos el contexto
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Creamos el Proveedor
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Por defecto, usamos el tema 'dark' (Urbano/Industrial)
  const [theme, setTheme] = useState<Theme>('dark'); 

  // Efecto que aplica el tema al <html>
  useEffect(() => {
    // 🔑 Aplicamos el tema al <html> (o <body>)
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Función para cambiar el tema
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar el tema fácilmente en otros componentes
export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};