import React from 'react';
import { List, ListItemButton, ListItemText, Paper, Typography, Box } from '@mui/material/';

interface ChatListProps {
  sessions: string[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ sessions, selectedSessionId, onSelectSession }) => {
  return (
    <Paper sx={{ flexGrow: 1, overflowY: 'auto' }}>
      {sessions.length === 0 ? (
          <Box sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
                No hay chats activos en este momento.
            </Typography>
          </Box>
      ) : (
        <List component="nav" aria-label="lista de chats" dense>
          {sessions.map((sessionId) => (
            <ListItemButton
              key={sessionId}
              selected={selectedSessionId === sessionId}
              onClick={() => onSelectSession(sessionId)}
            >
              <ListItemText primary={sessionId} />
            </ListItemButton>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default ChatList;