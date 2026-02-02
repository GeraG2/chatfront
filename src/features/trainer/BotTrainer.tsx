// File: src/features/trainer/BotTrainer.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Avatar,
  Fade,
  IconButton,
  Grid,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { API_BASE_URL } from '../../constants';
import { useClientContext } from '../../context/ClientContext';
import { HistoryItem } from '../../types/types';

const BotTrainer: React.FC = () => {
  const { activeClientId, clients } = useClientContext();
  
  // Estado del Chat
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Estado del Editor de Prompt
  const [testSystemInstruction, setTestSystemInstruction] = useState('');

  const activeClient = clients.find(c => c.clientId === activeClientId);

  // Cargar el prompt real cuando cambia el cliente
  useEffect(() => {
    if (activeClient) {
      setTestSystemInstruction(activeClient.systemInstruction || '');
      setHistory([]); // Limpiar chat al cambiar cliente
    }
  }, [activeClient]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = async () => {
    if (!input.trim() || !activeClientId) return;

    const userMsg: HistoryItem = { role: 'user', parts: [{ text: input }] };
    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/test-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: input, 
          history: history,
          systemInstruction: testSystemInstruction 
        }),
      });

      const data = await response.json();
      
      let responseText = "Error desconocido";
      if (data.responseText) responseText = data.responseText;
      else if (data.message) responseText = `Error: ${data.message}`;

      const botMsg: HistoryItem = { role: 'model', parts: [{ text: responseText }] };
      setHistory(prev => [...prev, botMsg]);
    } catch (error) {
      setHistory(prev => [...prev, { role: 'model', parts: [{ text: "Error de conexión con el servidor." }] }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setHistory([]);
  };

  if (!activeClientId) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.7 }}>
        <SmartToyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Selecciona un cliente arriba para comenzar el entrenamiento.
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in={true}>
      <Grid container spacing={3} sx={{ height: 'calc(100vh - 140px)', alignItems: 'stretch' }}> 
        
        {/* --- PANEL IZQUIERDO: EDITOR DE CEREBRO --- */}
        <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column',
              bgcolor: 'background.paper',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%' 
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToyIcon fontSize="small" />
                Cerebro del Bot
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Edita las instrucciones aquí para probar cambios temporales.
              </Typography>
            </Box>
            
            <TextField
              multiline
              fullWidth
              variant="outlined"
              placeholder="Escribe aquí las instrucciones del sistema..."
              value={testSystemInstruction}
              onChange={(e) => setTestSystemInstruction(e.target.value)}
              sx={{ 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                '& .MuiInputBase-root': { 
                    flexGrow: 1,
                    alignItems: 'flex-start',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    padding: 2
                },
                '& .MuiInputBase-input': {
                    height: '100% !important',
                    overflow: 'auto !important'
                }
              }}
            />
            
            <Alert severity="info" sx={{ mt: 2, py: 0, fontSize: '0.75rem' }}>
              Los cambios son solo para esta sesión de prueba.
            </Alert>
          </Paper>
        </Grid>

        {/* --- PANEL DERECHO: SIMULADOR DE CHAT --- */}
        <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper 
            elevation={0}
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column',
              bgcolor: 'background.default',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              height: '100%'
            }}
          >
            {/* Header del Chat */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">Simulador en Vivo</Typography>
                <Typography variant="caption" color={history.length > 0 ? 'success.main' : 'text.secondary'}>
                  {history.length > 0 ? 'Sesión activa de prueba' : 'Esperando mensaje...'}
                </Typography>
              </Box>
              <Button 
                variant="text" 
                color="error" 
                size="small" 
                startIcon={<RestartAltIcon />} 
                onClick={handleClearChat}
              >
                Reiniciar
              </Button>
            </Box>

            {/* Area de Mensajes */}
            <Box 
              sx={{ 
                flexGrow: 1, 
                p: 3, 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2
              }}
              ref={scrollRef}
            >
              {history.length === 0 && (
                <Box sx={{ mt: 4, textAlign: 'center', opacity: 0.4 }}>
                  <PlayArrowIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography>Escribe un mensaje para probar tu prompt.</Typography>
                </Box>
              )}
              
              {history.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <Box key={index} sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        px: 2,
                        maxWidth: '80%',
                        borderRadius: 2,
                        borderTopRightRadius: isUser ? 0 : 12,
                        borderTopLeftRadius: !isUser ? 0 : 12,
                        bgcolor: isUser ? 'primary.main' : 'background.paper',
                        color: isUser ? 'primary.contrastText' : 'text.primary',
                        border: !isUser ? '1px solid' : 'none',
                        borderColor: 'divider',
                        boxShadow: isUser ? 2 : 1
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {msg.parts[0].text}
                      </Typography>
                    </Paper>
                  </Box>
                );
              })}
              
              {loading && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', opacity: 0.6 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption">Bot escribiendo...</Typography>
                </Box>
              )}
            </Box>

            {/* Input */}
            <Box 
              component="form" 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}
            >
              <TextField
                fullWidth
                placeholder="Escribe un mensaje..."
                size="small"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <IconButton color="primary" onClick={handleSend} disabled={!input.trim() || loading} edge="end">
                      <SendIcon />
                    </IconButton>
                  ),
                  sx: { borderRadius: 3 }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Fade>
  );
};

export default BotTrainer;