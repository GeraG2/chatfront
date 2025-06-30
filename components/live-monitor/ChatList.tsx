import React from 'react';
import { List, ListItemButton, ListItemText, Paper, Typography, Box, ListItemIcon } from '@mui/material/';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook'; // Assuming this is for Messenger
import { SessionListItem } from '../../types';

interface ChatListProps {
  sessions: SessionListItem[];
  selectedSession: SessionListItem | null;
  onSelectSession: (session: SessionListItem) => void; // Parameter is the full session object
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
              key={`${session.platform}-${session.id}`} // Unique key using platform and id
              selected={selectedSession?.platform === session.platform && selectedSession?.id === session.id}
              onClick={() => onSelectSession(session)} // Pass the full session object
            >
              <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                {session.platform === 'whatsapp' && (
                  <WhatsAppIcon fontSize="small" sx={{ color: 'green' }} />
                )}
                {session.platform === 'messenger' && (
                  <FacebookIcon fontSize="small" sx={{ color: 'blue' }} />
                )}
              </ListItemIcon>
              <ListItemText primary={session.id} secondary={session.platform} />
            </ListItemButton>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default ChatList;