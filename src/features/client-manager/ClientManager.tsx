// File: src/features/client-manager/ClientManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Typography, Alert, Button, Fade } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ClientList from './ClientList';
import ClientEditor from './ClientEditor';
import { ClientProfile } from '../../types/types';

// La URL base para las peticiones al backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://chatbot-back.fly.dev';

const ClientManager: React.FC = () => {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [clientToEdit, setClientToEdit] = useState<ClientProfile | undefined>(undefined);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial de clientes
  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients`);
      if (!response.ok) throw new Error('Error al conectar con el servidor');
      const data = await response.json();
      setClients(data);
    } catch (e) {
      setError("No se pudieron cargar los clientes. Verifica que el backend esté corriendo.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleEdit = (client: ClientProfile) => {
    setClientToEdit(client);
    setIsEditorOpen(true);
  };

  const handleAddNew = () => {
    setClientToEdit(undefined);
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    setIsEditorOpen(false);
    fetchClients(); 
  };

  const handleDelete = async (clientId: string) => {
    if (!window.confirm("¿Estás seguro de borrar este cliente? Se perderán todos sus datos.")) return;
    try {
      await fetch(`${API_BASE_URL}/api/clients/${clientId}`, { method: 'DELETE' });
      fetchClients();
    } catch (e) {
      setError("Error al eliminar el cliente.");
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Fade in={true}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Gestor de Clientes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administra los bots instalados en cada página de Facebook o número de WhatsApp.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleAddNew}
            sx={{ borderRadius: 2, px: 3, py: 1, boxShadow: 3 }}
          >
            Añadir Cliente
          </Button>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        
        <ClientList clients={clients} onEdit={handleEdit} onDelete={handleDelete} />

        {isEditorOpen && (
          <ClientEditor 
            open={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSave}
            clientToEdit={clientToEdit}
          />
        )}
      </Box>
    </Fade>
  );
};

export default ClientManager;