// File: src/context/ClientContext.tsx (Versión Final con Array)

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { API_BASE_URL } from '../constants';
import { ClientProfile } from '../types/types';

// 1. EL CONTRATO ACTUALIZADO: `clients` ahora es un array de perfiles de cliente.
interface IClientContext {
  clients: ClientProfile[];
  activeClientId: string | null;
  setActiveClientId: (clientId: string | null) => void;
  isLoading: boolean;
  fetchClients: () => Promise<void>;
  error: string | null;
}

const ClientContext = createContext<IClientContext | undefined>(undefined);

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 2. EL ESTADO ACTUALIZADO: Se inicializa como un array vacío.
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeClientId, setActiveClientId] = useState<string | null>(() => {
    return localStorage.getItem('lastActiveClientId');
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Si hay un cliente activo, lo guardamos en localStorage.
    if (activeClientId) {
      localStorage.setItem('lastActiveClientId', activeClientId);
    } else {
      // Si no hay ninguno, limpiamos la memoria.
      localStorage.removeItem('lastActiveClientId');
    }
  }, [activeClientId]); // Se dispara solo cuando cambia el cliente activo.

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients`);
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data: ClientProfile[] = await response.json();
      if (data.length === 0) {
        setError("El archivo de clientes está vacío. Añade un cliente en 'Gestor de Clientes' para empezar.");
      }
      setClients(data);

      // --- LÓGICA MEJORADA ---
      // Si después de cargar, AÚN no hay un cliente activo (porque era la primera vez que se usaba la app),
      // entonces seleccionamos el primero de la lista.
      if (!localStorage.getItem('lastActiveClientId') && data.length > 0) {
        setActiveClientId(data[0].clientId);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setIsLoading(false);
    }
  }, []); // Ya no depende de activeClientId


  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const value = { clients, activeClientId, setActiveClientId, isLoading, error, fetchClients };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClientContext = (): IClientContext => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClientContext must be used within a ClientProvider');
  }
  return context;
};