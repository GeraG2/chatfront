// File: src/features/client-manager/ClientList.tsx
import React from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, IconButton, Chip, Typography, Box, Tooltip 
} from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { ClientProfile } from '../../types/types';

interface ClientListProps {
  clients: ClientProfile[];
  onEdit: (client: ClientProfile) => void;
  onDelete: (clientId: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onEdit, onDelete }) => {
  if (clients.length === 0) {
    return (
      <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, bgcolor: 'background.paper', border: '1px dashed' }}>
        <Typography color="text.secondary">No hay clientes registrados todavía.</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'light' ? '#f8fafc' : '#1e293b' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Nombre del Cliente</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Plataforma</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>ID de Conexión</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Modelo</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.map((client) => (
            <TableRow 
              key={client.clientId} 
              sx={{ '&:hover': { bgcolor: 'action.hover' }, transition: '0.2s' }}
            >
              <TableCell>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{client.clientName}</Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  icon={client.platform === 'messenger' ? <FacebookIcon /> : <WhatsAppIcon />}
                  label={client.platform === 'messenger' ? 'Messenger' : 'WhatsApp'}
                  size="small"
                  color={client.platform === 'messenger' ? 'primary' : 'success'}
                  variant="outlined"
                  sx={{ borderRadius: 1, fontWeight: 500 }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'action.selected', p: 0.5, borderRadius: 1 }}>
                  {client.clientId}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">{client.geminiModel}</Typography>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Editar Configuración">
                  <IconButton onClick={() => onEdit(client)} color="primary" sx={{ mr: 1 }}>
                    <EditTwoToneIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar Cliente">
                  <IconButton onClick={() => onDelete(client.clientId)} color="error">
                    <DeleteTwoToneIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ClientList;