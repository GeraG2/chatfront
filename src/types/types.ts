// File: src/types.ts

// --- INTERFACES GENERALES ---

export interface ConfigData {
  systemInstruction: string;
  geminiModel: string;
  maxHistoryTurns: number;
}

export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

export interface HistoryPart {
  text: string;
}

export interface TestPromptResponse {
  response: string; // O la estructura que estuvieras usando
}

// --- INTERFACES DE PRODUCTOS Y CHAT ---

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  stock: number | string;
}

export interface HistoryItem {
  role: 'user' | 'model';
  parts: HistoryPart[]; // Usamos la interfaz restaurada
}

export interface SessionData {
  history: HistoryItem[];
  systemInstruction: string;
}

export interface SessionListItem {
  id: string;
  platform: 'whatsapp' | 'messenger';
}

// --- NUEVA INTERFAZ PARA LOS CAMPOS PERSONALIZADOS DE LA AGENDA ---
export interface AppointmentField {
  key: string;        // ej: "phone"
  label: string;      // ej: "Teléfono de contacto"
  description: string; // Para la IA: "El número de teléfono del usuario"
  required: boolean;
}

export interface ServiceItem {
    title: string;
    subtitle: string;
    image_url: string;
    url: string;
}

// --- PERFIL DE CLIENTE (ACTUALIZADO) ---
export interface ClientProfile {
  clientId: string;
  clientName: string;
  platform: 'whatsapp' | 'messenger';
  systemInstruction: string;
  tools: any[];
  knowledgeBasePath: string;
  pageAccessToken: string;
  geminiModel: string;
  maxHistoryTurns: number;
  // --- CAMPOS ESPECÍFICOS DE WHATSAPP ---
  whatsappPhoneNumberId?: string;
  whatsappTokenSecretName?: string; // Nombre de la variable de entorno para el token
  // --------------------------------------
  
  // Configuración de Google Calendar (Opcional)
  googleAuth?: {
    accessToken: string;
    refreshToken: string;
    expiryDate: number;
  };
  
  // Ajustes del Calendario (Opcional)
  calendarSettings?: {
    calendarId: string;
    slotDuration: string;
    businessHoursStart: string;
    businessHoursEnd: string;
  };

  // Campos dinámicos para agendar (Nuevo)
  appointmentFields?: AppointmentField[];

  // Controla si el bot usa botones y elementos visuales o solo texto
  enableRichUI?: boolean;
  initialButtons?: string[]; // Lista de textos para los botones de bienvenida

  // Nuevo campo de catálogo
  services?: ServiceItem[]; // <-- Nuevo campo de catálogo

  // --- NUEVA CONFIGURACIÓN DE RECORDATORIOS ---
  reminderSettings?: {
    enabled: boolean;        // ¿Están activos?
    hoursBefore: number;     // ¿Cuántas horas antes avisar? (ej. 24)
    messageTemplate: string; // Mensaje (ej. "Hola {name}, recuerda tu cita mañana")
    interactiveReminders?: boolean; // <-- Nuevo interruptor
  };

  // --- ACTUALIZACIÓN: CRM GRANULAR ---
  crmSettings?: {
    spreadsheetId: string;
    logAppointments?: boolean;  // Guardar cuando se crea la cita
    logConfirmations?: boolean; // Guardar cuando se confirma
  };
}