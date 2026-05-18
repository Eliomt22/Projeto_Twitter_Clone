import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => localStorage.getItem('tema') || 'escuro');

  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema);
    localStorage.setItem('tema', tema);
  }, [tema]);

  const alternarTema = () => setTema(t => t === 'escuro' ? 'claro' : 'escuro');

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
