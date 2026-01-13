// File: src/features/appointment-manager/AppointmentManager.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, Button, CircularProgress, Alert, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { useClientContext } from '../../context/ClientContext';
import { API_BASE_URL } from '../../constants';
import AppointmentCalendar from './AppointmentCalendar';
import AppointmentEditorDialog from './AppointmentEditorDialog';
import AppointmentSettingsDialog from './AppointmentSettingsDialog';
import { ClientProfile, AppointmentField } from '../../types/types';
import { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';

export interface Appointment {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
}

const AppointmentManager: React.FC = () => {
  const { activeClientId, clients, fetchClients } = useClientContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDateInfo, setSelectedDateInfo] = useState<DateSelectArg | null>(null);
  
  const activeClient = clients.find(c => c.clientId === activeClientId);

  const fetchAppointments = useCallback(async () => {
    if (!activeClientId) {
      setAppointments([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients/${activeClientId}/appointments`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar las citas.');
      }
      setAppointments(await response.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [activeClientId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // --- MANEJADORES DEL CALENDARIO ---
  const handleEventClick = (clickInfo: EventClickArg) => {
    const clickedAppointment = appointments.find(app => app.id === clickInfo.event.id);
    if (clickedAppointment) {
      setAppointmentToEdit(clickedAppointment);
      setIsEditorOpen(true);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDateInfo(selectInfo);
    setAppointmentToEdit(undefined);
    setIsEditorOpen(true);
  };
  
  const handleEventDrop = async (dropInfo: EventDropArg) => {
    if (!activeClientId) return;
    if (!window.confirm("¿Estás seguro de que quieres reagendar esta cita?")) {
      dropInfo.revert();
      return;
    }
    const eventToUpdate = {
        summary: dropInfo.event.title,
        start: { dateTime: dropInfo.event.startStr },
        end: { dateTime: dropInfo.event.endStr },
    };
    try {
        await fetch(`${API_BASE_URL}/api/clients/${activeClientId}/appointments/${dropInfo.event.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventToUpdate),
        });
        fetchAppointments();
    } catch (err) {
        setError("Error al reagendar la cita.");
        dropInfo.revert();
    }
  };

  // --- MANEJADORES DE DIÁLOGOS ---
  const handleOpenEditor = (appointment?: Appointment) => {
    setSelectedDateInfo(null);
    setAppointmentToEdit(appointment);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setAppointmentToEdit(undefined);
    setSelectedDateInfo(null);
  };

  const handleSaveAppointment = async (appointmentData: any) => {
    if (!activeClientId) return;
    setIsSaving(true);
    setError(null);
    const isEditing = !!appointmentToEdit;
    const url = isEditing
      ? `${API_BASE_URL}/api/clients/${activeClientId}/appointments/${appointmentToEdit.id}`
      : `${API_BASE_URL}/api/clients/${activeClientId}/appointments`;
    const method = isEditing ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar la cita.');
      }
      fetchAppointments();
      handleCloseEditor();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenSettings = () => setIsSettingsOpen(true);
  const handleCloseSettings = () => setIsSettingsOpen(false);

  // --- FUNCIÓN INTELIGENTE PARA GUARDAR Y GENERAR TOOLS Y PROMPT ---
  const handleSaveSettings = async (settings: ClientProfile['calendarSettings'], fields: AppointmentField[]) => {
    if (!activeClient) return;

    // 1. GENERAR LA DEFINICIÓN DE HERRAMIENTAS (TOOLS)
    const dynamicProperties: any = {
        date: { type: "string", description: "La fecha y hora de la cita en formato ISO 8601 (AAAA-MM-DDTHH:MM:SS)." }
    };
    const requiredFields = ["date"];

    fields.forEach(f => {
        dynamicProperties[f.key] = {
            type: "string",
            description: f.description
        };
        if (f.required) {
            requiredFields.push(f.key);
        }
    });

    const newTools = [
        {
            functionDeclarations: [
                {
                    name: "checkAvailability",
                    description: "Usar al principio para revisar el calendario y encontrar todos los horarios disponibles."
                },
                {
                    name: "scheduleAppointment",
                    description: `Usar al final para agendar la cita. DEBE tener los siguientes argumentos: ${requiredFields.join(', ')}.`,
                    parameters: {
                        type: "object",
                        properties: dynamicProperties,
                        required: requiredFields
                    }
                },
                {
                    name: "confirmAppointment",
                    description: "Usa esta herramienta CUANDO EL USUARIO CONFIRME su asistencia (ej. diciendo 'Confirmar' o pulsando el botón).",
                    parameters: {
                        type: "object",
                        properties: {
                            name: { type: "string", description: "El nombre del cliente que confirma." }
                        },
                        required: ["name"]
                    }
                },
                {
                    name: "searchKnowledgeBase",
                    description: "Busca en el catálogo de servicios y precios del negocio.",
                    parameters: {
                        type: "object",
                        properties: {
                            itemName: { type: "string", description: "Nombre del servicio a buscar (opcional)." }
                        }
                    }
                }
            ]
        }
    ];

    // 2. GENERAR EL SYSTEM PROMPT DINÁMICO (INTEGRANDO TU LÓGICA)
    const fieldLabels = fields.map(f => f.label);
    const allRequiredData = ["Fecha y Hora", ...fieldLabels].join(', ');
    const businessName = activeClient.clientName || 'el negocio';

    const newSystemInstruction = `Eres un recepcionista virtual para '${businessName}'. Tu objetivo es agendar citas de la manera más eficiente y amigable posible. Habla siempre en español.

**Sigue este proceso ESTRICTAMENTE:**

**PRE-INICIO:** Antes de todo saluda al usuario de la manera mas breve posible. Si el usuario pide ver los servicios llama a la herramienta "searchKnowledgeBase" y muestrale el catalogo.

1.  **INICIO:** Cuando un usuario pida agendar una cita, tu PRIMERA ACCIÓN debe ser preguntarle que Fecha y Hora necesita, luego llamar a la herramienta \`checkAvailability\` para revisar si esta libre, si esta libre continuar con el proceso y si no pedirle otra hora y/o fecha hasta encontrar una libre.
2.  **RECOPILAR DATOS:** Una vez que tengas la Fecha y Hora disponible, conversa con el usuario para obtener los siguientes datos obligatorios: **${fieldLabels.join(', ')}**.
3.  **ACCIÓN FINAL (AGENDAR):** Cuando tengas TODOS los datos requeridos (${allRequiredData}), y solo entonces, llama a la herramienta \`scheduleAppointment\` para crear la cita.
4.  **ENTREGA DE LINK:** La herramienta \`scheduleAppointment\` te devolverá un enlace. ES OBLIGATORIO que se lo envíes al usuario en tu respuesta final. Dile que puede usarlo para guardar la cita en su calendario.
5.  **CONFIRMACIÓN DE ASISTENCIA:** Si el usuario confirma su asistencia (por ejemplo, respondiendo a un recordatorio), llama a la herramienta \`confirmAppointment\`.

**NOTA IMPORTANTE:** Al llamar a las herramientas, asegúrate de que la fecha ('date') esté siempre en formato ISO 8601 (AAAA-MM-DDTHH:MM:SS).`;

    // 3. Actualizar el perfil del cliente
    const updatedClientProfile = { 
        ...activeClient, 
        calendarSettings: settings,
        appointmentFields: fields,
        tools: newTools,
        systemInstruction: newSystemInstruction 
    };

    try {
        await fetch(`${API_BASE_URL}/api/clients/${activeClient.clientId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedClientProfile),
        });
        await fetchClients();
        handleCloseSettings();
    } catch (err) {
        setError("Error al guardar la configuración.");
    }
  };

  if (!activeClientId) {
    return <Paper sx={{p: 3, textAlign: 'center'}}><Typography>Selecciona un cliente para ver su agenda.</Typography></Paper>;
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>Agenda de Citas</Typography>
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenEditor()}>
            Añadir Cita
          </Button>
          <IconButton onClick={handleOpenSettings} sx={{ ml: 1 }} title="Configuración de Agenda">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}

      <AppointmentCalendar 
        appointments={appointments}
        slotDuration={activeClient?.calendarSettings?.slotDuration || '00:30:00'}
        businessHoursStart={activeClient?.calendarSettings?.businessHoursStart || '00:00:00'}
        businessHoursEnd={activeClient?.calendarSettings?.businessHoursEnd || '24:00:00'}
        handleEventClick={handleEventClick}
        handleDateSelect={handleDateSelect}
        handleEventDrop={handleEventDrop}
      />

      {isEditorOpen &&
        <AppointmentEditorDialog
            open={isEditorOpen}
            onClose={handleCloseEditor}
            onSave={handleSaveAppointment}
            appointmentToEdit={appointmentToEdit}
            isSaving={isSaving}
            error={error}
            selectedDateInfo={selectedDateInfo}
        />
      }

      {isSettingsOpen &&
        <AppointmentSettingsDialog
            open={isSettingsOpen}
            onClose={handleCloseSettings}
            onSave={handleSaveSettings}
            currentSettings={activeClient?.calendarSettings}
            currentFields={activeClient?.appointmentFields}
        />
      }
    </Paper>
  );
};

export default AppointmentManager;