
import React, { useState, useEffect, useCallback } from 'react';
import { ConfigData, NotificationState } from '../types';
import { API_BASE_URL } from '../constants';
import Notification from './Notification';

const initialConfigState: ConfigData = {
  GEMINI_MODEL: '',
  MAX_HISTORY_TURNS: '',
  DEFAULT_SYSTEM_INSTRUCTION: '',
};

const ConfigForm: React.FC = () => {
  const [config, setConfig] = useState<ConfigData>(initialConfigState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setNotification(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/config`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error HTTP: ${response.status}` }));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      const data: ConfigData = await response.json();
      setConfig({
        ...data,
        MAX_HISTORY_TURNS: data.MAX_HISTORY_TURNS === undefined ? '' : String(data.MAX_HISTORY_TURNS),
      });
    } catch (error) {
      console.error("Error al cargar la configuración:", error);
      setNotification({
        message: `Error al cargar la configuración: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchConfig is memoized by useCallback, but we only want to run this once on mount.

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prevConfig => ({
      ...prevConfig,
      [name]: name === 'MAX_HISTORY_TURNS' ? (value === '' ? '' : String(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    const maxHistoryTurns = config.MAX_HISTORY_TURNS === '' ? 0 : Number(config.MAX_HISTORY_TURNS);
    if (isNaN(maxHistoryTurns) || maxHistoryTurns < 0) {
        setNotification({ message: 'Turnos Máximos de Historial debe ser un número positivo o cero.', type: 'error' });
        setIsSaving(false);
        return;
    }

    try {
      const payload: ConfigData = {
        ...config,
        MAX_HISTORY_TURNS: maxHistoryTurns,
      };

      const response = await fetch(`${API_BASE_URL}/api/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error HTTP: ${response.status}`);
      }
      setNotification({
        message: result.message || "¡Configuración guardada! Reinicia el servidor para aplicar los cambios.",
        type: 'success',
      });
    } catch (error) {
      console.error("Error al guardar la configuración:", error);
      setNotification({
        message: `Error al guardar la configuración: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-lg text-gray-700 dark:text-gray-300">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-xl p-6 md:p-10 transform transition-all hover:scale-[1.01] duration-300">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="GEMINI_MODEL" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Modelo de Gemini
            </label>
            <input
              type="text"
              name="GEMINI_MODEL"
              id="GEMINI_MODEL"
              value={config.GEMINI_MODEL}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-slate-400"
              placeholder="Ej: gemini-2.5-flash-preview-04-17"
            />
          </div>

          <div>
            <label htmlFor="MAX_HISTORY_TURNS" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Turnos Máximos de Historial
            </label>
            <input
              type="number"
              name="MAX_HISTORY_TURNS"
              id="MAX_HISTORY_TURNS"
              value={config.MAX_HISTORY_TURNS}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-slate-400"
              placeholder="Ej: 10"
            />
          </div>

          <div>
            <label htmlFor="DEFAULT_SYSTEM_INSTRUCTION" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Personalidad por Defecto
            </label>
            <textarea
              name="DEFAULT_SYSTEM_INSTRUCTION"
              id="DEFAULT_SYSTEM_INSTRUCTION"
              rows={5}
              value={config.DEFAULT_SYSTEM_INSTRUCTION}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-slate-400"
              placeholder="Describe el rol y comportamiento del chatbot..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ConfigForm;
