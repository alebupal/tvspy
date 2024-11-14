import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';

interface DebugContextType {
    debugMode: boolean;
    setDebugMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

interface DebugProviderProps {
    children: ReactNode;
}

const DebugProvider: React.FC<DebugProviderProps> = ({ children }) => {
    const [debugMode, setDebugMode] = useState<boolean>(false);

    useEffect(() => {
        // Verificar si el estado de debugMode ya está almacenado en localStorage
        const storedDebugMode = localStorage.getItem('debug_mode');
        if (storedDebugMode) {
            // Convertir 'true' o 'false' almacenados como cadena a booleano
            setDebugMode(storedDebugMode === 'true');
        } else {
            // Si no existe, realizar la petición a la API para obtener el valor
            const fetchDebugConfig = async () => {
                try {
                    const response = await axios.get(API_ENDPOINTS.DEBUG_MODE); // Endpoint para obtener la configuración
                    const config = response.data.value === '1'; // Convertir 1 a true y 0 a false
                    setDebugMode(config);
                    localStorage.setItem('debug_mode', config.toString());
                } catch (error) {
                    console.error('Error fetching debug configuration:', error);
                }
            };

            fetchDebugConfig();
        }
    }, []);

    return (
        <DebugContext.Provider value={{ debugMode, setDebugMode }}>
            {children}
        </DebugContext.Provider>
    );
};

const useDebug = (): DebugContextType => {
    const context = React.useContext(DebugContext);
    if (!context) {
        throw new Error('useDebug must be used within a DebugProvider');
    }
    return context;
};

export { DebugProvider, useDebug };