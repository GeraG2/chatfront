import React from 'react';
import { List, ListItemButton, ListItemText, Paper, Typography, Box, ListItemIcon } from '@mui/material/';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import { SessionListItem } from '../../types';

interface ChatListProps {
  sessions: SessionListItem[];
  selectedSession: SessionListItem | null;
  onSelectSession: (session: SessionListItem) => void;
}

const ChatList: React.FC<ChatListProps> = ({ sessions, selectedSession, onSelectSession }) => {
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
          {sessions.map((session) => (
            <ListItemButton
              key={`${session.platform}-${session.id}`}
              selected={selectedSession?.id === session.id && selectedSession?.platform === session.platform}
              onClick={() => onSelectSession(session)}
            >
              <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                {session.platform === 'whatsapp' && <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />}
                {session.platform === 'messenger' && <FacebookIcon fontSize="small" sx={{ color: '#0084FF' }}/>}
              </ListItemIcon>
              <ListItemText primary={session.id} />
            </ListItemButton>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default ChatList;