// File: src/features/client-manager/ClientEditor.tsx

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Alert,
    FormControlLabel,
    Switch,
    Typography,
    Box,
    Divider,
    InputAdornment
} from '@mui/material';
import { API_BASE_URL } from '../../constants';
import { ClientProfile } from '../../types/types';

interface ClientEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  clientToEdit?: ClientProfile;
}

const emptyClient: Partial<ClientProfile> = {
  clientName: '',
  clientId: '',
  platform: 'messenger',
  pageAccessToken: '',
  geminiModel: 'gemini-1.5-flash',
  systemInstruction: '',
  maxHistoryTurns: 10,
  knowledgeBasePath: '',
  tools: [],
  enableRichUI: false,
  initialButtons: [],
  reminderSettings: {
      enabled: false,
      hoursBefore: 24,
      messageTemplate: "Hola {name}, te recordamos tu cita para mañana a las {time}. ¿Confirmas tu asistencia?",
      interactiveReminders: false
  },
  // Default CRM
  crmSettings: {
      spreadsheetId: "",
      logAppointments: false,
      logConfirmations: false
  }
};

const ClientEditor: React.FC<ClientEditorProps> = ({ open, onClose, onSave, clientToEdit }) => {
  const [formData, setFormData] = useState<Partial<ClientProfile>>(emptyClient);
  // Estado local para manejar el input de texto de botones (separados por comas)
  const [buttonsInput, setButtonsInput] = useState('');

  // Estados para recordatorios
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHours, setReminderHours] = useState(24);
  const [reminderMessage, setReminderMessage] = useState('');
  const [interactiveReminders, setInteractiveReminders] = useState(false); // Nuevo estado

  // Estados CRM
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [logAppointments, setLogAppointments] = useState(false); // Nuevo
  const [logConfirmations, setLogConfirmations] = useState(false); // Nuevo

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditing = !!clientToEdit;

  useEffect(() => {
    if (open) {
      setError(null);
      if (isEditing && clientToEdit) {
        setFormData({
            ...clientToEdit,
            // Aseguramos que si no existe, sea false
            enableRichUI: clientToEdit.enableRichUI || false 
        });
        // Convertimos el array de botones a string para el input
        setButtonsInput(clientToEdit.initialButtons?.join(', ') || '');

        // Cargar configuración de recordatorios o defaults
        const remSettings = clientToEdit.reminderSettings || emptyClient.reminderSettings!;
        setReminderEnabled(remSettings.enabled);
        setReminderHours(remSettings.hoursBefore);
        setReminderMessage(remSettings.messageTemplate);
        setInteractiveReminders(remSettings.interactiveReminders || false);

        const crmSettings = clientToEdit.crmSettings || emptyClient.crmSettings!;
        setSpreadsheetId(crmSettings.spreadsheetId || '');
        // Cargamos las nuevas opciones independientes
        setLogAppointments(crmSettings.logAppointments || false);
        setLogConfirmations(crmSettings.logConfirmations || false);

      } else {
        setFormData(emptyClient);
        setButtonsInput('');
        setReminderEnabled(false);
        setReminderHours(24);
        setReminderMessage(emptyClient.reminderSettings!.messageTemplate);
        setInteractiveReminders(false);
        setSpreadsheetId('');
        setLogAppointments(false);
        setLogConfirmations(false);
      }
    }
  }, [clientToEdit, isEditing, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      // Manejamos el caso especial del checkbox/switch
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    // Procesamos el string de botones para convertirlo en array
    const processedButtons = buttonsInput
        .split(',')
        .map(btn => btn.trim())
        .filter(btn => btn.length > 0);

    const payload = {
        ...formData,
        initialButtons: processedButtons,
        // Guardamos la configuración de recordatorios
        reminderSettings: {
            enabled: reminderEnabled,
            hoursBefore: Number(reminderHours),
            messageTemplate: reminderMessage,
            interactiveReminders: interactiveReminders // <-- Nuevo campo
        },
        crmSettings: {
            spreadsheetId: spreadsheetId,
            logAppointments: logAppointments,
            logConfirmations: logConfirmations
        }
    };

    const url = isEditing
      ? `${API_BASE_URL}/api/clients/${clientToEdit?.clientId}`
      : `${API_BASE_URL}/api/clients`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      // Enviamos los datos (incluyendo enableRichUI)
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el cliente');
      }

      onSave();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      setError("Hubo un problema al guardar los datos.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEditing ? `Editando: ${formData.clientName}` : 'Añadir Nuevo Cliente'}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <TextField
                autoFocus
                margin="dense"
                name="clientName"
                label="Nombre del Cliente (Interno)"
                type="text"
                fullWidth
                value={formData.clientName || ''}
                onChange={handleChange}
            />
            <TextField
                margin="dense"
                name="clientId"
                label="ID de Página / Teléfono (Client ID)"
                type="text"
                fullWidth
                disabled={isEditing} // No se debe editar el ID
                value={formData.clientId || ''}
                onChange={handleChange}
                helperText={isEditing ? "El ID no se puede cambiar." : "ID de la página de Facebook o número de WhatsApp"}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <FormControl fullWidth>
                    <InputLabel>Plataforma</InputLabel>
                    <Select
                        name="platform"
                        value={formData.platform || 'messenger'}
                        label="Plataforma"
                        onChange={handleChange}
                    >
                        <MenuItem value="messenger">Messenger</MenuItem>
                        <MenuItem value="whatsapp">WhatsApp</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel>Modelo Gemini</InputLabel>
                    <Select
                        name="geminiModel"
                        value={formData.geminiModel || 'gemini-1.5-flash'}
                        label="Modelo Gemini"
                        onChange={handleChange}
                    >
                        <MenuItem value="gemini-1.5-flash">Gemini 1.5 Flash (Rápido)</MenuItem>
                        <MenuItem value="gemini-2.0-flash">Gemini 2.0 Flash (Experimental)</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TextField
                margin="dense"
                name="pageAccessToken"
                label="Token de Acceso (Page Access Token)"
                type="password"
                fullWidth
                value={formData.pageAccessToken || ''}
                onChange={handleChange}
                helperText="Usa el nombre de la variable de entorno (ej. BARBERIA_TOKEN) por seguridad."
            />

            {/* --- NUEVO CAMPO AGREGADO --- */}
            <TextField
                margin="dense"
                name="knowledgeBasePath"
                label="Archivo de Base de Conocimiento (JSON)"
                placeholder="ejemplo: menu_tacos.json"
                type="text"
                fullWidth
                value={formData.knowledgeBasePath || ''}
                onChange={handleChange}
                helperText="Escribe el nombre del archivo JSON que contiene los productos/servicios. Debe estar en la carpeta raíz del servidor."
            />
            {/* ---------------------------- */}

            <TextField
                margin="dense"
                name="systemInstruction"
                label="Instrucción del Sistema (Personalidad)"
                type="text"
                fullWidth
                multiline
                minRows={4}
                maxRows={10}
                value={formData.systemInstruction || ''}
                onChange={handleChange}
            />

            {/* --- SECCIÓN DE CONFIGURACIÓN AVANZADA --- */}
            <Box sx={{ mt: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                    Configuración Avanzada
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControlLabel
                    control={
                        <Switch
                            checked={formData.enableRichUI || false}
                            onChange={handleChange}
                            name="enableRichUI"
                            color="primary"
                        />
                    }
                    label={
                        <Box>
                            <Typography variant="body1">Activar Interfaz Rica</Typography>
                            <Typography variant="caption" color="text.secondary">
                                El bot enviará botones y menús en lugar de solo texto cuando sea posible.
                            </Typography>
                        </Box>
                    }
                />

                {/* Campo para los botones iniciales, visible solo si el switch está activo */}
                {formData.enableRichUI && (
                    <TextField
                        margin="dense"
                        label="Botones de Bienvenida (Separados por comas)"
                        placeholder="Ej: Agendar Cita, Ver Menú, Ubicación"
                        type="text"
                        fullWidth
                        value={buttonsInput}
                        onChange={(e) => setButtonsInput(e.target.value)}
                        helperText="Estos botones aparecerán automáticamente junto al saludo inicial."
                        sx={{ mt: 2 }}
                    />
                )}
            </Box>

            {/* --- SECCIÓN CRM GRANULAR (ACTUALIZADA) --- */}
            <Box sx={{ mt: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="subtitle2" style={{ color: '#0f9d58' }}>Integración CRM (Google Sheets)</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TextField 
                    margin="dense" 
                    label="ID de la Hoja de Cálculo (Spreadsheet ID)" 
                    fullWidth 
                    value={spreadsheetId} 
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    helperText="Copia el ID de la URL de tu Google Sheet."
                />

                {spreadsheetId && (
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column' }}>
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={logAppointments} 
                                    onChange={(e) => setLogAppointments(e.target.checked)} 
                                    color="success" 
                                />
                            }
                            label="Registrar nuevas reservas (Al agendar)"
                        />
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={logConfirmations} 
                                    onChange={(e) => setLogConfirmations(e.target.checked)} 
                                    color="success" 
                                />
                            }
                            label="Registrar confirmaciones de asistencia (Al confirmar)"
                        />
                    </Box>
                )}
            </Box>

            {/* --- SECCIÓN DE RECORDATORIOS (NUEVA) --- */}
            <Box sx={{ mt: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="secondary">Recordatorios Automáticos</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControlLabel
                    control={
                        <Switch
                            checked={reminderEnabled}
                            onChange={(e) => setReminderEnabled(e.target.checked)}
                            color="secondary"
                        />
                    }
                    label="Enviar recordatorios automáticos a los clientes"
                />

                {reminderEnabled && (
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                         <TextField
                            label="Anticipación (Horas)"
                            type="number"
                            value={reminderHours}
                            onChange={(e) => setReminderHours(Number(e.target.value))}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">Horas antes</InputAdornment>,
                            }}
                            helperText="Ej: 24 para un día antes, 1 para una hora antes."
                        />
                        <TextField
                            label="Plantilla del Mensaje"
                            multiline
                            rows={2}
                            value={reminderMessage}
                            onChange={(e) => setReminderMessage(e.target.value)}
                            helperText="Usa {name} para el nombre del cliente y {time} para la hora de la cita."
                        />

                         {/* --- INTERRUPTOR DE CONFIRMACIÓN INTELIGENTE --- */}
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={interactiveReminders} 
                                    onChange={(e) => setInteractiveReminders(e.target.checked)} 
                                    color="success" 
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="bold">Confirmación Inteligente</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Envía botones de "Confirmar/Reprogramar" y actualiza el calendario si el cliente confirma.
                                    </Typography>
                                </Box>
                            }
                        />
                    </Box>
                )}
            </Box>

        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
            {isSaving ? <CircularProgress size={24} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientEditor;