import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Alert, Collapse } from '@mui/material/';
import { API_BASE_URL_MONITOR } from '../../constants';
import { SessionListItem } from '../../types'; // platform is part of SessionListItem

interface AdminToolkitProps {
  sessionId: string | null;
  platform?: SessionListItem['platform']; // Use the type from SessionListItem
  initialInstruction?: string;
  isLoading: boolean;
  onInstructionUpdate: () => void;
}

const AdminToolkit: React.FC<AdminToolkitProps> = ({ sessionId, platform, initialInstruction, isLoading, onInstructionUpdate }) => {
  const [instruction, setInstruction] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (initialInstruction !== undefined) {
      setInstruction(initialInstruction);
    } else {
        setInstruction(''); // Clear instruction if initial is undefined (e.g. new session)
    }
  }, [initialInstruction]);
  
  useEffect(() => {
    // Clear form and notification when session (id or platform) changes, or if either is missing
    setNotification(null);
    if (!sessionId || !platform) { // Check both sessionId and platform
        setInstruction(''); // Clear instruction text field
    }
  }, [sessionId, platform]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !platform) { // Ensure both platform and sessionId are present
        setNotification({ severity: 'error', message: 'No session selected or platform missing.'});
        return;
    }
    
    setIsSaving(true);
    setNotification(null);

    try {
      // Dynamically construct URL using platform and sessionId
      const response = await fetch(`${API_BASE_URL_MONITOR}/api/sessions/${platform}/${sessionId}/instruction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newInstruction: instruction }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar la instrucción.');
      }
      setNotification({ severity: 'success', message: data.message || 'Instrucción actualizada con éxito.' });
      onInstructionUpdate(); // Notify parent to refetch data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setNotification({ severity: 'error', message: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };
  
  const renderContent = () => {
      if (isLoading) {
           return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
      }

      // Check for both sessionId and platform to enable admin tools
      if (!sessionId || !platform) {
          return (
              <Box sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    Selecciona un chat para ver las herramientas.
                </Typography>
             </Box>
          );
      }
      
      return (
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <TextField
              id="system-instruction-input"
              label="Personalidad del Bot"
              multiline
              rows={10}
              fullWidth
              variant="outlined"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              sx={{ flexGrow: 1 }}
              disabled={!platform || !sessionId} // Also disable if platform/id missing
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSaving || !platform || !sessionId} // Also disable if platform/id missing
              fullWidth
              sx={{ mt: 2 }}
            >
              {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Actualizar Personalidad'}
            </Button>
            <Collapse in={!!notification} sx={{ mt: 2 }}>
                 <Alert severity={notification?.severity} onClose={() => setNotification(null)}>
                    {notification?.message}
                 </Alert>
            </Collapse>
          </Box>
      );
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom component="div" sx={{ p: 2, pb: 0, flexShrink: 0 }}>
        Herramientas de Admin
      </Typography>
      {renderContent()}
    </Paper>
  );
};

export default AdminToolkit;