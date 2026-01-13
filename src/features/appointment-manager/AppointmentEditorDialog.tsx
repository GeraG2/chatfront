// File: src/features/appointment-manager/AppointmentEditorDialog.tsx

import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, CircularProgress, Alert, Box
} from '@mui/material';
import { Appointment } from './AppointmentManager'; // Asumiendo que exportas el tipo
import { DateSelectArg } from '@fullcalendar/core';

// Props que el diálogo espera recibir de su padre (AppointmentManager)
interface AppointmentEditorDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (appointmentData: Omit<Appointment, 'id'>) => void;
  appointmentToEdit?: Appointment;
  isSaving: boolean;
  error: string | null;
  selectedDateInfo?: DateSelectArg | null;
}

// Función para formatear fechas de ISO a lo que el input <datetime-local> necesita
const formatDateTimeForInput = (isoDate?: string): string => {
    if (!isoDate) return '';
    // Corta la 'Z' o la información de zona horaria para el input
    return isoDate.slice(0, 16); 
};

const AppointmentEditorDialog: React.FC<AppointmentEditorDialogProps> = ({
  open,
  onClose,
  onSave,
  appointmentToEdit,
  isSaving,
  error,
  selectedDateInfo
}) => {
  const [summary, setSummary] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');

  const isEditing = !!appointmentToEdit;

  // Rellena el formulario cuando se abre en modo de edición
  useEffect(() => {
    if (open) {
      if (isEditing && appointmentToEdit) {
        setSummary(appointmentToEdit.summary || '');
        setStartDateTime(formatDateTimeForInput(appointmentToEdit.start?.dateTime));
        setEndDateTime(formatDateTimeForInput(appointmentToEdit.end?.dateTime));
      } else if (selectedDateInfo) {
        // Modo Creación (desde el calendario): usa las fechas seleccionadas
        setSummary('');
        setStartDateTime(formatDateTimeForInput(selectedDateInfo.start.toISOString()));
        setEndDateTime(formatDateTimeForInput(selectedDateInfo.end.toISOString()));
      } else {
        // Resetea el formulario para una nueva cita
        setSummary('');
        setStartDateTime('');
        setEndDateTime('');
      }
    }
  }, [appointmentToEdit, selectedDateInfo, isEditing, open]);

  const handleSave = () => {
    // Construye el objeto de evento en el formato que la API de Google espera
    const appointmentData = {
        summary,
        start: { dateTime: new Date(startDateTime).toISOString() },
        end: { dateTime: new Date(endDateTime).toISOString() },
    };
    onSave(appointmentData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Editar Cita' : 'Añadir Nueva Cita'}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
                autoFocus
                required
                margin="dense"
                name="summary"
                label="Título de la Cita (ej. Corte - Juan Pérez)"
                fullWidth
                variant="standard"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
            />
            <TextField
                required
                margin="dense"
                name="startDateTime"
                label="Inicio de la Cita"
                type="datetime-local"
                fullWidth
                variant="standard"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2 }}
            />
            <TextField
                required
                margin="dense"
                name="endDateTime"
                label="Fin de la Cita"
                type="datetime-local"
                fullWidth
                variant="standard"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2 }}
            />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? <CircularProgress size={24} /> : 'Guardar Cita'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentEditorDialog;