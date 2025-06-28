import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Alert, Stack } from '@mui/material/';
import { API_BASE_URL } from '../../constants';
import { ConfigData, NotificationState } from '../../types';
import Notification from '../Notification';

interface PromptEditorProps {
  instruction: string;
  onInstructionChange: (text: string) => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ instruction, onInstructionChange }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const handleLoadDefault = async () => {
    setIsFetching(true);
    setNotification(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/config`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar la configuración');
      }
      const data: ConfigData = await response.json();
      onInstructionChange(data.DEFAULT_SYSTEM_INSTRUCTION);
      setNotification({ message: 'Personalidad actual cargada.', type: 'success'});
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
      setNotification({ message: errorMessage, type: 'error' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSaveDefault = async () => {
    setIsSaving(true);
    setNotification(null);
    try {
       // First, get the latest full config to avoid overwriting other settings
      const configResponse = await fetch(`${API_BASE_URL}/api/config`);
      if (!configResponse.ok) {
        throw new Error('No se pudo obtener la configuración actual antes de guardar.');
      }
      const currentConfig: ConfigData = await configResponse.json();

      // Create payload with the updated instruction
      const payload: ConfigData = {
        ...currentConfig,
        DEFAULT_SYSTEM_INSTRUCTION: instruction,
      };

      const saveResponse = await fetch(`${API_BASE_URL}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await saveResponse.json();
      if (!saveResponse.ok) {
        throw new Error(result.message || 'Error al guardar la nueva personalidad.');
      }
      setNotification({ message: result.message, type: 'success' });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
      setNotification({ message: errorMessage, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <>
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Editor de Personalidad
        </Typography>
        <TextField
          id="prompt-editor-textfield"
          label="System Instruction"
          multiline
          rows={15}
          fullWidth
          variant="outlined"
          value={instruction}
          onChange={(e) => onInstructionChange(e.target.value)}
          placeholder="Describe el rol y comportamiento que quieres probar..."
          sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { height: '100%' } }}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleLoadDefault} 
            disabled={isFetching}
            fullWidth
          >
            {isFetching ? <CircularProgress size={24} /> : 'Cargar Personalidad Actual'}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveDefault} 
            disabled={isSaving}
            fullWidth
          >
            {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Guardar como Defecto'}
          </Button>
        </Stack>
      </Paper>
    </>
  );
};

export default PromptEditor;
