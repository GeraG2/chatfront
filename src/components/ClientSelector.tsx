// File: src/components/ClientSelector.tsx
import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  useTheme 
} from '@mui/material';
// Se corrigió la ruta de importación para asegurar la resolución del contexto
import { useClientContext } from '../context/ClientContext';
import PersonIcon from '@mui/icons-material/Person';

const ClientSelector: React.FC = () => {
  const { clients, activeClientId, setActiveClientId } = useClientContext();
  const theme = useTheme();

  const handleChange = (event: any) => {
    setActiveClientId(event.target.value);
  };

  const isLight = theme.palette.mode === 'light';

  return (
    <Box sx={{ minWidth: 200, display: 'flex', alignItems: 'center' }}>
      <PersonIcon sx={{ 
        mr: 1, 
        // Color dinámico basado en el modo de color para visibilidad óptima
        color: isLight ? 'primary.main' : 'primary.light' 
      }} />
      <FormControl fullWidth size="small">
        <InputLabel 
          id="client-select-label"
          sx={{ 
            color: isLight ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
            '&.Mui-focused': {
                color: 'primary.main'
            }
          }}
        >
          Cliente Activo
        </InputLabel>
        <Select
          labelId="client-select-label"
          value={activeClientId || ''}
          label="Cliente Activo"
          onChange={handleChange}
          sx={{
            // --- SOLUCIÓN AL CONTRASTE DEL TEXTO ---
            // 'text.primary' garantiza negro en tema claro y blanco en tema oscuro
            color: 'text.primary', 
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: isLight ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.3)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
            '.MuiSvgIcon-root': {
              // Asegura que la flecha sea visible en ambos modos
              color: isLight ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.7)',
            }
          }}
        >
          {clients.map((client) => (
            <MenuItem key={client.clientId} value={client.clientId}>
              {client.clientName}
            </MenuItem>
          ))}
          {clients.length === 0 && (
            <MenuItem disabled value="">
              No hay clientes
            </MenuItem>
          )}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ClientSelector;