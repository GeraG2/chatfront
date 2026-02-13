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
    InputAdornment,
    IconButton,
    Card,
    Grid,
    useTheme,
    alpha
} from '@mui/material';

// Iconos oficiales de Material UI
import SaveIcon from '@mui/icons-material/Save';
import ShieldIcon from '@mui/icons-material/Shield';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CodeIcon from '@mui/icons-material/Code';
import BuildIcon from '@mui/icons-material/Build'; // Icono para Habilidades

// TUS IMPORTACIONES ORIGINALES
import { API_BASE_URL } from '../../constants';
import { ClientProfile } from '../../types/types';

// Interfaces Auxiliares
interface ServiceItem {
    title: string;
    subtitle: string;
    image_url: string;
    url: string;
}

// Estructura para los campos personalizados de la herramienta de Ventas
interface OrderField {
    key: string;       // ej: "pieza"
    description: string; // ej: "Nombre de la refacción"
}

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
    geminiModel: 'gemini-2.0-flash',
    systemInstruction: '',
    maxHistoryTurns: 10,
    knowledgeBasePath: '',
    tools: [], // Se generará automáticamente
    enableRichUI: false,
    initialButtons: [],
    services: [], 
    reminderSettings: {
        enabled: false,
        hoursBefore: 24,
        messageTemplate: "Hola {name}, te recordamos tu cita para mañana a las {time}. ¿Confirmas tu asistencia?",
        interactiveReminders: false
    },
    crmSettings: {
        spreadsheetId: "",
        logAppointments: false,
        logConfirmations: false
    }
};

