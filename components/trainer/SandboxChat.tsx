import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, IconButton, CircularProgress, Alert } from '@mui/material/';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import { HistoryItem, TestPromptResponse } from '../../types';
import { API_BASE_URL } from '../../constants';

interface SandboxChatProps {
  systemInstruction: string;
}

const SandboxChat: React.FC<SandboxChatProps> = ({ systemInstruction }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: HistoryItem = { role: 'user', parts: [{ text: userInput }] };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/test-prompt`, {
        method: 'POST', // <-- La línea clave que faltaba
        headers: {
      'Content-Type': 'application/json',
       }   ,
        body: JSON.stringify({
         systemInstruction: systemInstruction,
          history: newHistory, // newHistory es el que ya tienes en tu función
        }),
    });
      const data: TestPromptResponse = await response.json();

      if (!response.ok) {
      throw new Error(data.responseText || 'Error en la respuesta del servidor.');
      }

      // --- VALIDACIÓN CRUCIAL AÑADIDA ---
      // Nos aseguramos de que la respuesta contenga texto válido antes de añadirla al historial
      if (data && typeof data.responseText === 'string' && data.responseText.trim() !== '') {
        const modelMessage: HistoryItem = { role: 'model', parts: [{ text: data.responseText }] };
        setHistory(prev => [...prev, modelMessage]);
      } else {
        // Si no hay texto, lanzamos un error para que el `catch` lo maneje
        // y muestre un mensaje al usuario, en lugar de corromper el historial.
        throw new Error('La respuesta del servidor no contenía texto válido.');
        }
      // --- FIN DE LA VALIDACIÓN ---

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido al contactar la IA.';
      setError(errorMessage);
      setHistory(prev => prev.slice(0, -1)); // Quita el mensaje del usuario si la API falla
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setHistory([]);
    setError(null);
    setUserInput('');
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, pb: 0, flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom component="div" sx={{mb: 0}}>
                Sandbox de Prueba
            </Typography>
            <IconButton onClick={handleResetChat} aria-label="reiniciar chat" title="Reiniciar Chat">
                <RefreshIcon />
            </IconButton>
        </Box>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            {history.length === 0 && !isLoading && (
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        El historial de chat está vacío. <br/> Escribe un mensaje para empezar a probar la personalidad.
                    </Typography>
                </Box>
            )}
            {history.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start', mb: 2 }}>
                <Paper elevation={3} sx={{ p: 1.5, maxWidth: '80%', bgcolor: item.role === 'user' ? 'primary.main' : 'background.default', color: item.role === 'user' ? 'primary.contrastText' : 'text.primary', border: item.role === 'model' ? '1px solid' : 'none', borderColor: 'divider' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {item.parts.map(p => p.text).join('')}
                  </Typography>
                </Paper>
              </Box>
            ))}
             {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <CircularProgress size={24} />
                </Box>
            )}
            <div ref={endOfMessagesRef} />
        </Box>
        {error && <Alert severity="error" sx={{ m: 2, mt: 0 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Escribe tu mensaje de prueba..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <IconButton type="submit" color="primary" disabled={isLoading || !userInput.trim()}>
                    <SendIcon />
                  </IconButton>
                ),
              }}
            />
        </Box>
    </Paper>
  );
};

export default SandboxChat;
