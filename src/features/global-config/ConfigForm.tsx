// File: src/features/global-config/ConfigForm.tsx (Versión Final)

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Alert, Grid } from '@mui/material';
import { useClientContext } from '../../context/ClientContext';
import { API_BASE_URL } from '../../constants';
import { ClientProfile } from '../../types/types';

const ConfigForm: React.FC = () => {
  const { activeClientId, clients, fetchClients } = useClientContext();
  const [formData, setFormData] = useState<Partial<ClientProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Si tenemos un cliente activo seleccionado...
    if (activeClientId) {
      // Usamos .find() para buscar en el array 'clients' el objeto
      // cuyo 'clientId' coincida con el cliente activo.
      const currentClient = clients.find(client => client.clientId === activeClientId);
    
      // Si encontramos al cliente...
      if (currentClient) {
        // Cargamos sus datos en el estado del formulario.
        setFormData(currentClient);
      }
    } else {
      // Si no hay ningún cliente seleccionado, nos aseguramos de que el formulario esté vacío.
      setFormData({});
    }
  }, [activeClientId, clients]); // El efecto se dispara cada vez que cambia el cliente activo.

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeClientId) return;

    setIsSaving(true);
    setNotification(null);
    try {
      const payload = {
        ...formData,
        maxHistoryTurns: Number(formData.maxHistoryTurns) || 0, // Asegurarse de que es un número
      };

      const response = await fetch(`${API_BASE_URL}/api/clients/${activeClientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setNotification({ message: "¡Configuración guardada con éxito!", type: 'success' });
      fetchClients(); // Refresca los datos en toda la app

    } catch (error) {
      setNotification({ message: error instanceof Error ? error.message : 'Error desconocido', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeClientId) { /* ... tu mensaje de "selecciona un cliente" ... */ }

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Configuración para: {formData.clientName || ''}
      </Typography>

      <Grid container spacing={2}>
        {/* --- NUEVOS CAMPOS AÑADIDOS --- */}
        <Grid item xs={12} md={8}>
          <TextField
            label="Modelo de Gemini"
            name="geminiModel"
            value={formData.geminiModel || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            helperText="Ej: gemini-1.5-flash, gemini-1.5-pro"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="Turnos de Historial"
            name="maxHistoryTurns"
            type="number"
            value={formData.maxHistoryTurns || ''}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
        </Grid>
      </Grid>

      <TextField
        label="Personalidad (System Instruction)"
        name="systemInstruction"
        value={formData.systemInstruction || ''}
        onChange={handleChange}
        multiline
        rows={12}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Button type="submit" variant="contained" disabled={isSaving}>
        {isSaving ? <CircularProgress size={24} /> : 'Guardar Cambios'}
      </Button>

      {notification && <Alert severity={notification.type} sx={{ mt: 2 }}>{notification.message}</Alert>}
    </Paper>
  );
};

export default ConfigForm;