const ClientEditor: React.FC<ClientEditorProps> = ({ open, onClose, onSave, clientToEdit }) => {
    const theme = useTheme();
    const [formData, setFormData] = useState<Partial<ClientProfile>>(emptyClient);
    
    // Estados UI
    const [buttonsInput, setButtonsInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- ESTADOS DEL CONSTRUCTOR DE HERRAMIENTAS (Visual) ---
    const [toolSchedule, setToolSchedule] = useState(false); // Herramienta de Agenda
    const [toolSearch, setToolSearch] = useState(true);      // Herramienta de Búsqueda (Default ON)
    const [toolSales, setToolSales] = useState(false);       // Herramienta de Pedidos/CRM
    const [salesFields, setSalesFields] = useState<OrderField[]>([
        { key: 'pieza', description: 'Nombre del producto o servicio solicitado' }
    ]);
    const [toolsJsonPreview, setToolsJsonPreview] = useState(''); // Solo para visualizar/debug

    // Estados Recordatorios/CRM
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderHours, setReminderHours] = useState(24);
    const [reminderMessage, setReminderMessage] = useState('');
    const [interactiveReminders, setInteractiveReminders] = useState(false);
    const [spreadsheetId, setSpreadsheetId] = useState('');
    const [logAppointments, setLogAppointments] = useState(false);
    const [logConfirmations, setLogConfirmations] = useState(false);
    
    const isEditing = !!clientToEdit;

    // --- CARGA INICIAL ---
    useEffect(() => {
        if (open) {
            setError(null);
            if (isEditing && clientToEdit) {
                setFormData({
                    ...clientToEdit,
                    enableRichUI: clientToEdit.enableRichUI || false,
                    services: clientToEdit.services || [],
                });
                setButtonsInput(clientToEdit.initialButtons?.join(', ') || '');
                
                // Configuración CRM/Recordatorios
                const remSettings = clientToEdit.reminderSettings || emptyClient.reminderSettings!;
                setReminderEnabled(remSettings.enabled);
                setReminderHours(remSettings.hoursBefore);
                setReminderMessage(remSettings.messageTemplate);
                setInteractiveReminders(remSettings.interactiveReminders || false);

                const crmSettings = clientToEdit.crmSettings || emptyClient.crmSettings!;
                setSpreadsheetId(crmSettings.spreadsheetId || '');
                setLogAppointments(crmSettings.logAppointments || false);
                setLogConfirmations(crmSettings.logConfirmations || false);

                // --- INGENIERÍA INVERSA: DETECTAR HERRAMIENTAS ACTIVAS ---
                // Analizamos el JSON existente para prender los switches correctos
                const existingTools = clientToEdit.tools?.[0]?.functionDeclarations || [];
                
                setToolSchedule(existingTools.some((t: any) => t.name === 'scheduleAppointment'));
                setToolSearch(existingTools.some((t: any) => t.name === 'searchKnowledgeBase'));
                
                const salesTool = existingTools.find((t: any) => t.name === 'registerOrder');
                if (salesTool) {
                    setToolSales(true);
                    // Extraer campos personalizados del JSON
                    const props = salesTool.parameters?.properties || {};
                    const extractedFields: OrderField[] = [];
                    // Filtramos los campos estándar para dejar solo los personalizados
                    const standard = ['name', 'phone', 'tipo_movimiento', 'date', 'time'];
                    Object.keys(props).forEach(key => {
                        if (!standard.includes(key)) {
                            extractedFields.push({ key, description: props[key].description });
                        }
                    });
                    if (extractedFields.length > 0) setSalesFields(extractedFields);
                } else {
                    setToolSales(false);
                    setSalesFields([{ key: 'pieza', description: 'Nombre del producto o servicio' }]);
                }

                // Generar preview inicial
                setToolsJsonPreview(JSON.stringify(clientToEdit.tools || [], null, 2));

            } else {
                // Reset para nuevo cliente
                setFormData(emptyClient);
                setButtonsInput('');
                setToolSchedule(false);
                setToolSearch(true);
                setToolSales(false);
                setSalesFields([{ key: 'pieza', description: 'Nombre del producto o servicio' }]);
                setToolsJsonPreview('[]');
                
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
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // --- GESTIÓN DE CAMPOS DE VENTA (VISUAL) ---
    const addSalesField = () => {
        setSalesFields([...salesFields, { key: '', description: '' }]);
    };
    const removeSalesField = (index: number) => {
        const updated = salesFields.filter((_, i) => i !== index);
        setSalesFields(updated);
    };
    const updateSalesField = (index: number, field: keyof OrderField, value: string) => {
        const updated = [...salesFields];
        updated[index][field] = value;
        setSalesFields(updated);
    };

    // --- FABRICANTE DE JSON (AUTO-BUILDER) ---
    const buildToolsJSON = () => {
        const functions = [];

        // 1. Herramienta de Búsqueda (Base de Conocimiento)
        if (toolSearch) {
            functions.push({
                name: "searchKnowledgeBase",
                description: "Busca precios, existencias o información del negocio.",
                parameters: {
                    type: "object",
                    properties: { itemName: { type: "string", description: "Término a buscar." } }
                }
            });
        }

        // 2. Herramienta de Citas (Calendar)
        if (toolSchedule) {
            functions.push({
                name: "scheduleAppointment",
                description: "Agenda una cita en el calendario. Requiere fecha y hora.",
                parameters: {
                    type: "object",
                    properties: {
                        date: { type: "string", description: "Fecha y hora (ISO 8601)." },
                        name: { type: "string", description: "Nombre del cliente." },
                        phone: { type: "string", description: "Teléfono." }
                    },
                    required: ["date", "name"]
                }
            });
            // Agregamos el helper de disponibilidad si hay agenda
            functions.push({
                name: "checkAvailability",
                description: "Consulta horarios disponibles.",
                parameters: {
                    type: "object",
                    properties: { date: { type: "string", description: "Fecha a consultar." } }
                }
            });
        }

        // 3. Herramienta de Ventas/Pedidos (CRM Dinámico)
        if (toolSales) {
            const properties: any = {
                name: { type: "string", description: "Nombre del cliente." },
                phone: { type: "string", description: "Teléfono." },
                tipo_movimiento: { type: "string", description: "Tipo de operación (Venta/Pedido)." }
            };
            const required = ["name", "phone", "tipo_movimiento"];

            // Inyectamos los campos visuales que creó el usuario
            salesFields.forEach(field => {
                if (field.key && field.description) {
                    properties[field.key] = { type: "string", description: field.description };
                    required.push(field.key); // Los hacemos obligatorios por defecto
                }
            });

            functions.push({
                name: "registerOrder",
                description: "Registra un pedido o venta en el CRM. Pide todos los datos requeridos.",
                parameters: {
                    type: "object",
                    properties: properties,
                    required: required
                }
            });
        }

        // 4. Herramienta de Confirmación (Siempre útil si hay CRM)
        if (toolSchedule || toolSales) {
             functions.push({
                 name: "confirmAppointment",
                 description: "Usa esta herramienta cuando el usuario confirme explícitamente su asistencia.",
                 parameters: {
                     type: "object",
                     properties: {
                         name: { type: "string", description: "Nombre del cliente." }
                     },
                     required: ["name"]
                 }
            });
        }

        // Si no hay herramientas, devolvemos array vacío, si hay, envolvemos en estructura de Gemini
        return functions.length > 0 ? [{ functionDeclarations: functions }] : [];
    };

    // Actualizar preview del JSON cuando cambian los switches (Efecto visual solamente)
    useEffect(() => {
        if (open) {
            const json = buildToolsJSON();
            setToolsJsonPreview(JSON.stringify(json, null, 2));
        }
    }, [toolSchedule, toolSearch, toolSales, salesFields, open]);


    // --- LÓGICA DEL CATÁLOGO VISUAL (RESTAURADA) ---
    const addService = () => {
        setFormData(prev => ({
            ...prev,
            services: [...(prev.services || []), { title: '', subtitle: '', image_url: '', url: '' }]
        }));
    };

    const removeService = (index: number) => {
        const newServices = (formData.services || []).filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, services: newServices }));
    };

    const updateService = (index: number, field: keyof ServiceItem, value: string) => {
        const newServices = [...(formData.services || [])];
        if (newServices[index]) {
            newServices[index] = { ...newServices[index], [field]: value };
            setFormData(prev => ({ ...prev, services: newServices }));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);

        const processedButtons = buttonsInput
            .split(',')
            .map(btn => btn.trim())
            .filter(btn => btn.length > 0);

        // GENERACIÓN AUTOMÁTICA DEL JSON DE HERRAMIENTAS
        // Aquí ocurre la magia: convertimos los switches en código
        const autoGeneratedTools = buildToolsJSON();

        const payload = {
            ...formData,
            initialButtons: processedButtons,
            tools: autoGeneratedTools, // <--- Se inyecta el JSON generado
            reminderSettings: {
                enabled: reminderEnabled,
                hoursBefore: Number(reminderHours),
                messageTemplate: reminderMessage,
                interactiveReminders: interactiveReminders
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
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Error al guardar el cliente');
            onSave();
            onClose();
        } catch (error) {
            console.error("Error al guardar cliente:", error);
            setError("Hubo un problema al guardar los datos.");
        } finally {
            setIsSaving(false);
        }
    };

    const renderPlatformFields = () => {
        if (formData.platform === 'whatsapp') {
            return (
                <>
                    <TextField
                        margin="dense"
                        name="whatsappPhoneNumberId"
                        label="WhatsApp Phone Number ID"
                        type="text"
                        fullWidth
                        value={formData.whatsappPhoneNumberId || ''}
                        onChange={handleChange}
                        helperText="El ID del número de teléfono en Meta Business."
                    />
                    <TextField
                        margin="dense"
                        name="whatsappTokenSecretName"
                        label="Nombre de Variable del Token"
                        placeholder="WHATSAPP_TOKEN_CLIENTE_1"
                        type="text"
                        fullWidth
                        value={formData.whatsappTokenSecretName || ''}
                        onChange={handleChange}
                        helperText="Nombre de la variable en .env que contiene el token permanente."
                    />
                </>
            );
        } else {
            return (
                <TextField
                    margin="dense"
                    name="pageAccessToken"
                    label="Messenger Page Access Token (Variable)"
                    placeholder="BARBERIA_MESSENGER_TOKEN"
                    type="text"
                    fullWidth
                    value={formData.pageAccessToken || ''}
                    onChange={handleChange}
                    helperText="Nombre de la variable en .env o el token directo."
                />
            );
        }
    };

    const handleConnectCalendar = () => {
       if (!formData.clientId) {
           setError("⚠️ Primero debes guardar el cliente o asignar un ID antes de conectar.");
           return;
       }
       const authUrl = `${API_BASE_URL}/api/google/auth/start/${formData.clientId}`;
       const width = 500;
       const height = 600;
       const left = window.screen.width / 2 - width / 2;
       const top = window.screen.height / 2 - height / 2;
       window.open(authUrl, 'Conectar Google', `width=${width},height=${height},top=${top},left=${left}`);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShieldIcon color="primary" />
                {isEditing ? `Configuración: ${formData.clientName}` : 'Añadir Nuevo Cliente'}
            </DialogTitle>
            
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    
                    {/* Identidad */}
                    <Box>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>IDENTIDAD DEL CANAL</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Nombre de la Empresa"
                                    name="clientName"
                                    fullWidth
                                    value={formData.clientName || ''}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="ID de Página / Teléfono"
                                    name="clientId"
                                    fullWidth
                                    disabled={isEditing}
                                    value={formData.clientId || ''}
                                    onChange={handleChange}
                                    helperText={isEditing ? "No editable" : "ID de Facebook o WhatsApp"}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Plataforma</InputLabel>
                                    <Select name="platform" value={formData.platform || 'messenger'} label="Plataforma" onChange={handleChange}>
                                        <MenuItem value="messenger">Messenger</MenuItem>
                                        <MenuItem value="whatsapp">WhatsApp</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Modelo Gemini</InputLabel>
                                    <Select name="geminiModel" value={formData.geminiModel || 'gemini-2.0-flash'} label="Modelo Gemini" onChange={handleChange}>
                                        <MenuItem value="gemini-1.5-flash">Gemini 1.5 Flash</MenuItem>
                                        <MenuItem value="gemini-2.0-flash">Gemini 2.0 Flash</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Credenciales */}
                    <Box sx={{ p: 2, bgcolor: theme.palette.action.hover, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        {renderPlatformFields()}
                    </Box>

                    {/* Conocimiento */}
                    <Box>
                        <TextField
                            label="Base de Conocimiento (Archivo JSON)"
                            name="knowledgeBasePath"
                            fullWidth
                            value={formData.knowledgeBasePath || ''}
                            onChange={handleChange}
                            placeholder="ej: catalogo.json"
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Instrucciones del Sistema"
                            name="systemInstruction"
                            fullWidth
                            multiline
                            rows={6}
                            value={formData.systemInstruction || ''}
                            onChange={handleChange}
                            helperText="Define cómo debe comportarse el bot."
                        />
                    </Box>

                    {/* --- CONSTRUCTOR DE HERRAMIENTAS (VISUAL) --- */}
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BuildIcon fontSize="small" /> HABILIDADES DEL BOT
                        </Typography>

                        {/* Habilidad: Búsqueda */}
                        <FormControlLabel 
                            control={<Switch checked={toolSearch} onChange={(e) => setToolSearch(e.target.checked)} />} 
                            label={<Box><Typography variant="body2" fontWeight="bold">Responder dudas del negocio</Typography><Typography variant="caption" color="text.secondary">Usa el archivo JSON para buscar precios e info.</Typography></Box>} 
                            sx={{ mb: 2 }}
                        />
                        <Divider sx={{ my: 1 }} />

                        {/* Habilidad: Agenda */}
                        <FormControlLabel 
                            control={<Switch checked={toolSchedule} onChange={(e) => setToolSchedule(e.target.checked)} />} 
                            label={<Box><Typography variant="body2" fontWeight="bold">Agendar Citas (Google Calendar)</Typography><Typography variant="caption" color="text.secondary">Permite consultar horarios y crear eventos.</Typography></Box>} 
                            sx={{ mb: 2 }}
                        />
                        <Divider sx={{ my: 1 }} />

                        {/* Habilidad: Ventas/Pedidos */}
                        <FormControlLabel 
                            control={<Switch checked={toolSales} onChange={(e) => setToolSales(e.target.checked)} color="warning" />} 
                            label={<Box><Typography variant="body2" fontWeight="bold">Registrar Ventas/Pedidos (CRM)</Typography><Typography variant="caption" color="text.secondary">Guarda pedidos en Google Sheets.</Typography></Box>} 
                        />

                        {/* Configuración de Campos de Venta (Solo si está activo) */}
                        {toolSales && (
                            <Box sx={{ mt: 2, ml: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed #ccc' }}>
                                <Typography variant="caption" fontWeight="bold" sx={{ mb: 1, display: 'block', color: 'warning.main' }}>¿Qué datos EXTRA debe pedir el bot?</Typography>
                                {salesFields.map((field, index) => (
                                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                        <TextField size="small" label="Variable (ej. pieza)" value={field.key} onChange={(e) => updateSalesField(index, 'key', e.target.value)} sx={{ width: '30%' }} />
                                        <TextField size="small" label="Instrucción (ej. Qué pieza busca)" value={field.description} onChange={(e) => updateSalesField(index, 'description', e.target.value)} fullWidth />
                                        <IconButton size="small" color="error" onClick={() => removeSalesField(index)}><DeleteIcon /></IconButton>
                                    </Box>
                                ))}
                                <Button size="small" startIcon={<AddIcon />} onClick={addSalesField} color="warning">Añadir Campo</Button>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>* Nombre, Teléfono y Tipo se piden automáticamente.</Typography>
                            </Box>
                        )}
                        
                        {/* Preview del JSON Generado (Solo lectura) */}
                        <Box sx={{ mt: 2 }}>
                             <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'text.disabled', fontFamily: 'monospace' }}>JSON Generado (Automático):</Typography>
                             <TextField
                                fullWidth
                                multiline
                                rows={2}
                                size="small"
                                value={toolsJsonPreview}
                                disabled
                                sx={{ bgcolor: alpha(theme.palette.action.disabled, 0.05) }}
                                InputProps={{ style: { fontSize: '0.7rem', fontFamily: 'monospace' } }}
                             />
                        </Box>
                    </Box>

                    {/* Catálogo Visual */}
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, fontWeight: 'bold' }}>CATÁLOGO VISUAL (TARJETAS)</Typography>
                            <Button 
                                size="small" 
                                startIcon={<AddIcon />} 
                                onClick={addService}
                                variant="outlined"
                                color="secondary"
                            >
                                Añadir Tarjeta
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        
                        {(formData.services || []).length === 0 ? (
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ 
                                py: 2, 
                                bgcolor: theme.palette.action.hover, 
                                borderRadius: 1, 
                                border: '1px dashed', 
                                borderColor: 'divider' 
                            }}>
                                No hay servicios configurados.
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {(formData.services || []).map((service, index) => (
                                    <Card key={index} variant="outlined" sx={{ p: 2, position: 'relative', bgcolor: 'background.paper' }}>
                                        <IconButton 
                                            size="small" 
                                            color="error" 
                                            onClick={() => removeService(index)}
                                            sx={{ position: 'absolute', top: 8, right: 8 }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                        
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Título del Servicio"
                                                    fullWidth
                                                    size="small"
                                                    value={service.title}
                                                    onChange={(e) => updateService(index, 'title', e.target.value)}
                                                    sx={{ mb: 2 }}
                                                />
                                                <TextField
                                                    label="Descripción corta"
                                                    fullWidth
                                                    size="small"
                                                    multiline
                                                    rows={2}
                                                    value={service.subtitle}
                                                    onChange={(e) => updateService(index, 'subtitle', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="URL de la Imagen"
                                                    fullWidth
                                                    size="small"
                                                    placeholder="https://..."
                                                    value={service.image_url}
                                                    onChange={(e) => updateService(index, 'image_url', e.target.value)}
                                                    InputProps={{ startAdornment: <ImageIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
                                                    sx={{ mb: 2 }}
                                                />
                                                <TextField
                                                    label="URL de Acción (Opcional)"
                                                    fullWidth
                                                    size="small"
                                                    placeholder="[https://tupagina.com](https://tupagina.com)"
                                                    value={service.url}
                                                    onChange={(e) => updateService(index, 'url', e.target.value)}
                                                    InputProps={{ startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* CRM & Recordatorios */}
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" color="success.main" sx={{ mb: 1, fontWeight: 'bold' }}>OPCIONES DE CRM & AGENDA</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField 
                                    label="Google Sheet ID (Para agenda)" 
                                    fullWidth 
                                    value={spreadsheetId} 
                                    onChange={(e) => setSpreadsheetId(e.target.value)} 
                                    helperText="ID de la hoja de cálculo para guardar citas"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton 
                                                    onClick={handleConnectCalendar} 
                                                    edge="end" 
                                                    title="Conectar cuenta de Google"
                                                    color={spreadsheetId ? "success" : "primary"}
                                                >
                                                    <CalendarTodayIcon /> 
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                            
                            {spreadsheetId && (
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 1 }}>
                                        <FormControlLabel
                                            control={<Switch checked={logAppointments} onChange={(e) => setLogAppointments(e.target.checked)} color="success" size="small" />}
                                            label="Registrar nuevas reservas (Al agendar)"
                                        />
                                        <FormControlLabel
                                            control={<Switch checked={logConfirmations} onChange={(e) => setLogConfirmations(e.target.checked)} color="success" size="small" />}
                                            label="Registrar confirmaciones de asistencia"
                                        />
                                    </Box>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Box sx={{ 
                                    p: 2, 
                                    border: '1px solid',
                                    borderColor: 'divider', 
                                    borderRadius: 1, 
                                    bgcolor: reminderEnabled ? alpha(theme.palette.success.main, 0.08) : 'transparent' 
                                }}>
                                    <FormControlLabel
                                        control={<Switch checked={reminderEnabled} onChange={(e) => setReminderEnabled(e.target.checked)} color="success" />}
                                        label={<Typography fontWeight="bold">Activar Recordatorios Automáticos</Typography>}
                                    />
                                    
                                    {reminderEnabled && (
                                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, pl: 2, borderLeft: `3px solid ${theme.palette.success.main}` }}>
                                            <TextField
                                                label="Anticipación (Horas antes de la cita)"
                                                type="number"
                                                size="small"
                                                value={reminderHours}
                                                onChange={(e) => setReminderHours(Number(e.target.value))}
                                                InputProps={{ 
                                                    endAdornment: <InputAdornment position="end">Horas</InputAdornment>,
                                                    startAdornment: <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                }}
                                            />
                                            <TextField
                                                label="Plantilla del Mensaje"
                                                multiline
                                                rows={2}
                                                fullWidth
                                                size="small"
                                                value={reminderMessage}
                                                onChange={(e) => setReminderMessage(e.target.value)}
                                                helperText="Variables disponibles: {name}, {time}"
                                            />
                                            <FormControlLabel
                                                control={<Switch checked={interactiveReminders} onChange={(e) => setInteractiveReminders(e.target.checked)} color="success" size="small" />}
                                                label={
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">Confirmación Interactiva</Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                            Añade botones de "Confirmar" y "Reagendar" al mensaje.
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </Box>
                                    )}
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch checked={formData.enableRichUI || false} name="enableRichUI" onChange={handleChange} />}
                                    label="Activar Botones de Bienvenida (Rich UI)"
                                />
                                {formData.enableRichUI && (
                                    <TextField
                                        margin="dense"
                                        label="Botones de Bienvenida (Separados por comas)"
                                        placeholder="Ej: Agendar Cita, Ver Menú, Ubicación"
                                        fullWidth
                                        size="small"
                                        value={buttonsInput}
                                        onChange={(e) => setButtonsInput(e.target.value)}
                                        helperText="Aparecen automáticamente al iniciar el chat."
                                        sx={{ mt: 1 }}
                                    />
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={isSaving}
                >
                    Guardar Cambios
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ClientEditor;