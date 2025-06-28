import React, { useRef, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material/';
import { HistoryItem } from '../../types';

interface ChatTranscriptProps {
  history?: HistoryItem[];
  isLoading: boolean;
}

const ChatTranscript: React.FC<ChatTranscriptProps> = ({ history, isLoading }) => {
  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [history]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!history) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', px: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Selecciona un chat de la lista para ver la conversación.
          </Typography>
        </Box>
      );
    }
    
    if (history.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', px: 2 }}>
              <Typography variant="body1" color="text.secondary">
                Esta conversación aún no tiene mensajes.
              </Typography>
            </Box>
        );
    }

    return (
      <Box sx={{ p: 2 }}>
        {history.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 1.5,
                maxWidth: '80%',
                bgcolor: item.role === 'user' ? 'primary.main' : 'background.default',
                color: item.role === 'user' ? 'primary.contrastText' : 'text.primary',
                border: item.role === 'model' ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{item.parts.map(p => p.text).join('')}</Typography>
            </Paper>
          </Box>
        ))}
        <div ref={endOfMessagesRef} />
      </Box>
    );
  };
  
  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom component="div" sx={{ p: 2, pb: 0, flexShrink: 0 }}>
            Transcripción del Chat
        </Typography>
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {renderContent()}
        </Box>
    </Paper>
  );
};

export default ChatTranscript;