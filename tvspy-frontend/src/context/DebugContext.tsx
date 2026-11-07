import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import apiClient from '../api/client';

interface DebugContextType {
  debugMode: boolean;
  setDebugMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

interface DebugProviderProps {
  children: ReactNode;
}

export const DebugProvider: React.FC<DebugProviderProps> = ({ children }) => {
  const [debugMode, setDebugMode] = useState<boolean>(() => {
    return localStorage.getItem('debug_mode') === 'true';
  });

  useEffect(() => {
    const fetchDebugConfig = async () => {
      try {
        const response = await apiClient.get('/config/debug_mode');
        const isDebug = response.data?.value === '1' || response.data?.value === 'true';
        setDebugMode(isDebug);
        localStorage.setItem('debug_mode', isDebug.toString());
      } catch (error) {
        // silenciar si falla al inicio
      }
    };

    fetchDebugConfig();
  }, []);

  return (
    <DebugContext.Provider value={{ debugMode, setDebugMode }}>
      {children}
    </DebugContext.Provider>
  );
};

export const useDebug = (): DebugContextType => {
  const context = useContext(DebugContext);
  if (!context) {
    return {
      debugMode: false,
      setDebugMode: () => {},
    };
  }
  return context;
};
