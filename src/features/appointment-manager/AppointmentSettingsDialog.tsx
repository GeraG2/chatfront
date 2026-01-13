// File: src/features/appointment-manager/AppointmentSettingsDialog.tsx

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, Alert, FormControl,
    InputLabel, Select, MenuItem, SelectChangeEvent, Grid,
    Typography, IconButton, Checkbox, FormControlLabel, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { ClientProfile, AppointmentField } from '../../types/types';

interface AppointmentSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (settings: ClientProfile['calendarSettings'], fields: AppointmentField[]) => void;
  currentSettings?: ClientProfile['calendarSettings'];
  currentFields?: AppointmentField[];
}

const durationOptions = [
    { label: '15 Minutos', value: '00:15:00' },
    { label: '30 Minutos', value: '00:30:00' },
    { label: '45 Minutos', value: '00:45:00' },
    { label: '1 Hora', value: '01:00:00' },
    { label: '1 Hora y 30 Minutos', value: '01:30:00' },
    { label: '2 Horas', value: '02:00:00' },
];

const AppointmentSettingsDialog: React.FC<AppointmentSettingsDialogProps> = ({
  open,
  onClose,
  onSave,
  currentSettings,
  currentFields
}) => {
  const [calendarId, setCalendarId] = useState('primary');
  const [slotDuration, setSlotDuration] = useState('00:30:00');
  const [businessHoursStart, setBusinessHoursStart] = useState('09:00');
  const [businessHoursEnd, setBusinessHoursEnd] = useState('18:00');
  
  // Estado para los campos dinámicos
  const [fields, setFields] = useState<AppointmentField[]>([
      // Campo por defecto que siempre sugerimos
      { key: 'name', label: 'Nombre', description: 'El nombre completo del cliente', required: true }
  ]);

  useEffect(() => {
    if (open) {
        if (currentSettings) {
            setCalendarId(currentSettings.calendarId || 'primary');
            setSlotDuration(currentSettings.slotDuration || '00:30:00');
            setBusinessHoursStart(currentSettings.businessHoursStart?.slice(0, 5) || '09:00');
            setBusinessHoursEnd(currentSettings.businessHoursEnd?.slice(0, 5) || '18:00');
        }
        if (currentFields && currentFields.length > 0) {
            setFields(currentFields);
        } else {
             // Si no hay campos configurados, ponemos al menos el nombre por defecto
             setFields([{ key: 'name', label: 'Nombre', description: 'El nombre completo del cliente', required: true }]);
        }
    }
  }, [currentSettings, currentFields, open]);

  const handleAddField = () => {
      setFields([...fields, { key: '', label: '', description: '', required: true }]);
  };

  const handleRemoveField = (index: number) => {
      const newFields = [...fields];
      newFields.splice(index, 1);
      setFields(newFields);
  };

  const handleFieldChange = (index: number, prop: keyof AppointmentField, value: any) => {
      const newFields = [...fields];
      newFields[index] = { ...newFields[index], [prop]: value };
      // Auto-generar key basada en label si está vacía
      if (prop === 'label' && !newFields[index].key) {
           newFields[index].key = value.toLowerCase().replace(/\s+/g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }
      setFields(newFields);
  };

  const handleSave = () => {
    onSave({
        calendarId,
        slotDuration,
        businessHoursStart: `${businessHoursStart}:00`,
        businessHoursEnd: `${businessHoursEnd}:00`,
    }, fields);
  };

  const handleDurationChange = (event: SelectChangeEvent<string>) => {
      setSlotDuration(event.target.value);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Configuración de la Agenda</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                    <Typography variant="h6" gutterBottom>Ajustes Generales</Typography>
                    <TextField
                        fullWidth margin="dense" label="ID del Calendario" value={calendarId}
                        onChange={(e) => setCalendarId(e.target.value)} variant="outlined" size="small"
                        helperText="Usa 'primary' o un ID específico"
                    />
                    <FormControl fullWidth margin="dense" size="small">
                        <InputLabel>Duración Bloques</InputLabel>
                        <Select value={slotDuration} label="Duración Bloques" onChange={handleDurationChange}>
                            {durationOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <TextField label="Inicio" type="time" fullWidth size="small" value={businessHoursStart} onChange={(e) => setBusinessHoursStart(e.target.value)} InputLabelProps={{ shrink: true }} />
                        <TextField label="Fin" type="time" fullWidth size="small" value={businessHoursEnd} onChange={(e) => setBusinessHoursEnd(e.target.value)} InputLabelProps={{ shrink: true }} />
                    </Box>
                </Grid>

                <Grid item xs={12} md={7}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">Datos Requeridos al Cliente</Typography>
                        <Button startIcon={<AddCircleOutlineIcon />} size="small" onClick={handleAddField}>
                            Agregar Dato
                        </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                        Define qué información debe pedir el bot. La fecha siempre se pide por defecto.
                    </Typography>
                    
                    <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                        {fields.map((field, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start', p: 2, border: '1px solid #eee', borderRadius: 1, bgcolor: 'background.paper' }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                        <TextField 
                                            label="Nombre (ej. Teléfono)" size="small" fullWidth 
                                            value={field.label} onChange={(e) => handleFieldChange(index, 'label', e.target.value)} 
                                        />
                                        <TextField 
                                            label="ID (ej. phone)" size="small" sx={{ width: 120 }}
                                            value={field.key} onChange={(e) => handleFieldChange(index, 'key', e.target.value)} 
                                        />
                                    </Box>
                                    <TextField 
                                        label="Instrucción para la IA" size="small" fullWidth margin="dense" placeholder="Ej: El número celular de 10 dígitos"
                                        value={field.description} onChange={(e) => handleFieldChange(index, 'description', e.target.value)} 
                                    />
                                </Box>
                                <Divider orientation="vertical" flexItem />
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <FormControlLabel
                                        control={<Checkbox size="small" checked={field.required} onChange={(e) => handleFieldChange(index, 'required', e.target.checked)} />}
                                        label={<Typography variant="caption">Obligatorio</Typography>}
                                        labelPlacement="bottom"
                                        sx={{ m: 0 }}
                                    />
                                    <IconButton size="small" color="error" onClick={() => handleRemoveField(index)} sx={{ mt: 1 }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Guardar Configuración</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentSettingsDialog;